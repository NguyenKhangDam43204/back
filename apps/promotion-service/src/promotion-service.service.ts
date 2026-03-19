import { Injectable } from '@nestjs/common';

@Injectable()
export class PromotionServiceService {
  ping(payload: unknown) {
    return {
      service: 'promotion-service',
      status: 'ok',
      payload,
    };
  }
}
