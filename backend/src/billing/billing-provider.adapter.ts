import { Injectable } from '@nestjs/common';
import { PaymentIntentStatus } from '@prisma/client';

@Injectable()
export class BillingProviderAdapter {
  buildInvoiceSubmitPayload(invoice: unknown) {
    return {
      provider: 'internal',
      invoice,
    };
  }

  buildPaymentIntentPayload(paymentIntent: unknown) {
    return {
      provider: 'internal',
      paymentIntent,
    };
  }

  mapPaymentStatus(payload: unknown): PaymentIntentStatus | null {
    if (!payload || typeof payload !== 'object' || !('status' in payload)) {
      return null;
    }

    const status = String(payload.status).toUpperCase();

    if (status === 'SUCCEEDED' || status === 'PAID') {
      return PaymentIntentStatus.SUCCEEDED;
    }

    if (status === 'FAILED' || status === 'DECLINED') {
      return PaymentIntentStatus.FAILED;
    }

    if (status === 'PROCESSING') {
      return PaymentIntentStatus.PROCESSING;
    }

    if (status === 'CANCELLED' || status === 'CANCELED') {
      return PaymentIntentStatus.CANCELLED;
    }

    return null;
  }
}
