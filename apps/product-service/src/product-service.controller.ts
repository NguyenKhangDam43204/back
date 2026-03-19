import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductServiceService } from './product-service.service';

@Controller()
export class ProductServiceController {
  constructor(private readonly productService: ProductServiceService) {}

  @MessagePattern({ cmd: 'ping' })
  handlePing(@Payload() payload: unknown) {
    return this.productService.ping(payload);
  }
}
