import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { existsSync } from 'fs';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { ReviewServiceModule } from './review-service.module';

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
  const rabbitmqUrl = process.env.RABBITMQ_URL ?? 'amqp://tmdt:tmdt2026@rabbitmq:5672';
  const reviewQueue = process.env.REVIEW_RABBITMQ_QUEUE ?? process.env.RABBITMQ_QUEUE ?? 'review_queue';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ReviewServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: reviewQueue,
        queueOptions: {
          durable: true,
        },
        socketOptions: {
          heartbeatInterval: 60000,
          reconnectTimeInSeconds: 5,
        },
        prefetch: parseInt(process.env.REVIEW_RABBITMQ_PREFETCH ?? process.env.RABBITMQ_PREFETCH ?? '10', 10),
      },
    },
  );

  await app.listen();
  console.log('✅ Review Microservice is listening via RabbitMQ...');
  console.log(`   Queue: ${reviewQueue}`);
  console.log(`   RabbitMQ: ${rabbitmqUrl}`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start Review Microservice:', err);
  process.exit(1);
});
