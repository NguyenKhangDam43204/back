import { Module } from '@nestjs/common';
import { CartServiceController } from './cart-service.controller';
import { CartServiceService } from './cart-service.service';

@Module({
  imports: [],
  controllers: [CartServiceController],
  providers: [CartServiceService],
  exports: [CartServiceService],
})
export class CartServiceModule {}
