import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { NewUserDto, UpdatedUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async insertUser(userData: NewUserDto) {
    const user = await this.findUserByEmail(userData.email);

    if (!user) {
      return this.prisma.user.create({
        data: userData,
      });
    }

    return user;
  }

  // Find user by internal ID
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

  // Find user by Google ID (Supabase auth ID)
  async findUserByGoogleId(googleId: string) {
    const user = await this.prisma.user.findUnique({
      where: { google_id: googleId },
      include: {
        mentoredGroups: true,
        group: {
          include: {
            mentor: true,
          },
        },
      },
    });
    return user; // Return null if not found (don't throw exception for auth flow)
  }

  // Update user's google_id
  async updateGoogleId(userId: string, googleId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { google_id: googleId },
      include: {
        mentoredGroups: true,
        group: {
          include: {
            mentor: true,
          },
        },
      },
    });
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
