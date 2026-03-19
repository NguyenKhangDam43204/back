import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewServiceService {
  ping(payload: unknown) {
    return {
      service: 'review-service',
      status: 'ok',
      payload,
    };
  }
}
