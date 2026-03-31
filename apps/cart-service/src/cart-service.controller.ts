import { Controller, Get, Post, Put, Delete, Param, Body, Query, Patch } from '@nestjs/common';
import { CartServiceService } from './cart-service.service';

@Controller('cart')
export class CartServiceController {
  constructor(private readonly cartService: CartServiceService) {}

  @Get()
  async getCart(
    @Query('userId') userId?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    return {
      success: true,
      message: 'Get cart',
      userId,
      sessionId,
    };
  }

  @Post('items')
  async addToCart(
    @Body()
    body: {
      variantId: string;
      quantity: number;
      price: number;
      userId?: string;
      sessionId?: string;
    },
  ) {
    return this.cartService.addToCart(
      body.userId || null,
      body.variantId,
      body.quantity,
      body.price,
      body.sessionId,
    );
  }

  @Patch('items/:itemId')
  async updateCartItem(
    @Param('itemId') itemId: string,
    @Body() body: { variantId: string; quantity: number },
  ) {
    return this.cartService.updateCartItem(itemId, body.variantId, body.quantity);
  }

  @Delete('items/:itemId')
  async removeCartItem(
    @Param('itemId') itemId: string,
    @Query('variantId') variantId: string,
  ) {
    return this.cartService.removeCartItem(itemId, variantId);
  }

  @Delete()
  async clearCart(
    @Query('userId') userId?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.cartService.clearCart(userId, sessionId);
  }

  @Post('merge')
  async mergeGuestCart(
    @Body() body: { guestSessionId: string; userId: string },
  ) {
    return this.cartService.mergeGuestCart(body.guestSessionId, body.userId);
  }
}
