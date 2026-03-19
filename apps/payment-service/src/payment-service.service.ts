import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentServiceService {
  ping(payload: unknown) {
    return {
      service: 'payment-service',
      status: 'ok',
      payload,
    };
  }
}
