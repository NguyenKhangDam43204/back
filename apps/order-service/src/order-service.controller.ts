import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderServiceService } from './order-service.service';

@Controller()
export class OrderServiceController {
  constructor(private readonly orderService: OrderServiceService) {}

  @MessagePattern({ cmd: 'ping' })
  handlePing(@Payload() payload: unknown) {
    return this.orderService.ping(payload);
  }
}
