import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ConnectGroupService } from './connect-group.service';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateGroupDto, UpdateGroupDto } from './dto/connect-group.dto';

@ApiTags('ConnectGroups')
@ApiBearerAuth()
@Controller('connect-groups')
@UseGuards(AuthGuard) // Protect all routes
export class ConnectGroupController {
  constructor(private readonly connectGroupService: ConnectGroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Connect Group' })
  @ApiBody({
    schema: {
      example: {
        name: 'Group Alpha',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Connect Group created successfully',
  })
  async createGroup(@Body() body: CreateGroupDto) {
    return this.connectGroupService.createGroup(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Connect Groups or filter by leader' })
  @ApiQuery({
    name: 'mentor_id',
    required: false,
    description: 'Filter by leader ID',
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
    description: 'List of Connect Groups retrieved successfully',
  })
  async getGroups(
    @Query('mentor_id') mentor_id?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.connectGroupService.getGroups(
      mentor_id ? { mentor_id } : undefined,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a Connect Group by ID' })
  @ApiParam({ name: 'id', description: 'Connect Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Connect Group retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Connect Group not found' })
  async getGroupById(@Param('id') id: string) {
    return this.connectGroupService.getGroupById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a Connect Group by ID' })
  @ApiParam({ name: 'id', description: 'Connect Group ID' })
  @ApiBody({
    schema: {
      example: {
        name: 'Updated Group Name',
        mentor_id: 'new-leader-123',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Connect Group updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Connect Group not found' })
  async updateGroup(@Param('id') id: string, @Body() body: UpdateGroupDto) {
    return this.connectGroupService.updateGroup(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Connect Group by ID' })
  @ApiParam({ name: 'id', description: 'Connect Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Connect Group deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Connect Group not found' })
  async deleteGroup(@Param('id') id: string) {
    return this.connectGroupService.deleteGroup(id);
  }
}
