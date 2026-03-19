import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationServiceService } from './notification-service.service';

@Controller()
export class NotificationServiceController {
  private readonly logger = new Logger(NotificationServiceController.name);

  constructor(private readonly notificationService: NotificationServiceService) {}

  @MessagePattern({ cmd: 'ping' })
  handlePing(@Payload() payload: unknown) {
    return this.notificationService.ping(payload);
  }

  @EventPattern('order_status_changed')
  async handleOrderStatusChanged(@Payload() payload: unknown) {
    try {
      await this.notificationService.sendOrderStatusNotification(payload);
    } catch (error) {
      this.logger.error('Failed to process order_status_changed event', error);
    }
  }
}
