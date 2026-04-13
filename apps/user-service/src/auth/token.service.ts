import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TokenUtil } from '../common/utils/token.util';
import { InvalidTokenException, TokenRevokedException, TokenExpiredException } from '../common/exceptions';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  deviceId: string;
  type: 'refresh';
  exp?: number;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async issueTokenPair(userId: string, roles: string[], deviceId?: string): Promise<TokenPair> {
    const jti = TokenUtil.generateJti();
    const device = deviceId ?? 'unknown';
    const secret = this.configService.get<string>('jwt.secret')!;
    const accessExpiry = this.configService.get<string>('jwt.accessExpiry') ?? '15m';
    const refreshExpiry = this.configService.get<string>('jwt.refreshExpiry') ?? '30d';

    const userEmail = await this.getUserEmail(userId);

    const accessToken = this.jwtService.sign(
      { sub: userId, email: userEmail, roles, type: 'access' },
      { secret, expiresIn: accessExpiry as any },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, jti, deviceId: device, type: 'refresh' },
      { secret, expiresIn: refreshExpiry as any },
    );

    // Store hashed refresh token in DB
    const hashedToken = TokenUtil.hashToken(refreshToken);
    const expiresAt = this.parseExpiry(refreshExpiry);

    await (this.prisma as any).refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        deviceId: device,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async rotateRefreshToken(rawToken: string): Promise<TokenPair> {
    const secret = this.configService.get<string>('jwt.secret')!;

    let decoded: RefreshTokenPayload;
    try {
      decoded = this.jwtService.verify<RefreshTokenPayload>(rawToken, { secret });
    } catch {
      throw new InvalidTokenException();
    }

    if (decoded.type !== 'refresh') throw new InvalidTokenException();

    const hashedToken = TokenUtil.hashToken(rawToken);
    const storedToken = await (this.prisma as any).refreshToken.findUnique({
      where: { token: hashedToken },
    });

    if (!storedToken) throw new InvalidTokenException();
    if (storedToken.revokedAt) throw new TokenRevokedException();
    if (storedToken.expiresAt < new Date()) throw new TokenExpiredException();
    if (storedToken.userId !== decoded.sub) throw new InvalidTokenException();

    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user || !user.isActive) throw new InvalidTokenException();

    // Revoke old token
    await (this.prisma as any).refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const roles = user.userRoles.map((ur: any) => ur.role.name);
    return this.issueTokenPair(user.id, roles, decoded.deviceId);
  }

  async revokeToken(rawToken: string): Promise<void> {
    const hashedToken = TokenUtil.hashToken(rawToken);
    await (this.prisma as any).refreshToken.updateMany({
      where: { token: hashedToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await (this.prisma as any).refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async getUserEmail(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    return user?.email ?? '';
  }

  private parseExpiry(expiry: string): Date {
    const now = new Date();
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const ms: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return new Date(now.getTime() + value * (ms[unit] ?? ms['d']));
  }
}
