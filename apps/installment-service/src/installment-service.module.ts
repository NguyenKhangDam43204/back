import { Module } from '@nestjs/common';
import { InstallmentServiceController } from './installment-service.controller';
import { InstallmentServiceService } from './installment-service.service';

@Module({
  imports: [],
  controllers: [InstallmentServiceController],
  providers: [InstallmentServiceService],
  exports: [InstallmentServiceService],
})
export class InstallmentServiceModule {}
