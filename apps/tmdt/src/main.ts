import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
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
  const logger = new Logger('APIGateway');

  const app = await NestFactory.create(AppModule);
  const port = process.env.TMDT_PORT ?? process.env.PORT ?? 3000;

  // ✅ Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port);

  const rabbitmqURL = process.env.RABBITMQ_URL ?? 'amqp://tmdt:tmdt2026@rabbitmq:5672';

  logger.log(`========================================`);
  logger.log(`✅ API Gateway (TMDT) is running`);
  logger.log(`   Port: ${port}`);
  logger.log(`   RabbitMQ: ${rabbitmqURL}`);
  logger.log(`   Environment: ${process.env.NODE_ENV ?? 'development'}`);
  logger.log(`========================================`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start API Gateway:', err);
  process.exit(1);
});

