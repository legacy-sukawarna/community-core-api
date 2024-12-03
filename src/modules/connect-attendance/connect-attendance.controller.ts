import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UseGuards,
  Put,
  Delete,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ConnectAttendanceService } from './connect-attendance.service';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CreateAttendanceDto } from './dto/connect-attendance.dto';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/guard/roles.decorator';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('ConnectAttendance')
@ApiBearerAuth() // Indicates that JWT is required
@Controller('connect-attendance')
@UseGuards(AuthGuard, RolesGuard) // Protect all routes with AuthGuard
@Roles('ADMIN', 'MENTOR')
export class ConnectAttendanceController {
  constructor(
    private readonly connectAttendanceService: ConnectAttendanceService,
  ) {}

  @ApiOperation({ summary: 'Create an attendance record' })
  @ApiBody({
    schema: {
      example: {
        group_id: 'group-123',
        notes: 'Church Hall A',
        photo_url: 'https://example.com/photo.jpg',
        date: '2024-01-01T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Attendance record created successfully',
  })
  @Post()
  async createAttendance(
    @Body()
    body: CreateAttendanceDto,
  ) {
    return this.connectAttendanceService.createAttendance(body);
  }

  @ApiOperation({ summary: 'Get attendance records' })
  @ApiQuery({
    name: 'group_id',
    required: false,
    description: 'Filter by group ID',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date (inclusive)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date (inclusive)',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance records retrieved successfully',
  })
  @Get()
  async getAttendance(
    @Query('group_id') group_id?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ) {
    return this.connectAttendanceService.getAttendance({
      group_id,
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
    });
  }

  @ApiOperation({ summary: 'Get attendance details' })
  @ApiResponse({
    status: 200,
    description: 'Attendance record retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  @Get(':id')
  async getDetails(@Param('id') id: string) {
    return this.connectAttendanceService.getAttendanceDetails(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { notes?: string; photo_url?: string; date?: Date },
  ) {
    return await this.connectAttendanceService.updateAttendance(id, body);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.connectAttendanceService.deleteAttendance(id);
  }

  @Get('/report/generate')
  async getReport(
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
    @Query('format') format: 'pdf' | 'sheet',
    @Res() res: Response,
  ) {
    const report = await this.connectAttendanceService.generateReport(
      new Date(start_date),
      new Date(end_date),
    );

    if (format === 'sheet') {
      const filePath =
        await this.connectAttendanceService.generateExcelSheet(report);

      // Set headers for file download
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${path.basename(filePath)}"`,
      );
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // Clean up the file after download
      fileStream.on('end', () => {
        fs.unlinkSync(filePath);
      });
      return;
    }

    if (format === 'pdf') {
      const file = await this.connectAttendanceService.generatePDF(report);
      return res.download(file); // Provide PDF as a download
    }

    return res.status(400).json({ message: 'Invalid format' });
  }
}
