import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto, UpdateGroupDto } from './dto/connect-group.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ConnectGroupService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new Connect Group
  async createGroup(data: CreateGroupDto) {
    // Check if mentor exists and is a mentor
    const mentor = await this.prisma.user.findUnique({
      where: { id: data.mentor_id },
    });

    if (!mentor || mentor.role !== Role.MENTOR) {
      throw new NotFoundException('Mentor not found or is not a mentor');
    }

    return this.prisma.group.create({
      data: {
        name: data.name,
        mentor_id: data.mentor_id,
        mentees: {
          connect: data.mentee_id.map((id) => ({ id })),
        },
      },
    });
  }

  // Get all groups or filter by leader ID
  async getGroups(filter?: { mentor_id?: string }) {
    return this.prisma.group.findMany({
      include: {
        mentees: true,
      },
      where: filter,
      orderBy: { created_at: 'desc' },
    });
  }

  // Get a group by ID
  async getGroupById(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: { mentees: true },
    });
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

    // Check if mentor exists and is a mentor
    const mentor = await this.prisma.user.findUnique({
      where: { id: data.mentor_id },
    });

    if (!mentor || mentor.role !== Role.MENTOR) {
      throw new NotFoundException('Mentor not found or is not a mentor');
    }

    return this.prisma.group.update({
      where: { id },
      data: {
        name: data.name,
        mentor_id: data.mentor_id,
        mentees: {
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
