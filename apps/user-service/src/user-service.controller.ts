import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class UserServiceController {
  // Lắng nghe các tin nhắn có lệnh (cmd) là 'login'
  @MessagePattern({ cmd: 'login' })
  handleLogin(data: any) {
    console.log('User Service nhận được data:', data);
    // Xử lý logic DB ở đây...
    return { success: true, message: 'Đăng nhập thành công', user: data.username };
  }
}