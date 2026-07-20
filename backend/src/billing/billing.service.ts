import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  BillingProviderEventStatus,
  InvoiceStatus,
  PaymentIntentStatus,
  Prisma,
  QuoteStatus,
  Role,
} from '@prisma/client';

import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { PatientsService } from '../patients/patients.service';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { publicUserSelect } from '../users/user.select';
import { ApproveQuoteDto } from './dto/approve-quote.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ProviderEventDto } from './dto/provider-event.dto';
import { BillingProviderAdapter } from './billing-provider.adapter';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patientsService: PatientsService,
    private readonly securityService: SecurityService,
    private readonly auditLogsService: AuditLogsService,
    private readonly providerAdapter: BillingProviderAdapter,
    private readonly configService: ConfigService,
  ) {}

  async summary(user: RequestUser, clinicId?: string) {
    const scope = await this.getBillingScope(user, clinicId);

    const [quotes, invoices, paymentIntents] = await this.prisma.$transaction([
      this.prisma.quote.groupBy({
        by: ['status'],
        where: scope.quoteWhere,
        _count: { id: true },
        _sum: { amount: true },
      }),
      this.prisma.invoice.groupBy({
        by: ['status'],
        where: scope.invoiceWhere,
        _count: { id: true },
        _sum: { amount: true },
      }),
      this.prisma.paymentIntent.groupBy({
        by: ['status'],
        where: scope.paymentIntentWhere,
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    return { quotes, invoices, paymentIntents };
  }

  async listQuotes(user: RequestUser, clinicId?: string) {
    const { quoteWhere } = await this.getBillingScope(user, clinicId);

    return this.prisma.quote.findMany({
      where: quoteWhere,
      include: {
        patient: {
          include: {
            user: {
              select: publicUserSelect,
            },
          },
        },
        clinic: true,
        invoices: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listInvoices(user: RequestUser, clinicId?: string) {
    const { invoiceWhere } = await this.getBillingScope(user, clinicId);

    return this.prisma.invoice.findMany({
      where: invoiceWhere,
      include: {
        patient: {
          include: {
            user: {
              select: publicUserSelect,
            },
          },
        },
        clinic: true,
        quote: true,
        paymentIntents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveQuote(user: RequestUser, quoteId: string, dto: ApproveQuoteDto) {
    await this.securityService.verifyStepUp(user.userId, dto.stepUpCode);
    const quote = await this.getQuoteForUserOrThrow(user, quoteId);
    const invoiceNumber = `INV-${Date.now()}-${quote.id.slice(0, 8)}`;

    const result = await this.prisma.$transaction(async (tx) => {
      const approvedQuote = await tx.quote.update({
        where: { id: quote.id },
        data: {
          status: QuoteStatus.APPROVED,
          approvedAt: new Date(),
        },
      });
      const invoice = await tx.invoice.create({
        data: {
          patientId: quote.patientId,
          clinicId: quote.clinicId,
          quoteId: quote.id,
          number: invoiceNumber,
          currency: quote.currency,
          amount: quote.amount,
          status: InvoiceStatus.ISSUED,
          issuedAt: new Date(),
        },
      });

      return { quote: approvedQuote, invoice };
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'billing_quote_approve',
      entityType: 'Quote',
      entityId: quoteId,
      metadata: { invoiceId: result.invoice.id },
    });

    return result;
  }

  async createPaymentIntent(user: RequestUser, dto: CreatePaymentIntentDto) {
    if (user.role !== Role.PATIENT) {
      throw new ForbiddenException('Only patients can create payment intents');
    }

    await this.securityService.verifyStepUp(user.userId, dto.stepUpCode);
    const patientId = await this.getPatientScopeOrThrow(user);
    const invoice = dto.invoiceId
      ? await this.prisma.invoice.findUnique({ where: { id: dto.invoiceId } })
      : null;

    if (dto.invoiceId && !invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice && invoice.patientId !== patientId && user.role === Role.PATIENT) {
      throw new ForbiddenException('Invoice does not belong to patient');
    }

    const amount = invoice?.amount ?? dto.amount;

    if (!amount) {
      throw new BadRequestException('amount is required when invoiceId is omitted');
    }

    const paymentIntent = await this.prisma.paymentIntent.create({
      data: {
        patientId: invoice?.patientId ?? patientId,
        invoiceId: invoice?.id,
        provider: dto.provider ?? 'internal',
        currency: invoice?.currency ?? dto.currency ?? 'MAD',
        amount,
        status: PaymentIntentStatus.PENDING,
      },
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'billing_payment_intent_create',
      entityType: 'PaymentIntent',
      entityId: paymentIntent.id,
      metadata: {
        provider: paymentIntent.provider,
        invoiceId: paymentIntent.invoiceId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });

    return paymentIntent;
  }

  async ingestProviderEvent(
    dto: ProviderEventDto,
    signature?: string,
    timestamp?: string,
  ) {
    this.verifyProviderEventSignature(dto, signature, timestamp);

    const paymentIntent = dto.providerIntentId
      ? await this.prisma.paymentIntent.findFirst({
          where: {
            provider: dto.provider,
            providerIntentId: dto.providerIntentId,
          },
        })
      : null;
    const mappedStatus = this.providerAdapter.mapPaymentStatus(dto.payload);
    const existingEvent = await this.prisma.billingProviderEvent.findFirst({
      where: {
        provider: dto.provider,
        providerEventId: dto.providerEventId,
      },
      select: {
        id: true,
        paymentIntentId: true,
      },
    });

    if (existingEvent) {
      return {
        eventId: existingEvent.id,
        paymentIntentId: existingEvent.paymentIntentId,
        duplicate: true,
      };
    }

    const event = await this.prisma.billingProviderEvent.create({
      data: {
        provider: dto.provider,
        providerEventId: dto.providerEventId,
        paymentIntentId: paymentIntent?.id,
        payload: dto.payload as Prisma.InputJsonValue,
      },
    });

    if (paymentIntent && mappedStatus) {
      await this.prisma.paymentIntent.update({
        where: { id: paymentIntent.id },
        data: {
          status: mappedStatus,
          updatedAt: new Date(),
        },
      });
    }

    await this.prisma.billingProviderEvent.update({
      where: { id: event.id },
      data: {
        status: BillingProviderEventStatus.PROCESSED,
        processedAt: new Date(),
      },
    });

    await this.auditLogsService.create({
      actorId: null,
      action: 'billing_provider_event',
      entityType: 'BillingProviderEvent',
      entityId: event.id,
      metadata: {
        provider: dto.provider,
        paymentIntentId: paymentIntent?.id ?? null,
        mappedStatus: mappedStatus ?? null,
      },
    });

    return { eventId: event.id, paymentIntentId: paymentIntent?.id ?? null };
  }

  private verifyProviderEventSignature(
    dto: ProviderEventDto,
    signature?: string,
    timestamp?: string,
  ) {
    const secret = this.configService.get<string>(
      'billing.providerWebhookSecret',
    );

    if (!secret) {
      throw new UnauthorizedException('Billing provider webhook is not configured');
    }

    if (!signature || !timestamp) {
      throw new UnauthorizedException('Missing provider webhook signature');
    }

    const timestampMs = Number(timestamp) * 1000;
    const fiveMinutesMs = 5 * 60 * 1000;

    if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > fiveMinutesMs) {
      throw new UnauthorizedException('Provider webhook timestamp is outside the replay window');
    }

    const receivedSignature = signature.startsWith('sha256=')
      ? signature.slice('sha256='.length)
      : signature;

    if (!/^[a-f0-9]{64}$/i.test(receivedSignature)) {
      throw new UnauthorizedException('Invalid provider webhook signature');
    }

    const expectedSignature = createHmac('sha256', secret)
      .update(`${timestamp}.${this.canonicalJson(dto)}`)
      .digest('hex');
    const received = Buffer.from(receivedSignature, 'hex');
    const expected = Buffer.from(expectedSignature, 'hex');

    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      throw new UnauthorizedException('Invalid provider webhook signature');
    }
  }

  private canonicalJson(value: unknown): string {
    return JSON.stringify(this.sortJsonValue(value));
  }

  private sortJsonValue(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sortJsonValue(item));
    }

    if (value && typeof value === 'object') {
      return Object.keys(value as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((sorted, key) => {
          sorted[key] = this.sortJsonValue((value as Record<string, unknown>)[key]);
          return sorted;
        }, {});
    }

    return value;
  }

  private async getQuoteForUserOrThrow(user: RequestUser, quoteId: string) {
    const quote = await this.prisma.quote.findUnique({ where: { id: quoteId } });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    if (user.role === Role.PATIENT) {
      const patient = await this.patientsService.getProfileByUserIdOrThrow(
        user.userId,
      );

      if (quote.patientId !== patient.id) {
        throw new ForbiddenException('Quote does not belong to patient');
      }
    }

    if (user.role === Role.CLINIC_ADMIN) {
      const clinicId = await this.getClinicAdminScopeOrThrow(user);

      if (quote.clinicId !== clinicId) {
        throw new ForbiddenException('Quote does not belong to clinic');
      }
    }

    if (user.role === Role.PROFESSIONAL) {
      throw new ForbiddenException('Professionals do not have billing access');
    }

    return quote;
  }

  private async getBillingScope(
    user: RequestUser,
    clinicId?: string,
  ): Promise<{
    quoteWhere: Prisma.QuoteWhereInput;
    invoiceWhere: Prisma.InvoiceWhereInput;
    paymentIntentWhere: Prisma.PaymentIntentWhereInput;
  }> {
    if (user.role === Role.PATIENT) {
      const patientId = await this.getPatientScopeOrThrow(user);

      return {
        quoteWhere: { patientId },
        invoiceWhere: { patientId },
        paymentIntentWhere: { patientId },
      };
    }

    if (user.role === Role.CLINIC_ADMIN) {
      const scopedClinicId = await this.getClinicAdminScopeOrThrow(user, clinicId);

      return {
        quoteWhere: { clinicId: scopedClinicId },
        invoiceWhere: { clinicId: scopedClinicId },
        paymentIntentWhere: {
          OR: [
            {
              invoice: {
                clinicId: scopedClinicId,
              },
            },
            {
              patient: {
                invoices: {
                  some: {
                    clinicId: scopedClinicId,
                  },
                },
              },
            },
          ],
        },
      };
    }

    if (user.role === Role.PROFESSIONAL) {
      throw new ForbiddenException('Professionals do not have billing access');
    }

    if (user.role === Role.SUPER_ADMIN && clinicId) {
      return {
        quoteWhere: { clinicId },
        invoiceWhere: { clinicId },
        paymentIntentWhere: {
          OR: [
            {
              invoice: {
                clinicId,
              },
            },
            {
              patient: {
                invoices: {
                  some: {
                    clinicId,
                  },
                },
              },
            },
          ],
        },
      };
    }

    return {
      quoteWhere: {},
      invoiceWhere: {},
      paymentIntentWhere: {},
    };
  }

  private async getPatientScopeOrThrow(user: RequestUser) {
    const patient = await this.patientsService.getProfileByUserIdOrThrow(
      user.userId,
    );

    return patient.id;
  }

  private async getClinicAdminScopeOrThrow(
    user: RequestUser,
    clinicId?: string,
  ) {
    const membership = await this.prisma.clinicMember.findFirst({
      where: {
        userId: user.userId,
        role: Role.CLINIC_ADMIN,
        ...(clinicId ? { clinicId } : {}),
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        clinicId: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have billing access for this clinic');
    }

    return membership.clinicId;
  }
}
