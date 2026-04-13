import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductService } from './product-service.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

// Sửa từ 'api/products' thành 'products'
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Get()
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.productService.findAllProducts({
      categoryId,
      isActive: isActive === 'true',
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productService.findProductById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(id, dto);
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    // Log để kiểm tra xem request có bay tới đây không
    console.log('🗑️  Yêu cầu xóa sản phẩm ID:', id);
    return this.productService.softDeleteProduct(id);
  }

  @Patch('variants/:variantId')
  async updateVariant(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.productService.updateVariant(variantId, dto);
  }

  @Patch('variants/:variantId/price')
  async updatePrice(
    @Param('variantId') variantId: string,
    @Body() body: { price: number; reason?: string; changedBy: string },
  ) {
    return this.productService.updateVariantPrice(
      variantId,
      body.price,
      body.changedBy,
      body.reason,
    );
  }
}
