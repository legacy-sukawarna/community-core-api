import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as os from 'os';
import { CreateAttendanceDto } from './dto/connect-attendance.dto';
import { SupabaseService } from 'src/services/supabase/supabase.service';

@Injectable()
export class ConnectAttendanceService {
  logger = new Logger(ConnectAttendanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // Create attendance record
  createAttendance = async (data: CreateAttendanceDto) => {
    try {
      // Validate group_id exists
      const group = await this.prisma.group.findUnique({
        where: { id: data.group_id },
      });
      if (!group) throw new Error('Group not found');

      let photo_url = '';

      // Save photo to cloud storage if provided
      if (data.photo_file) {
        const uploaded = await this.supabaseService.uploadFile(
          'connect-photos',
          data.photo_file,
        );

        photo_url = uploaded;
      }

      // Create attendance
      const attendance = await this.prisma.connectAttendance.create({
        data: {
          group_id: data.group_id,
          date: new Date(data.date),
          photo_url,
          notes: data.notes,
        },
      });

      this.logger.log(
        `Attendance record created successfully for id ${attendance.id}`,
      );

      return attendance;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  };

  updateAttendance = async (
    id: string,
    data: Partial<{
      location: string;
      photo_url: string;
      date: Date;
    }>,
  ) => {
    try {
      // Check if attendance exists
      const attendance = await this.prisma.connectAttendance.findUnique({
        where: { id },
      });
      if (!attendance) throw new Error('Attendance record not found');

      data.date = new Date(data.date);

      // Update record
      return await this.prisma.connectAttendance.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  };

  deleteAttendance = async (id: string) => {
    // Check if attendance exists
    const attendance = await this.prisma.connectAttendance.findUnique({
      where: { id },
      include: { group: true },
    });
    if (!attendance) throw new Error('Attendance record not found');

    // Delete record
    return await this.prisma.connectAttendance.delete({ where: { id } });
  };

  // Get all attendance records for a group or within a date range
  getAttendanceByGroup = async (
    group_id: string,
    filters?: { startDate?: Date; endDate?: Date },
  ) => {
    const where: any = { group_id };
    if (filters?.startDate || filters?.endDate) {
      where.date = {
        ...(filters.startDate ? { gte: filters.startDate } : {}),
        ...(filters.endDate ? { lte: filters.endDate } : {}),
      };
    }

    return await this.prisma.connectAttendance.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  };

  getAttendanceDetails = async (id: string) => {
    return await this.prisma.connectAttendance.findUnique({
      where: { id },
      include: { group: true }, // Include related group if needed
    });
  };

  // Get all attendance records for a group or within a date range
  async getAttendance(filter: {
    group_id?: string;
    start_date?: Date;
    end_date?: Date;
    page?: number;
    limit?: number;
  }) {
    if (
      filter.start_date &&
      filter.end_date &&
      filter.start_date > filter.end_date
    ) {
      throw new BadRequestException('Start date must be before end date');
    }

    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      this.prisma.connectAttendance.findMany({
        where: {
          group_id: filter.group_id,
          date: {
            gte: filter.start_date,
            lte: filter.end_date,
          },
        },
        orderBy: { date: 'desc' },
        include: {
          group: {
            include: {
              mentor: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      this.prisma.connectAttendance.count({
        where: {
          group_id: filter.group_id,
          date: {
            gte: filter.start_date,
            lte: filter.end_date,
          },
        },
      }),
    ]);

    return {
      records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async generateReport(start_date: Date, end_date: Date) {
    const attendance = await this.prisma.connectAttendance.groupBy({
      by: ['group_id'],
      _count: { id: true }, // Count the attendance entries
      where: {
        date: { gte: start_date, lte: end_date },
      },
    });

    const totalGroups = await this.prisma.group.count();
    const groupsWithAttendance = attendance.length;
    const attendancePercentage = Number(
      (groupsWithAttendance / totalGroups) * 100,
    ).toFixed(2);

    const attendanceWithMentor = await Promise.all(
      attendance.map(async (record) => {
        const group = await this.prisma.group.findUnique({
          where: { id: record.group_id },
          include: {
            mentor: {
              // Include mentor details
              select: {
                name: true, // Fetch only the mentor's name
                email: true, // Optionally include more fields if needed
                gender: true,
              },
            },
          },
        });

        return {
          name: group?.mentor.name ?? 'Unknown',
          email: group?.mentor.email ?? 'Unknown',
          gender: group?.mentor.gender ?? 'Unknown',
          attendance_count: record._count.id,
        };
      }),
    );

    return {
      start_date,
      end_date,
      totalGroups,
      groupsWithAttendance,
      attendancePercentage,
      attendance: attendanceWithMentor,
    };
  }

  async generateExcelSheet(report: any): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    // Worksheet 1: Report Summary
    const summarySheet = workbook.addWorksheet('Report Summary');

    // Add Report Summary Title
    summarySheet.mergeCells('A1:B1'); // Merge across relevant columns
    summarySheet.getCell('A1').value = 'Report Summary';
    summarySheet.getCell('A1').font = { bold: true, size: 14 };

    // Add Report Summary Rows
    summarySheet.addRow(['Start Date', report.start_date.toLocaleDateString()]);
    summarySheet.addRow(['End Date', report.end_date.toLocaleDateString()]);
    summarySheet.addRow(['Total Groups', report.totalGroups]);
    summarySheet.addRow([
      'Groups With Attendance',
      report.groupsWithAttendance,
    ]);
    summarySheet.addRow([
      'Attendance Percentage',
      `${report.attendancePercentage}%`,
    ]);

    // Adjust column widths for better visibility
    summarySheet.columns = [
      { width: 25 }, // Column A
      { width: 30 }, // Column B
    ];

    // Worksheet 2: Attendance Data
    const attendanceSheet = workbook.addWorksheet('Attendance Data');

    // Add Headers for Attendance Data
    attendanceSheet.columns = [
      { header: 'Mentor Name', key: 'name', width: 25 },
      { header: 'Mentor Email', key: 'email', width: 30 },
      { header: 'Gender', key: 'gender', width: 15 },
      { header: 'Attendance Count', key: 'attendance_count', width: 20 },
    ];

    // Add rows
    report.attendance.forEach((record) => {
      attendanceSheet.addRow(record);
    });

    // Format headers
    const headerRow = attendanceSheet.getRow(1); // Adjust this index based on the rows above
    headerRow.font = { bold: true };

    const exportsDir = os.tmpdir(); // System temporary directory

    // Save the file
    const filePath = path.resolve(
      exportsDir,
      `attendance-report-${Date.now()}.xlsx`,
    );

    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  //TODO: Generate a PDF report
  async generatePDF(report: any): Promise<string> {
    // Use a library like pdfkit or puppeteer to generate a PDF
    const filePath = '/path/to/generated/report.pdf';
    // Logic to generate and save the PDF locally
    return filePath;
  }
}
