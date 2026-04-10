import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserServiceService } from './user-service.service';

@Controller()
export class UserServiceController {
  constructor(private readonly userService: UserServiceService) {}

  @MessagePattern({ cmd: 'auth.register' })
  register(
    @Payload()
    data: {
      email: string;
      password: string;
      userName: string;
    },
  ) {
    return this.userService.register(data);
  }

  @MessagePattern({ cmd: 'auth.verify-register' })
  verifyRegister(@Payload() data: { email: string; otp: string }) {
    return this.userService.verifyRegister(data);
  }

  @MessagePattern({ cmd: 'auth.login' })
  login(@Payload() data: { email: string; password: string }) {
    return this.userService.login(data);
  }

  @MessagePattern({ cmd: 'auth.forgot-password' })
  forgotPassword(@Payload() data: { email: string }) {
    return this.userService.forgotPassword(data);
  }

  @MessagePattern({ cmd: 'auth.reset-password' })
  resetPassword(
    @Payload()
    data: {
      email: string;
      otp: string;
      newPassword: string;
    },
  ) {
    return this.userService.resetPassword(data);
  }
}
