import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PromotionServiceService } from './promotion-service.service';

@Controller()
export class PromotionServiceController {
  constructor(private readonly promotionService: PromotionServiceService) {}

  @MessagePattern({ cmd: 'ping' })
  handlePing(@Payload() payload: unknown) {
    return this.promotionService.ping(payload);
  }
}
