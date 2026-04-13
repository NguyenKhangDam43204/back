import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Param,
  Post,
  Get,
  Query,
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
  | 'notification'
  | 'inventory';

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
    @Inject('INVENTORY_SERVICE')
    private readonly inventoryClient: ClientProxy,
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
      inventory: this.inventoryClient,
    };
  }

  @Post('user/login')
  loginUser(@Body() body: any) {
    return this.userClient.send({ cmd: 'auth.login' }, body);
  }

  @Post('v1/auth/login')
  loginUserV1(@Body() body: any) {
    return this.userClient.send({ cmd: 'auth.login' }, body);
  }

  @Post('user/register')
  registerUser(@Body() body: any) {
    return this.userClient.send({ cmd: 'auth.register' }, body);
  }

  @Post('v1/auth/register')
  registerUserV1(@Body() body: any) {
    return this.userClient.send({ cmd: 'auth.register' }, body);
  }

  @Post('user/verify-register')
  verifyRegister(@Body() body: any) {
    return this.userClient.send({ cmd: 'auth.verify-register' }, body);
  }

  @Post('v1/auth/verify-register')
  verifyRegisterV1(@Body() body: any) {
    return this.userClient.send({ cmd: 'auth.verify-register' }, body);
  }

  @Post('user/forgot-password')
  forgotPassword(@Body() body: any) {
    return this.userClient.send({ cmd: 'auth.forgot-password' }, body);
  }

  @Post('v1/auth/forgot-password')
  forgotPasswordV1(@Body() body: any) {
    return this.userClient.send({ cmd: 'auth.forgot-password' }, body);
  }

  @Post('user/reset-password')
  resetPassword(@Body() body: any) {
    return this.userClient.send({ cmd: 'auth.reset-password' }, body);
  }

  @Post('v1/auth/reset-password')
  resetPasswordV1(@Body() body: any) {
    return this.userClient.send({ cmd: 'auth.reset-password' }, body);
  }

  /**
   * Inventory Service Endpoints
   */

  @Get('inventory/:variantId')
  getInventory(@Param('variantId') variantId: string) {
    return this.inventoryClient.send(
      { cmd: 'inventory.get' },
      { productVariantId: variantId },
    );
  }

  @Get('inventory/:variantId/history')
  getInventoryHistory(
    @Param('variantId') variantId: string,
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
  ) {
    return this.inventoryClient.send(
      { cmd: 'inventory.get-history' },
      {
        productVariantId: variantId,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    );
  }

  @Post('inventory/restock')
  restockInventory(@Body() body: any) {
    return this.inventoryClient.send({ cmd: 'inventory.restock' }, body);
  }

  @Post('inventory/adjust')
  adjustInventory(@Body() body: any) {
    return this.inventoryClient.send({ cmd: 'inventory.adjust' }, body);
  }

  @Post('inventory/check-stock')
  checkStock(@Body() body: any) {
    return this.inventoryClient.send({ cmd: 'inventory.check-stock' }, body);
  }

  /**
   * Generic ping endpoint for all services
   */
  @Post(':service/ping')
  pingService(@Param('service') service: string, @Body() body: any) {
    const client = this.serviceClientMap[service as ServiceKey];
    if (!client) {
      throw new BadRequestException(`Unsupported service: ${service}`);
    }

    return client.send({ cmd: 'ping' }, body ?? {});
  }
}

