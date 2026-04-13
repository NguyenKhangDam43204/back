import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport, ClientProviderOptions } from '@nestjs/microservices';

const RABBITMQ_URL =
  process.env.RABBITMQ_URL ?? 'amqp://tmdt:tmdt2026@rabbitmq:5672';

// ✅ Fix: Explicit type RmqOptions base
const RMQ_BASE_OPTIONS = {
  urls: [RABBITMQ_URL],
  persistent: true,
  queueOptions: {
    durable: true,
  },
  socketOptions: {
    heartbeatInterval: 60000,
    reconnectTimeInSeconds: 5,
  },
};

// ✅ Fix: Helper function trả về đúng type
function createRmqClient(name: string, queue: string): ClientProviderOptions {
  return {
    name,
    transport: Transport.RMQ,  // ✅ Transport.RMQ thay vì Transport
    options: {
      ...RMQ_BASE_OPTIONS,
      queue,
    },
  };
}

@Module({
  imports: [
    ClientsModule.register([
      createRmqClient('USER_SERVICE',         process.env.USER_QUEUE         ?? 'user_queue'),
      createRmqClient('PRODUCT_SERVICE',      process.env.PRODUCT_QUEUE      ?? 'product_queue'),
      createRmqClient('ORDER_SERVICE',        process.env.ORDER_QUEUE        ?? 'order_queue'),
      createRmqClient('PAYMENT_SERVICE',      process.env.PAYMENT_QUEUE      ?? 'payment_queue'),
      createRmqClient('PROMOTION_SERVICE',    process.env.PROMOTION_QUEUE    ?? 'promotion_queue'),
      createRmqClient('REVIEW_SERVICE',       process.env.REVIEW_QUEUE       ?? 'review_queue'),
      createRmqClient('CONFIG_SERVICE',       process.env.CONFIG_QUEUE       ?? 'config_queue'),
      createRmqClient('NOTIFICATION_SERVICE', process.env.NOTIFICATION_QUEUE ?? 'notification_queue'),
      createRmqClient('INVENTORY_SERVICE',    process.env.INVENTORY_QUEUE    ?? 'inventory_queue'),
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}