import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { hashPassword, verifyPassword, generateToken } from '@umutsensen/auth';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User is not active');
    }

    const permissions = user.role.permissions.map((p) => p.permission);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      roles: [user.role.code],
      permissions,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: {
          code: user.role.code,
          name: user.role.name,
        },
        permissions,
      },
    };
  }

  async register(email: string, username: string, password: string, fullName?: string) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existing) {
      throw new BadRequestException('Email or username already exists');
    }

    // Get researcher role by default
    const researcherRole = await this.prisma.role.findUnique({
      where: { code: 'researcher' },
    });

    if (!researcherRole) {
      throw new BadRequestException('Researcher role not found');
    }

    const hashedPassword = await hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        fullName: fullName || username,
        roleId: researcherRole.id,
        status: 'active',
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM',
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    const permissions = user.role.permissions.map((p) => p.permission);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      roles: [user.role.code],
      permissions,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: {
          code: user.role.code,
          name: user.role.name,
        },
        permissions,
      },
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const permissions = user.role.permissions.map((p) => p.permission);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: {
        code: user.role.code,
        name: user.role.name,
      },
      permissions,
    };
  }
}
