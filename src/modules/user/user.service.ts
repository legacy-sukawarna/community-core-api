import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Gender, Role } from '@prisma/client';

@Injectable()
export class UserService {
  logger = new Logger('UserService');

  constructor(private readonly prisma: PrismaService) {}

  async upsertUser(userData: {
    id: string;
    email: string;
    name: string;
    role: Role;
    phone: string;
  }) {
    return this.prisma.user.upsert({
      where: { email: userData.email },
      update: { name: userData.name },
      create: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'MEMBER',
        phone: userData.phone,
      },
    });
  }

  // Find user by ID
  async findUserById(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
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
  async listUsers(filter?: { role?: Role }) {
    this.logger.log(`Listing users with filter: ${JSON.stringify(filter)}`);
    return this.prisma.user.findMany({
      where: filter || {},
      orderBy: { created_at: 'desc' },
    });
  }

  // Delete a user by ID
  async deleteUser(userId: string) {
    return this.prisma.user.delete({ where: { id: userId } });
  }

  async updateUser(
    userId: string,
    updateData: { phone?: string; congregation_id?: string; gender?: Gender },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        updated_at: new Date(), // Update the timestamp
      },
    });
  }
}
