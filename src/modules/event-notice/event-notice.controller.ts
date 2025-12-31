import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/guard/roles.decorator';
import { EventNoticeService } from './event-notice.service';
import {
  CreateEventNoticeDto,
  UpdateEventNoticeDto,
  EventNoticeQueryDto,
} from './dto/event-notice.dto';
import { EventStatus } from '@prisma/client';
import { SupabaseService } from 'src/services/supabase/supabase.service';

@ApiTags('Event Notices')
@Controller('event-notices')
export class EventNoticeController {
  constructor(
    private readonly eventNoticeService: EventNoticeService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // Public endpoint - only returns published event notices
  @Get()
  @ApiOperation({ summary: 'List published event notices (public)' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'List of published event notices retrieved',
  })
  async findAll(@Query() query: EventNoticeQueryDto) {
    return this.eventNoticeService.findAllEventNotices(query, false);
  }

  // Public endpoint - get all published event notices without pagination
  @Get('published')
  @ApiOperation({
    summary: 'List all published event notices without pagination (public)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all published event notices',
  })
  async findPublished() {
    return this.eventNoticeService.findPublishedEventNotices();
  }

  // Admin endpoint - returns all event notices including drafts
  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'EVENT_MANAGER')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all event notices including drafts (ADMIN/EVENT_MANAGER)',
  })
  @ApiQuery({ name: 'status', required: false, enum: EventStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of event notices retrieved',
  })
  async findAllAdmin(@Query() query: EventNoticeQueryDto, @Req() request) {
    return this.eventNoticeService.findAllEventNotices(query, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event notice by ID (public)' })
  @ApiParam({ name: 'id', description: 'Event notice ID' })
  @ApiResponse({ status: 200, description: 'Event notice retrieved' })
  @ApiResponse({ status: 404, description: 'Event notice not found' })
  async findOne(@Param('id') id: string) {
    return this.eventNoticeService.findEventNoticeById(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'EVENT_MANAGER')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new event notice (ADMIN/EVENT_MANAGER)',
  })
  @ApiBody({ type: CreateEventNoticeDto })
  @ApiResponse({ status: 201, description: 'Event notice created' })
  async create(@Body() data: CreateEventNoticeDto, @Req() request) {
    return this.eventNoticeService.createEventNotice(data, request.user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'EVENT_MANAGER')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an event notice (ADMIN/EVENT_MANAGER)',
  })
  @ApiParam({ name: 'id', description: 'Event notice ID' })
  @ApiBody({ type: UpdateEventNoticeDto })
  @ApiResponse({ status: 200, description: 'Event notice updated' })
  async update(
    @Param('id') id: string,
    @Body() data: UpdateEventNoticeDto,
    @Req() request,
  ) {
    return this.eventNoticeService.updateEventNotice(
      id,
      data,
      request.user.id,
      request.user.role,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'EVENT_MANAGER')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete an event notice (ADMIN/EVENT_MANAGER)',
  })
  @ApiParam({ name: 'id', description: 'Event notice ID' })
  @ApiResponse({ status: 200, description: 'Event notice deleted' })
  async remove(@Param('id') id: string, @Req() request) {
    return this.eventNoticeService.deleteEventNotice(
      id,
      request.user.id,
      request.user.role,
    );
  }

  @Patch(':id/publish')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'EVENT_MANAGER')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publish an event notice (ADMIN/EVENT_MANAGER)',
  })
  @ApiParam({ name: 'id', description: 'Event notice ID' })
  @ApiResponse({ status: 200, description: 'Event notice published' })
  async publish(@Param('id') id: string, @Req() request) {
    return this.eventNoticeService.publishEventNotice(
      id,
      request.user.id,
      request.user.role,
    );
  }

  @Patch(':id/unpublish')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'EVENT_MANAGER')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Unpublish an event notice (ADMIN/EVENT_MANAGER)',
  })
  @ApiParam({ name: 'id', description: 'Event notice ID' })
  @ApiResponse({ status: 200, description: 'Event notice unpublished' })
  async unpublish(@Param('id') id: string, @Req() request) {
    return this.eventNoticeService.unpublishEventNotice(
      id,
      request.user.id,
      request.user.role,
    );
  }

  @Post('upload-poster')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'EVENT_MANAGER')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an event poster image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Poster image uploaded' })
  async uploadPoster(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
      );
    }

    // Create a modified file object with unique filename
    const uniqueFile = {
      ...file,
      originalname: `event-posters/${Date.now()}-${file.originalname}`,
    };

    // Upload to Supabase Storage
    const url = await this.supabaseService.uploadFile(
      'event-posters',
      uniqueFile,
    );

    return { url };
  }
}
