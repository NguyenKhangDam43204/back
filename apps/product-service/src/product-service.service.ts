import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductServiceService {
  ping(payload: unknown) {
    return {
      service: 'product-service',
      status: 'ok',
      payload,
    };
  }
}
