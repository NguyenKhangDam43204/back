import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ProductServiceModule } from './product-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProductServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://tmdt:tmdt2026@rabbitmq:5672'],
        queue: 'product_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  await app.listen();
  console.log('Product Microservice is listening via RabbitMQ...');
}
void bootstrap();
