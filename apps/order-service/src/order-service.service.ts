import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderServiceService {
  ping(payload: unknown) {
    return {
      service: 'order-service',
      status: 'ok',
      payload,
    };
  }
}
