import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PromotionServiceModule } from './promotion-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PromotionServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://tmdt:tmdt2026@rabbitmq:5672'],
        queue: 'promotion_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  await app.listen();
  console.log('Promotion Microservice is listening via RabbitMQ...');
}
void bootstrap();
