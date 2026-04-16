import { Controller, Post, Get, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from '../dto';
// import { JwtAuthGuard } from '../../guards/jwt.guard'; // Sau này uncomment khi có guard

@Controller('api/v1/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  // @UseGuards(JwtAuthGuard)
  async addToCart(@Req() req: any, @Body() dto: AddToCartDto) {
    const userId = req.user?.id || 'demo-user-id'; // Tạm dùng demo, sau thay bằng JWT
    return this.cartService.addToCart(userId, dto);
  }

  @Get()
  // @UseGuards(JwtAuthGuard)
  async getCart(@Req() req: any) {
    const userId = req.user?.id || 'demo-user-id';
    return this.cartService.getCart(userId);
  }

  @Patch('items/:itemId')
  async updateItem(@Param('itemId') itemId: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateCartItem(itemId, dto);
  }

  @Delete('items/:itemId')
  async removeItem(@Param('itemId') itemId: string) {
    return this.cartService.removeCartItem(itemId);
  }

  @Delete()
  async clearCart(@Req() req: any) {
    const userId = req.user?.id || 'demo-user-id';
    return this.cartService.clearCart(userId);
  }
}