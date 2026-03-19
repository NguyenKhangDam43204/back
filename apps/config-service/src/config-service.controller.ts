import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConfigServiceService } from './config-service.service';

@Controller()
export class ConfigServiceController {
  constructor(private readonly configService: ConfigServiceService) {}

  @MessagePattern({ cmd: 'ping' })
  handlePing(@Payload() payload: unknown) {
    return this.configService.ping(payload);
  }
}
