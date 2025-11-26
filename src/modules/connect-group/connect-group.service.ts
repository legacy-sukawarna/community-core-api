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

      //Check if mentor dont have any active (non-deleted) group
      const mentorGroups = await this.prisma.group.findMany({
        where: {
          mentor_id: data.mentor_id,
          deleted_at: null, // Only check active groups
        },
      });

      if (mentorGroups.length > 0) {
        throw new BadRequestException('Mentor already has a group');
      }

      if (!mentor || mentor.role !== Role.MENTOR) {
        throw new NotFoundException('Mentor not found or is not a mentor');
      }
    }

    // Check if name is already taken by an active (non-deleted) group
    const existingGroup = await this.prisma.group.findFirst({
      where: {
        name: data.name,
        deleted_at: null, // Only check active groups
      },
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
  async getGroups(
    filter?: { mentor_id?: string },
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    // Add deleted_at: null filter to exclude soft-deleted groups
    const whereClause = {
      ...filter,
      deleted_at: null,
    };

    const [groups, total] = await Promise.all([
      this.prisma.group.findMany({
        include: {
          mentees: true,
          mentor: true,
        },
        where: whereClause,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.group.count({
        where: whereClause,
      }),
    ]);

    return {
      records: groups,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get a group by ID
  async getGroupById(id: string) {
    const group = await this.prisma.group.findFirst({
      where: {
        id,
        deleted_at: null, // Exclude soft-deleted groups
      },
      include: { mentees: true },
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  // Update a group by ID
  async updateGroup(id: string, data: UpdateGroupDto) {
    const group = await this.prisma.group.findFirst({
      where: {
        id,
      },
    });
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

  // Soft delete a group by ID
  async deleteGroup(id: string) {
    const group = await this.prisma.group.findFirst({
      where: {
        id,
        deleted_at: null, // Can only soft-delete non-deleted groups
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    // Soft delete by setting deleted_at timestamp
    return this.prisma.group.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
