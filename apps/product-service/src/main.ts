// apps/product-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ProductServiceModule } from './product-service.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { existsSync } from 'fs';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

const rootEnvPath = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../../.env'),
  resolve(__dirname, '../../../.env'),
  resolve(__dirname, '../../../../.env'),
].find((path) => existsSync(path));

if (rootEnvPath) {
  loadEnv({ path: rootEnvPath });
}

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create(ProductServiceModule);

  // 1. Cấu hình Cors để Frontend (HTML file) có thể gọi API
  app.enableCors();

  // 2. Cấu hình Global Prefix
  app.setGlobalPrefix('api');

  // 3. Cấu hình Validation (Để các DTO @Min, @IsString hoạt động)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // Cho phép các trường không có trong DTO (như id, createdAt) mà không bị lỗi
    }),
  );

  const port = process.env.PRODUCT_SERVICE_PORT ?? process.env.PORT ?? 3004;
  await app.listen(port);

  logger.log(`🚀 Product Service is running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});
