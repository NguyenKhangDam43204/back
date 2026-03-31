import { Controller, Get, Post, Put, Delete, Param, Body, Query, Patch } from '@nestjs/common';
import { InventoryServiceService } from './inventory-service.service';

@Controller('inventory')
export class InventoryServiceController {
  constructor(private readonly inventoryService: InventoryServiceService) {}

  @Get()
  async getAllInventory(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return {
      success: true,
      message: 'Get all inventory',
      page: parseInt(page),
      limit: parseInt(limit),
    };
  }

  @Get(':variantId')
  async getInventory(@Param('variantId') variantId: string) {
    return this.inventoryService.getInventory(variantId);
  }

  @Post(':variantId/import')
  async importInventory(
    @Param('variantId') variantId: string,
    @Body() body: { quantity: number; reason?: string },
  ) {
    return this.inventoryService.importInventory(variantId, body.quantity, body.reason);
  }

  @Post(':variantId/adjustment')
  async adjustmentInventory(
    @Param('variantId') variantId: string,
    @Body() body: { quantity: number; reason?: string },
  ) {
    return this.inventoryService.adjustmentInventory(variantId, body.quantity, body.reason);
  }

  @Get(':variantId/transactions')
  async getTransactionHistory(@Param('variantId') variantId: string) {
    return this.inventoryService.getTransactionHistory(variantId);
  }

  @Get('low-stock')
  async getLowStockItems() {
    return this.inventoryService.checkLowStock();
  }
}
