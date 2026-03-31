import { Module } from '@nestjs/common';
import { InventoryServiceController } from './inventory-service.controller';
import { InventoryServiceService } from './inventory-service.service';

@Module({
  imports: [],
  controllers: [InventoryServiceController],
  providers: [InventoryServiceService],
  exports: [InventoryServiceService],
})
export class InventoryServiceModule {}
