import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentServiceService } from './payment-service.service';

@Controller()
export class PaymentServiceController {
  constructor(private readonly paymentService: PaymentServiceService) {}

  @MessagePattern({ cmd: 'ping' })
  handlePing(@Payload() payload: unknown) {
    return this.paymentService.ping(payload);
  }
}
