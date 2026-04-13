import { Module } from '@nestjs/common';
import { InternalController } from './internal.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [InternalController],
})
export class InternalModule {}
