import { NestFactory } from '@nestjs/core';
import { InventoryServiceModule } from './inventory-service.module';
import { inventoryServiceConfig } from '../prisma.config';

async function bootstrap() {
  const app = await NestFactory.create(InventoryServiceModule);
  const port = inventoryServiceConfig.port;
  
  app.enableCors();
  
  await app.listen(port);
  console.log(`🚀 Inventory Service running on port ${port}`);
}

bootstrap();
