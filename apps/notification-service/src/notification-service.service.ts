import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationServiceService {
  private readonly logger = new Logger(NotificationServiceService.name);

  ping(payload: unknown) {
    return {
      service: 'notification-service',
      status: 'ok',
      payload,
    };
  }

  async sendOrderStatusNotification(payload: unknown) {
    this.logger.log(
      `Received order_status_changed event, ready to trigger Firebase notification: ${JSON.stringify(payload)}`,
    );
  }
}
