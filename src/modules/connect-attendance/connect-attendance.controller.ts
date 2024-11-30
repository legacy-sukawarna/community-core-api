import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
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

@ApiTags('ConnectAttendance')
@ApiBearerAuth() // Indicates that JWT is required
@Controller('connect-attendance')
@UseGuards(AuthGuard) // Protect all routes with AuthGuard
export class ConnectAttendanceController {
  constructor(
    private readonly connectAttendanceService: ConnectAttendanceService,
  ) {}

  @ApiOperation({ summary: 'Create an attendance record' })
  @ApiBody({
    schema: {
      example: {
        group_id: 'group-123',
        mentor_id: 'mentor-123',
        location: 'Church Hall A',
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
    body: {
      group_id: string;
      mentor_id: string;
      location: string;
      photo_url?: string;
      date: string;
    },
  ) {
    return this.connectAttendanceService.createAttendance({
      ...body,
      date: new Date(body.date),
    });
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
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.connectAttendanceService.getAttendance({
      group_id,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @ApiOperation({ summary: 'Get attendance record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Attendance record retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  @Get(':id')
  async getAttendanceById(@Param('id') id: string) {
    return this.connectAttendanceService.getAttendanceById(id);
  }
}
