import { NestFactory } from '@nestjs/core';
import { CartServiceModule } from './cart-service.module';
import { cartServiceConfig } from '../prisma.config';

async function bootstrap() {
  const app = await NestFactory.create(CartServiceModule);
  const port = cartServiceConfig.port;
  
  app.enableCors();
  
  await app.listen(port);
  console.log(`🚀 Cart Service running on port ${port}`);
}

bootstrap();
