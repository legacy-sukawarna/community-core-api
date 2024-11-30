import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConnectGroupService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new Connect Group
  async createGroup(data: { name: string; leaderId: string }) {
    return this.prisma.group.create({
      data: {
        name: data.name,
        leader: { connect: { id: data.leaderId } },
      },
    });
  }

  // Get all groups or filter by leader ID
  async getGroups(filter?: { leaderId?: string }) {
    const whereClause = filter?.leaderId
      ? { leader: { id: filter.leaderId } } // Map leaderId to the related leader field
      : {};

    return this.prisma.group.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
    });
  }

  // Get a group by ID
  async getGroupById(id: string) {
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  // Update a group by ID
  async updateGroup(id: string, data: { name?: string; leaderId?: string }) {
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return this.prisma.group.update({
      where: { id },
      data,
    });
  }

  // Delete a group by ID
  async deleteGroup(id: string) {
    return this.prisma.group.delete({ where: { id } });
  }
}
