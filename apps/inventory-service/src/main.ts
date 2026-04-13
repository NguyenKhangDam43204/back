import { NestFactory }     from '@nestjs/core';
import { InventoryModule } from './inventory.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
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
  const logger = new Logger('InventoryService');

  // ✅ Fix: Dùng RABBITMQ_URL thống nhất với docker-compose
  const rabbitmqUrl    = process.env.RABBITMQ_URL    ?? 'amqp://tmdt:tmdt2026@rabbitmq:5672';
  const inventoryQueue = process.env.INVENTORY_RABBITMQ_QUEUE ?? process.env.RABBITMQ_QUEUE  ?? 'inventory_queue';
  const port           = process.env.INVENTORY_SERVICE_PORT ?? process.env.PORT            ?? 3003;

  const app = await NestFactory.create(InventoryModule, {
    logger: ['log', 'error', 'warn'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls:          [rabbitmqUrl],
      queue:         inventoryQueue,
      queueOptions:  { durable: true },
      socketOptions: {
        heartbeatInterval:      60000,
        reconnectTimeInSeconds: 5,
      },
      prefetchCount: 1,
    },
  });

  await app.startAllMicroservices();
  await app.listen(port);

  logger.log(`========================================`);
  logger.log(`✅ Inventory Service running`);
  logger.log(`   HTTP  : http://localhost:${port}`);
  logger.log(`   Queue : ${inventoryQueue}`);
  logger.log(`========================================`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start:', err);
  process.exit(1);
});