import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

type ServiceKey =
  | 'user'
  | 'product'
  | 'order'
  | 'payment'
  | 'promotion'
  | 'review'
  | 'config'
  | 'notification';

@Controller('api')
export class AppController {
  private readonly serviceClientMap: Record<ServiceKey, ClientProxy>;

  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
    @Inject('PROMOTION_SERVICE') private readonly promotionClient: ClientProxy,
    @Inject('REVIEW_SERVICE') private readonly reviewClient: ClientProxy,
    @Inject('CONFIG_SERVICE') private readonly configClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {
    this.serviceClientMap = {
      user: this.userClient,
      product: this.productClient,
      order: this.orderClient,
      payment: this.paymentClient,
      promotion: this.promotionClient,
      review: this.reviewClient,
      config: this.configClient,
      notification: this.notificationClient,
    };
  }

  @Post('user/login')
  loginUser(@Body() body: any) {
    return this.userClient.send({ cmd: 'login' }, body);
  }

  @Post(':service/ping')
  pingService(@Param('service') service: string, @Body() body: any) {
    const client = this.serviceClientMap[service as ServiceKey];
    if (!client) {
      throw new BadRequestException(`Unsupported service: ${service}`);
    }

    return client.send({ cmd: 'ping' }, body ?? {});
  }
}
