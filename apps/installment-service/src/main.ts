import { NestFactory } from '@nestjs/core';
import { InstallmentServiceModule } from './installment-service.module';
import { installmentServiceConfig } from '../prisma.config';

async function bootstrap() {
  const app = await NestFactory.create(InstallmentServiceModule);
  const port = installmentServiceConfig.port;
  
  app.enableCors();
  
  await app.listen(port);
  console.log(`🚀 Installment Service running on port ${port}`);
}

bootstrap();
