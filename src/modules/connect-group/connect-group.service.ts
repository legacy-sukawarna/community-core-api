import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto, UpdateGroupDto } from './dto/connect-group.dto';

@Injectable()
export class ConnectGroupService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new Connect Group
  async createGroup(data: CreateGroupDto) {
    return this.prisma.group.create({
      data: {
        name: data.name,
        leader_id: data.leader_id,
        Users: {
          connect: data.mentee_id.map((id) => ({ id })),
        },
      },
    });
  }

  // Get all groups or filter by leader ID
  async getGroups(filter?: { leader_id?: string }) {
    return this.prisma.group.findMany({
      include: {
        Users: true,
      },
      where: filter,
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
  async updateGroup(id: string, data: UpdateGroupDto) {
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return this.prisma.group.update({
      where: { id },
      data: {
        name: data.name,
        leader_id: data.leader_id,
        Users: {
          set: data.mentee_id.map((id) => ({ id })),
        },
      },
    });
  }

  // Delete a group by ID
  async deleteGroup(id: string) {
    return this.prisma.group.delete({ where: { id } });
  }
}
