import { Controller, Get, Post, Put, Delete, Param, Body, Query, Patch } from '@nestjs/common';
import { InstallmentServiceService } from './installment-service.service';

@Controller('installments')
export class InstallmentServiceController {
  constructor(private readonly installmentService: InstallmentServiceService) {}

  // Plans
  @Get('plans')
  async getPlans() {
    return this.installmentService.getPlans();
  }

  @Get('plans/:id')
  async getPlanById(@Param('id') id: string) {
    return this.installmentService.getPlanById(id);
  }

  @Post('plans')
  async createPlan(
    @Body()
    body: {
      name: string;
      durationMonths: number;
      interestRate: number;
      minOrderValue: number;
      downPaymentPct: number;
    },
  ) {
    return this.installmentService.createPlan(body);
  }

  @Put('plans/:id')
  async updatePlan(@Param('id') id: string, @Body() body: any) {
    return this.installmentService.updatePlan(id, body);
  }

  // Applications
  @Post('apply')
  async applyInstallment(
    @Body()
    body: {
      orderId: string;
      userId: string;
      planId: string;
      principalAmount: number;
      documents: any;
    },
  ) {
    return this.installmentService.createApplication(body);
  }

  @Get('me')
  async getMyApplications(@Query('userId') userId: string) {
    return this.installmentService.getMyApplications(userId);
  }

  @Get('me/:id')
  async getMyApplicationDetail(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    return this.installmentService.getMyApplicationDetail(userId, id);
  }

  @Get()
  async getAllApplications() {
    return this.installmentService.getAllApplications();
  }

  @Patch(':id/approve')
  async approveApplication(
    @Param('id') id: string,
    @Body() body: { approvedBy: string },
  ) {
    return this.installmentService.approveApplication(id, body.approvedBy);
  }

  @Patch(':id/reject')
  async rejectApplication(
    @Param('id') id: string,
    @Body() body: { reason: string; approvedBy: string },
  ) {
    return this.installmentService.rejectApplication(id, body.reason, body.approvedBy);
  }

  // Schedules
  @Get(':id/schedules')
  async getSchedules(@Param('id') id: string) {
    return this.installmentService.getSchedules(id);
  }

  @Post('schedules/:scheduleId/pay')
  async paySchedule(
    @Param('scheduleId') scheduleId: string,
    @Body() body: { paidBy: string; paidAmount: number },
  ) {
    return this.installmentService.paySchedule(scheduleId, body.paidBy, body.paidAmount);
  }

  @Get('overdue')
  async getOverdueSchedules() {
    return this.installmentService.getOverdueSchedules();
  }
}
