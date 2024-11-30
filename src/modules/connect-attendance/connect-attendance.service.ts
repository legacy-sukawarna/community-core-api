import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConnectAttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  // Create attendance record
  async createAttendance(data: {
    group_id: string;
    mentor_id: string;
    location: string;
    photo_url?: string;
    date: Date;
  }) {
    return this.prisma.connectAttendance.create({
      data,
    });
  }

  // Get all attendance records for a group or within a date range
  async getAttendance(filter: {
    group_id?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.prisma.connectAttendance.findMany({
      where: {
        group_id: filter.group_id,
        date: {
          gte: filter.startDate,
          lte: filter.endDate,
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  // Get attendance record by ID
  async getAttendanceById(id: string) {
    const attendance = await this.prisma.connectAttendance.findUnique({
      where: { id },
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
    return attendance;
  }
}
