import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReviewServiceService } from './review-service.service';

@Controller()
export class ReviewServiceController {
  constructor(private readonly reviewService: ReviewServiceService) {}

  @MessagePattern({ cmd: 'ping' })
  handlePing(@Payload() payload: unknown) {
    return this.reviewService.ping(payload);
  }
}
