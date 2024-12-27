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
  UseInterceptors,
  UploadedFile,
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
  ApiConsumes,
} from '@nestjs/swagger';
import { CreateAttendanceDto } from './dto/connect-attendance.dto';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/guard/roles.decorator';
import * as path from 'path';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('ConnectAttendance')
@ApiBearerAuth() // Indicates that JWT is required
@Controller('connect-attendance')
@UseGuards(AuthGuard, RolesGuard) // Protect all routes with AuthGuard
@Roles('ADMIN', 'MENTOR')
export class ConnectAttendanceController {
  constructor(
    private readonly connectAttendanceService: ConnectAttendanceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create an attendance record' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Attendance record created successfully',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        group_id: { type: 'string', example: '12345', description: 'Group ID' },
        notes: {
          type: 'string',
          example: 'New York',
          description: 'Notes for the attendance',
        },
        date: {
          type: 'string',
          format: 'date',
          example: '2024-12-03',
          description: 'Attendance date',
        },
        photo_file: {
          type: 'string',
          format: 'binary',
          description: 'Photo file for documentation',
        },
      },
      required: ['group_id', 'date'],
    },
  })
  @UseInterceptors(FileInterceptor('photo_file')) // Match the field name in the DTO
  async createAttendance(
    @Body()
    body: CreateAttendanceDto,
    @UploadedFile() photo_file: Express.Multer.File,
  ) {
    return this.connectAttendanceService.createAttendance({
      ...body,
      photo_file,
    });
  }

  @Get()
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
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    type: 'number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10)',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance records retrieved successfully',
  })
  async getAttendance(
    @Query('group_id') group_id?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.connectAttendanceService.getAttendance({
      group_id,
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance details' })
  @ApiResponse({
    status: 200,
    description: 'Attendance record retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
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

  @Delete(':id')
  @Roles('ADMIN')
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
