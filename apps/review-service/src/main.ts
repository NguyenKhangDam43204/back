import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ReviewServiceModule } from './review-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ReviewServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://tmdt:tmdt2026@rabbitmq:5672'],
        queue: 'review_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  await app.listen();
  console.log('Review Microservice is listening via RabbitMQ...');
}
void bootstrap();
