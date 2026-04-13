import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceAuthGuard } from '../common/guards/service-auth.guard';
import { InvalidTokenException } from '../common/exceptions';

@Controller('internal/users')
@UseGuards(ServiceAuthGuard)
export class InternalController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // POST /internal/users/validate-token
  @Post('validate-token')
  async validateToken(@Body('token') token: string) {
    try {
      const payload = this.jwtService.verify<any>(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      if (payload.type !== 'access') throw new InvalidTokenException();

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, isActive: true },
      });

      if (!user || !user.isActive) throw new InvalidTokenException();

      return {
        userId: payload.sub,
        email: payload.email,
        roles: payload.roles,
      };
    } catch {
      throw new InvalidTokenException();
    }
  }

  // GET /internal/users/:id
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userDetail: true,
        userRoles: { include: { role: true } },
      },
    });

    if (!user) throw new InvalidTokenException();

    return {
      id: user.id,
      userName: user.userName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      roles: user.userRoles.map((ur) => ur.role.name),
      fullName: user.userDetail?.fullName,
      avatarUrl: user.userDetail?.avatarUrl,
    };
  }

  // POST /internal/users/batch
  @Post('batch')
  async batchGetUsers(@Body('ids') ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      include: {
        userDetail: true,
        userRoles: { include: { role: true } },
      },
    });

    return users.map((user) => ({
      id: user.id,
      userName: user.userName,
      email: user.email,
      isActive: user.isActive,
      roles: user.userRoles.map((ur) => ur.role.name),
      fullName: user.userDetail?.fullName,
      avatarUrl: user.userDetail?.avatarUrl,
    }));
  }
}
