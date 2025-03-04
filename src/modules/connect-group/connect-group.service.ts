import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto, UpdateGroupDto } from './dto/connect-group.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ConnectGroupService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new Connect Group
  async createGroup(data: CreateGroupDto) {
    // If mentor_id is provided, check if mentor exists and is a mentor
    if (data.mentor_id) {
      // Check if mentor exists and is a mentor
      const mentor = await this.prisma.user.findUnique({
        where: { id: data.mentor_id },
      });

      //Check if mentor dont have any group
      const mentorGroups = await this.prisma.group.findMany({
        where: { mentor_id: data.mentor_id },
      });

      if (mentorGroups.length > 0) {
        throw new BadRequestException('Mentor already has a group');
      }

      if (!mentor || mentor.role !== Role.MENTOR) {
        throw new NotFoundException('Mentor not found or is not a mentor');
      }
    }

    // Check if name is already taken
    const existingGroup = await this.prisma.group.findUnique({
      where: { name: data.name },
    });

    if (existingGroup) {
      throw new BadRequestException('Group name already exists');
    }

    return this.prisma.group.create({
      data: {
        name: data.name,
        mentor_id: data.mentor_id,
      },
    });
  }

  // Get all groups or filter by leader ID
  async getGroups(filter?: { mentor_id?: string }) {
    return this.prisma.group.findMany({
      include: {
        mentees: true,
        mentor: true,
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
      },
    });
  }

  // Delete a group by ID
  async deleteGroup(id: string) {
    return this.prisma.group.delete({ where: { id } });
  }
}
