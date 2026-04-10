import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

type RegisterPayload = {
  email: string;
  password: string;
  userName: string;
};

type VerifyRegisterPayload = {
  email: string;
  otp: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type ForgotPasswordPayload = {
  email: string;
};

type ResetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
};

type OtpStore = {
  email: string;
  otpCode: string;
  type: 'REGISTER' | 'FORGOT_PASSWORD';
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
};

@Injectable()
export class UserServiceService {
  private readonly otpStore: OtpStore[] = [];

  constructor(private readonly prisma: PrismaService) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateToken(prefix: string, userId: string): string {
    return `${prefix}_${userId}_${Date.now()}`;
  }

  async register(payload: RegisterPayload) {
    const { email, password, userName } = payload;

    const existed = await this.prisma.user.findUnique({ where: { email } });
    if (existed) {
      return {
        success: false,
        error: {
          code: 409,
          message: 'Email đã tồn tại',
        },
      };
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        userName,
        hashPassword: password,
        isActive: false,
      },
    });

    const otpCode = this.generateOtp();
    this.otpStore.push({
      email,
      otpCode,
      type: 'REGISTER',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      isUsed: false,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: 'Đăng ký thành công. Vui lòng xác thực OTP.',
      data: {
        userId: user.id,
        email: user.email,
        userName: user.userName,
      },
    };
  }

  async verifyRegister(payload: VerifyRegisterPayload) {
    const { email, otp } = payload;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        success: false,
        error: {
          code: 404,
          message: 'Không tìm thấy người dùng',
        },
      };
    }

    const otpRecord = this.otpStore
      .filter(
        (item) =>
          item.email === email && item.type === 'REGISTER' && !item.isUsed,
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!otpRecord) {
      return {
        success: false,
        error: {
          code: 404,
          message: 'Không tìm thấy OTP hợp lệ',
        },
      };
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      return {
        success: false,
        error: {
          code: 410,
          message: 'OTP đã hết hạn',
        },
      };
    }

    if (otpRecord.otpCode !== otp) {
      return {
        success: false,
        error: {
          code: 401,
          message: 'OTP không chính xác',
        },
      };
    }

    otpRecord.isUsed = true;
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isActive: true },
    });

    return {
      success: true,
      message: 'Xác thực OTP thành công',
      data: {
        accessToken: this.generateToken('access', user.id),
        refreshToken: this.generateToken('refresh', user.id),
      },
    };
  }

  async login(payload: LoginPayload) {
    const { email, password } = payload;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || user.hashPassword !== password) {
      return {
        success: false,
        error: {
          code: 401,
          message: 'Sai email hoặc mật khẩu',
        },
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: {
          code: 403,
          message: 'Vui lòng xác thực tài khoản',
        },
      };
    }

    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        accessToken: this.generateToken('access', user.id),
        refreshToken: this.generateToken('refresh', user.id),
      },
    };
  }

  async forgotPassword(payload: ForgotPasswordPayload) {
    const { email } = payload;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        success: false,
        error: {
          code: 404,
          message: 'Email không tồn tại',
        },
      };
    }

    const otpCode = this.generateOtp();
    this.otpStore.push({
      email,
      otpCode,
      type: 'FORGOT_PASSWORD',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      isUsed: false,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: 'Đã gửi OTP đặt lại mật khẩu',
      data: {
        email: user.email,
      },
    };
  }

  async resetPassword(payload: ResetPasswordPayload) {
    const { email, otp, newPassword } = payload;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        success: false,
        error: {
          code: 404,
          message: 'Email không tồn tại',
        },
      };
    }

    const otpRecord = this.otpStore
      .filter(
        (item) =>
          item.email === email &&
          item.type === 'FORGOT_PASSWORD' &&
          !item.isUsed,
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!otpRecord) {
      return {
        success: false,
        error: {
          code: 404,
          message: 'Không tìm thấy OTP hợp lệ',
        },
      };
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      return {
        success: false,
        error: {
          code: 410,
          message: 'OTP đã hết hạn',
        },
      };
    }

    if (otpRecord.otpCode !== otp) {
      return {
        success: false,
        error: {
          code: 401,
          message: 'OTP không chính xác',
        },
      };
    }

    otpRecord.isUsed = true;
    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashPassword: newPassword },
    });

    return {
      success: true,
      message: 'Đặt lại mật khẩu thành công',
    };
  }
}
