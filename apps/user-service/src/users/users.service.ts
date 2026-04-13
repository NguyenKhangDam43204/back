import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { ToggleActiveDto } from './dto/toggle-active.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';
import {
  UserNotFoundException,
  PhoneAlreadyExistsException,
  CannotDeactivateSelfException,
} from '../common/exceptions';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new UserNotFoundException();
    return this.mapUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new UserNotFoundException();

    // Check phone uniqueness if changing
    if (dto.phoneNumber && dto.phoneNumber !== user.phoneNumber) {
      const existing = await this.prisma.user.findUnique({
        where: { phoneNumber: dto.phoneNumber },
      });
      if (existing) throw new PhoneAlreadyExistsException();
    }

    const updated = await this.usersRepo.updateProfile(userId, {
      userName: dto.userName,
      phoneNumber: dto.phoneNumber,
      fullName: dto.fullName,
      avatarUrl: dto.avatarUrl,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      gender: dto.gender,
    });

    return this.mapUser(updated!);
  }

  async listUsers(query: QueryUsersDto) {
    const { users, total, page, limit } = await this.usersRepo.findMany(query);
    return {
      data: users.map((u) => this.mapUser(u)),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserById(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new UserNotFoundException();
    return this.mapUser(user);
  }

  async toggleActive(targetUserId: string, currentUserId: string, dto: ToggleActiveDto) {
    if (!dto.isActive && targetUserId === currentUserId) {
      throw new CannotDeactivateSelfException();
    }

    const user = await this.usersRepo.findById(targetUserId);
    if (!user) throw new UserNotFoundException();

    await this.usersRepo.toggleActive(targetUserId, dto.isActive);
    return { message: dto.isActive ? 'Tài khoản đã được kích hoạt' : 'Tài khoản đã bị khoá' };
  }

  async updateRoles(targetUserId: string, dto: UpdateRolesDto) {
    const user = await this.usersRepo.findById(targetUserId);
    if (!user) throw new UserNotFoundException();

    const updated = await this.usersRepo.updateRoles(targetUserId, dto.roles);
    return this.mapUser(updated!);
  }

  private mapUser(user: any) {
    return {
      id: user.id,
      userName: user.userName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      roles: user.userRoles?.map((ur: any) => ur.role.name) ?? [],
      fullName: user.userDetail?.fullName,
      avatarUrl: user.userDetail?.avatarUrl,
      dateOfBirth: user.userDetail?.dateOfBirth,
      gender: user.userDetail?.gender,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
