import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://tmdt:tmdt2026@rabbitmq:5672'],
          queue: 'user_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://tmdt:tmdt2026@rabbitmq:5672'],
          queue: 'product_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'ORDER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://tmdt:tmdt2026@rabbitmq:5672'],
          queue: 'order_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'PAYMENT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://tmdt:tmdt2026@rabbitmq:5672'],
          queue: 'payment_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'PROMOTION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://tmdt:tmdt2026@rabbitmq:5672'],
          queue: 'promotion_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'REVIEW_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://tmdt:tmdt2026@rabbitmq:5672'],
          queue: 'review_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'CONFIG_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://tmdt:tmdt2026@rabbitmq:5672'],
          queue: 'config_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://tmdt:tmdt2026@rabbitmq:5672'],
          queue: 'notification_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
