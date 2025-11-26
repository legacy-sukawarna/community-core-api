import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as os from 'os';
import { CreateAttendanceDto } from './dto/connect-attendance.dto';
import { SupabaseService } from 'src/services/supabase/supabase.service';
import * as fs from 'fs';
import {
  groupAttendanceByMonth,
  buildGroupsForMonth,
  calculateAttendancePercentage,
  countGroupsWithAttendance,
} from './utils/report.utils';
import {
  extractMonthNames,
  buildGroupDataMap,
  sortGroupsByName,
  createTitleCell,
  createHeaderRow,
  addGroupDataRows,
  addSummaryRows,
  setColumnWidths,
  addBordersToAllCells,
  highlightSummaryRows,
} from './utils/excel.utils';

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
    sort_by?: string;
    sort_order?: string;
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
        orderBy: {
          [filter.sort_by || 'date']: filter.sort_order || 'desc',
        },
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
    // Fetch data
    const [allAttendance, allGroups] = await Promise.all([
      this.prisma.connectAttendance.findMany({
        where: { date: { gte: start_date, lte: end_date } },
        select: { group_id: true, date: true },
      }),
      this.prisma.group.findMany({
        include: {
          mentor: {
            select: {
              id: true,
              name: true,
              email: true,
              gender: true,
              phone: true,
            },
          },
        },
        where: { deleted_at: null },
      }),
    ]);

    // Group attendance by month
    const monthlyData = groupAttendanceByMonth(allAttendance);
    const sortedMonths = Array.from(monthlyData.keys()).sort();

    // Build monthly attendance structure
    const monthlyAttendance = sortedMonths.map((monthKey) => {
      const monthMap = monthlyData.get(monthKey);
      const groups = buildGroupsForMonth(allGroups, monthMap);
      const groupsWithAttendanceThisMonth = countGroupsWithAttendance(groups);

      return {
        month: monthKey,
        groupsWithAttendance: groupsWithAttendanceThisMonth,
        attendancePercentage: calculateAttendancePercentage(
          groupsWithAttendanceThisMonth,
          allGroups.length,
        ),
        groups,
      };
    });

    // Calculate overall statistics
    const totalGroups = allGroups.length;

    return {
      start_date,
      end_date,
      totalGroups,
      monthlyAttendance,
    };
  }

  async generateExcelSheet(report: any): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance Report');

    // Prepare data
    const months = extractMonthNames(report.monthlyAttendance);
    const groupData = buildGroupDataMap(
      report.monthlyAttendance,
      months.length,
    );
    const sortedGroups = sortGroupsByName(groupData);

    // Build sheet structure
    createTitleCell(sheet, months.length + 1);
    createHeaderRow(sheet, months);

    // Add data rows
    let currentRow = addGroupDataRows(sheet, sortedGroups, 3);
    const summaryStartRow = currentRow;
    currentRow = addSummaryRows(sheet, report, months, currentRow);

    // Apply styling
    setColumnWidths(sheet, months.length);
    addBordersToAllCells(sheet, currentRow, months.length + 1);
    highlightSummaryRows(sheet, summaryStartRow, currentRow, months.length + 1);

    // Save file
    const exportsDir = os.tmpdir();
    const filePath = path.resolve(
      exportsDir,
      `attendance-report-${Date.now()}.xlsx`,
    );

    await workbook.xlsx.writeFile(filePath);

    if (!fs.existsSync(filePath)) {
      throw new Error('Failed to generate Excel file');
    }

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
