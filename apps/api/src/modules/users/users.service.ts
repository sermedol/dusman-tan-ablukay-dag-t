import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { hashPassword } from '@umutsensen/auth';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    password: string;
    roleId: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await hashPassword(data.password);
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || undefined;
    // The User model has no dedicated `username` input from this endpoint;
    // derive one from the email's local part as a sensible default.
    const username = data.email.split('@')[0];

    return this.prisma.user.create({
      data: {
        email: data.email,
        username,
        fullName,
        passwordHash,
        roleId: data.roleId,
        status: UserStatus.active,
      },
      include: { role: true },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      roleId?: string;
      isActive?: boolean;
    },
  ) {
    await this.findById(id);

    const updateData: {
      fullName?: string;
      roleId?: string;
      status?: UserStatus;
    } = {};

    if (data.firstName !== undefined || data.lastName !== undefined) {
      updateData.fullName = [data.firstName, data.lastName].filter(Boolean).join(' ');
    }
    if (data.roleId !== undefined) {
      updateData.roleId = data.roleId;
    }
    if (data.isActive !== undefined) {
      updateData.status = data.isActive ? UserStatus.active : UserStatus.inactive;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
