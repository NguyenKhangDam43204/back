import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(data: CreateProductDto) {
    try {
      const { variants, ...productData } = data;

      return await this.prisma.product.create({
        data: {
          ...productData, // productData lúc này đã chứa imgUrl
          variants: {
            create: variants.map((v) => ({
              color: v.color,
              ram: v.ram,
              storage: v.storage,
              importPrice: v.importPrice || 0, // Đảm bảo không bị undefined
              price: v.price || 0, // Đảm bảo không bị undefined
              stockQuantity: v.stockQuantity || 0,
              isActive: v.isActive ?? true,
            })),
          },
        },
      });
    } catch (error) {
      console.error('❌ Lỗi Prisma:', error);
      throw error;
    }
  }
  async findAllProducts(
    filter: { categoryId?: string; isActive?: boolean } = {},
  ) {
    // Log ra để kiểm tra filter gửi từ Frontend
    console.log('🔍 Fetching products with filter:', filter);

    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(filter.categoryId && { categoryId: filter.categoryId }),
      },
      include: {
        variants: true, // Lấy tất cả biến thể
        category: true, // Lấy thông tin category (đảm bảo bảng CATEGORIES có ID tương ứng)
        model: true, // Lấy thông tin model
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async findProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: { where: { deletedAt: null } },
        category: true,
        model: true,
      },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException('Không tìm thấy sản phẩm hoặc đã bị xóa');
    }
    return product;
  }

  async updateProduct(id: string, data: UpdateProductDto) {
    // Lưu ý: Cột img_url trong SQL phải khớp với imgUrl trong DTO qua @map
    return this.prisma.product.update({
      where: { id },
      data,
      include: { variants: true, category: true },
    });
  }
  async softDeleteProduct(id: string) {
    const cleanId = String(id).trim();

    // Dùng transaction để xóa cả sản phẩm và biến thể cùng lúc
    return await this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật biến thể
      await tx.productVariant.updateMany({
        where: { productId: cleanId },
        data: { deletedAt: new Date() },
      });

      // 2. Cập nhật sản phẩm
      return await tx.product.update({
        where: { id: cleanId },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });
    });
  }
  // ==================== VARIANT ====================
  async updateVariant(variantId: string, data: UpdateVariantDto) {
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data,
    });
  }

  async updateVariantPrice(
    variantId: string,
    newPrice: number,
    changedBy: string,
    reason?: string,
  ) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant)
      throw new NotFoundException('Không tìm thấy biến thể sản phẩm');

    return this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật giá mới
      const updated = await tx.productVariant.update({
        where: { id: variantId },
        data: { price: newPrice },
      });

      // 2. Ghi lịch sử (Khớp với bảng PRICE_HISTORIES)
      await tx.priceHistory.create({
        data: {
          productVariantId: variantId,
          changedBy: changedBy, // Trong SQL là CHAR(36), đảm bảo truyền đúng UUID
          oldPrice: variant.price,
          newPrice: newPrice,
          reason: reason || 'Cập nhật giá thủ công',
        },
      });

      return updated;
    });
  }

  async getStockByVariant(variantId: string) {
    return this.prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { stockQuantity: true, isActive: true },
    });
  }
}
