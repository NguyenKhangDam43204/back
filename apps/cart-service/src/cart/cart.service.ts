import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from '../dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy giỏ hàng hoặc tạo mới nếu chưa có
   */
  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    return cart;
  }

  /**
   * Thêm sản phẩm vào giỏ hàng.
   * Nếu sản phẩm (productId + variantId) đã tồn tại → cộng dồn quantity.
   * Nếu chưa tồn tại → tạo CartItem mới.
   */
  async addToCart(userId: string, dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(userId);

    // Kiểm tra item đã tồn tại chưa (dựa vào composite unique key)
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId: dto.productId,
          variantId: dto.variantId ?? null,
        },
      },
    });

    if (existingItem) {
      // Cập nhật số lượng (cộng dồn)
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });
    }

    // Tạo item mới
    return this.prisma.cartItem.create({
      data: {
        cartId:    cart.id,
        productId: dto.productId,
        variantId: dto.variantId ?? null,
        quantity:  dto.quantity,
        price:     dto.price,
      },
    });
  }

  /**
   * Lấy giỏ hàng của user kèm tổng tiền & tổng số lượng.
   * Trả về object rỗng nếu giỏ hàng không tồn tại hoặc không có item.
   */
  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      return {
        items:         [],
        totalQuantity: 0,
        totalAmount:   0,
      };
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    const totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      id:            cart.id,
      userId:        cart.userId,
      items:         cart.items,
      totalQuantity,
      totalAmount:   Number(totalAmount.toFixed(2)),
      updatedAt:     cart.updatedAt,
    };
  }

  /**
   * Cập nhật số lượng của một CartItem.
   * Throws NotFoundException nếu item không tồn tại.
   */
  async updateCartItem(itemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data:  { quantity: dto.quantity },
    });
  }

  /**
   * Xóa một CartItem khỏi giỏ hàng.
   * Throws NotFoundException nếu item không tồn tại.
   */
  async removeCartItem(itemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  /**
   * Xóa toàn bộ CartItem trong giỏ hàng của user.
   * Không làm gì nếu Cart chưa tồn tại.
   */
  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });

    if (!cart) return;

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }
}   