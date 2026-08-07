import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { hashPassword } from '@umutsensen/auth';

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

    return this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash,
        roleId: data.roleId,
        isActive: true,
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
    const user = await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data,
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
