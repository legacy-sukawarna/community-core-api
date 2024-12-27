import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { UpdatedUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async insertUser(userData: {
    id: string;
    email: string;
    name: string;
    role: Role;
    phone: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userData.id },
    });

    if (!user) {
      return this.prisma.user.create({
        data: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role || 'MEMBER',
          phone: userData.phone,
        },
      });
    }

    return user;
  }

  // Find user by ID
  async findUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        mentoredGroups: true,
        group: {
          include: {
            mentor: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  // Find user by email
  async findUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  // Assign a role to a user
  async assignRole(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  // List users with optional filters
  async listUsers(
    filter?: {
      role?: Role;
      search?: string;
    },
    page = 1,
    limit = 10,
  ) {
    this.logger.log(
      `Listing users with filter: ${JSON.stringify(filter)}, page: ${page}, limit: ${limit}`,
    );

    // Build filters object step by step
    let filters = {};

    // Add role filter if provided
    if (filter?.role) {
      filters = {
        ...filters,
        role: filter.role,
      };
    }

    // Add search filter if provided
    if (filter?.search) {
      filters = {
        ...filters,
        OR: [
          {
            name: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
        ],
      };
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: filters || {},
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          group: {
            include: {
              mentor: true,
            },
          },
          mentoredGroups: true,
        },
      }),
      this.prisma.user.count({
        where: filters || {},
      }),
    ]);

    return {
      results: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Delete a user by ID
  async deleteUser(userId: string) {
    return this.prisma.user.delete({ where: { id: userId } });
  }

  async updateUser(userId: string, updateData: UpdatedUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        updated_at: new Date(), // Update the timestamp
      },
    });
  }
}
