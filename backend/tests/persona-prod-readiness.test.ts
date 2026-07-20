import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';

import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PaymentIntentStatus, Role } from '@prisma/client';

import { AppointmentsService } from '../src/appointments/appointments.service';
import { BillingProviderAdapter } from '../src/billing/billing-provider.adapter';
import { BillingService } from '../src/billing/billing.service';
import { ClinicsService } from '../src/clinics/clinics.service';
import { ProfessionalsService } from '../src/professionals/professionals.service';

const auditLogs = {
  create: async () => undefined,
};

const security = {
  verifyStepUp: async () => undefined,
};

const billingWebhookSecret = 'test-webhook-secret-with-at-least-32-chars';
const configService = {
  get: (key: string) =>
    key === 'billing.providerWebhookSecret' ? billingWebhookSecret : undefined,
};

function canonicalJson(value: unknown): string {
  return JSON.stringify(sortJsonValue(value));
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortJsonValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((sorted, key) => {
        sorted[key] = sortJsonValue((value as Record<string, unknown>)[key]);
        return sorted;
      }, {});
  }

  return value;
}

test('clinic client patient list is scoped to the authenticated clinic membership', async () => {
  const requestedPatientWheres: Array<Record<string, unknown>> = [];
  const prisma = {
    clinicMember: {
      findMany: async ({ where }: { where: { clinicId?: string } }) => {
        if (where.clinicId === 'clinic-b') return [];

        return [
          {
            id: 'membership-a',
            clinicId: 'clinic-a',
            userId: 'clinic-admin',
            role: Role.CLINIC_ADMIN,
            createdAt: new Date('2026-01-01'),
            user: { id: 'clinic-admin', role: Role.CLINIC_ADMIN },
            clinic: { id: 'clinic-a', name: 'Clinic A' },
          },
        ];
      },
    },
    patientProfile: {
      findMany: async ({ where }: { where: Record<string, unknown> }) => {
        requestedPatientWheres.push(where);

        return [{ id: 'patient-a', userId: 'patient-user-a' }];
      },
      count: async () => 1,
    },
    $transaction: async (operations: Array<unknown>) => Promise.all(operations),
  };
  const service = new ClinicsService(prisma as never);

  const result = await service.listPatients(
    { userId: 'clinic-admin', role: Role.CLINIC_ADMIN },
    { page: 1, limit: 20 },
  );

  assert.equal(result.data.length, 1);
  assert.match(JSON.stringify(requestedPatientWheres[0]), /clinic-a/);
  await assert.rejects(
    () =>
      service.listPatients(
        { userId: 'clinic-admin', role: Role.CLINIC_ADMIN },
        { page: 1, limit: 20 },
        'clinic-b',
      ),
    ForbiddenException,
  );
});

test('professional patient files are available only for assigned patients', async () => {
  const prisma = {
    professionalProfile: {
      findUnique: async () => ({
        id: 'professional-profile',
        userId: 'professional-user',
        user: { id: 'professional-user', role: Role.PROFESSIONAL },
      }),
    },
    patientProfile: {
      findFirst: async ({ where }: { where: { id: string } }) =>
        where.id === 'assigned-patient'
          ? { id: 'assigned-patient', userId: 'assigned-user' }
          : null,
    },
    careRequest: {
      findMany: async () => [],
    },
    appointment: {
      findMany: async () => [],
    },
    medicalDocument: {
      findMany: async () => [],
    },
    clinicalNote: {
      findMany: async () => [],
    },
    $transaction: async (operations: Array<unknown>) => Promise.all(operations),
  };
  const service = new ProfessionalsService(prisma as never);

  const assigned = await service.getPatientFile(
    'professional-user',
    'assigned-patient',
    { page: 1, limit: 20 },
  );

  assert.equal(assigned.data.patient.id, 'assigned-patient');
  await assert.rejects(
    () =>
      service.getPatientFile('professional-user', 'unassigned-patient', {
        page: 1,
        limit: 20,
      }),
    NotFoundException,
  );
});

test('billing is patient scoped, clinic scoped, and hidden from professionals', async () => {
  const calls: Array<Record<string, unknown>> = [];
  const prisma = {
    clinicMember: {
      findFirst: async () => ({ clinicId: 'clinic-a' }),
    },
    quote: {
      findMany: async ({
        where,
        include,
      }: {
        where: Record<string, unknown>;
        include: Record<string, unknown>;
      }) => {
        calls.push({ model: 'quote', where, include });
        return [];
      },
    },
    invoice: {
      findMany: async ({
        where,
        include,
      }: {
        where: Record<string, unknown>;
        include: Record<string, unknown>;
      }) => {
        calls.push({ model: 'invoice', where, include });
        return [];
      },
    },
  };
  const patients = {
    getProfileByUserIdOrThrow: async () => ({ id: 'patient-a' }),
  };
  const service = new BillingService(
    prisma as never,
    patients as never,
    security as never,
    auditLogs as never,
    new BillingProviderAdapter(),
    configService as never,
  );

  await service.listQuotes({ userId: 'patient-user', role: Role.PATIENT });
  await service.listInvoices({ userId: 'clinic-admin', role: Role.CLINIC_ADMIN });

  assert.deepEqual(calls[0].where, { patientId: 'patient-a' });
  assert.deepEqual(calls[1].where, { clinicId: 'clinic-a' });
  assert.notEqual(
    (calls[0].include as { patient: { include: { user: unknown } } }).patient
      .include.user,
    true,
  );
  assert.notEqual(
    (calls[1].include as { patient: { include: { user: unknown } } }).patient
      .include.user,
    true,
  );
  await assert.rejects(
    () => service.listQuotes({ userId: 'professional-user', role: Role.PROFESSIONAL }),
    ForbiddenException,
  );
});

test('billing provider events require a valid signed webhook', async () => {
  let paymentIntentUpdate: Record<string, unknown> | undefined;
  let createdEvent: Record<string, unknown> | undefined;
  const prisma = {
    paymentIntent: {
      findFirst: async () => ({ id: 'payment-intent-1' }),
      update: async (args: Record<string, unknown>) => {
        paymentIntentUpdate = args;
        return { id: 'payment-intent-1' };
      },
    },
    billingProviderEvent: {
      findFirst: async () => null,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        createdEvent = { id: 'provider-event-1', ...data };
        return createdEvent;
      },
      update: async () => undefined,
    },
  };
  const service = new BillingService(
    prisma as never,
    {} as never,
    security as never,
    auditLogs as never,
    new BillingProviderAdapter(),
    configService as never,
  );
  const dto = {
    provider: 'internal',
    providerEventId: 'event-1',
    providerIntentId: 'provider-intent-1',
    payload: { status: 'succeeded' },
  };
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = `sha256=${createHmac('sha256', billingWebhookSecret)
    .update(`${timestamp}.${canonicalJson(dto)}`)
    .digest('hex')}`;

  await assert.rejects(
    () => service.ingestProviderEvent(dto, 'sha256=bad', timestamp),
    UnauthorizedException,
  );

  await service.ingestProviderEvent(dto, signature, timestamp);

  assert.equal(createdEvent?.actorId, undefined);
  assert.deepEqual(paymentIntentUpdate, {
    where: { id: 'payment-intent-1' },
    data: {
      status: PaymentIntentStatus.SUCCEEDED,
      updatedAt: (paymentIntentUpdate?.data as { updatedAt: Date }).updatedAt,
    },
  });
});

test('clinic appointment creation requires an existing patient-clinic relationship', async () => {
  const prisma = {
    careRequest: {
      findUnique: async () => null,
    },
    clinic: {
      findUnique: async () => ({ id: 'clinic-a' }),
    },
    clinicMember: {
      findFirst: async () => ({ id: 'membership-a' }),
    },
    patientProfile: {
      count: async () => 0,
    },
  };
  const patients = {
    getProfileByIdOrThrow: async () => ({ id: 'patient-b' }),
  };
  const service = new AppointmentsService(
    prisma as never,
    patients as never,
    {} as never,
    auditLogs as never,
  );

  await assert.rejects(
    () =>
      service.create(
        { userId: 'clinic-admin', role: Role.CLINIC_ADMIN },
        {
          patientId: 'patient-b',
          clinicId: 'clinic-a',
          scheduledAt: new Date('2026-08-01T10:00:00.000Z'),
        },
      ),
    ForbiddenException,
  );
});
