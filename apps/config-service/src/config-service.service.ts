import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigServiceService {
  ping(payload: unknown) {
    return {
      service: 'config-service',
      status: 'ok',
      payload,
    };
  }
}
