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

  @ApiOperation({ summary: 'Create a new Connect Group' })
  @ApiBody({
    schema: {
      example: {
        name: 'Group Alpha',
        leader_id: 'user-123',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Connect Group created successfully',
  })
  @Post()
  async createGroup(@Body() body: CreateGroupDto) {
    return this.connectGroupService.createGroup(body);
  }

  @ApiOperation({ summary: 'Get all Connect Groups or filter by leader' })
  @ApiQuery({
    name: 'leader_id',
    required: false,
    description: 'Filter by leader ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of Connect Groups retrieved successfully',
  })
  @Get()
  async getGroups(@Query('leader_id') leader_id?: string) {
    return this.connectGroupService.getGroups(
      leader_id ? { leader_id } : undefined,
    );
  }

  @ApiOperation({ summary: 'Get a Connect Group by ID' })
  @ApiParam({ name: 'id', description: 'Connect Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Connect Group retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Connect Group not found' })
  @Get(':id')
  async getGroupById(@Param('id') id: string) {
    return this.connectGroupService.getGroupById(id);
  }

  @ApiOperation({ summary: 'Update a Connect Group by ID' })
  @ApiParam({ name: 'id', description: 'Connect Group ID' })
  @ApiBody({
    schema: {
      example: {
        name: 'Updated Group Name',
        leader_id: 'new-leader-123',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Connect Group updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Connect Group not found' })
  @Put(':id')
  async updateGroup(@Param('id') id: string, @Body() body: UpdateGroupDto) {
    return this.connectGroupService.updateGroup(id, body);
  }

  @ApiOperation({ summary: 'Delete a Connect Group by ID' })
  @ApiParam({ name: 'id', description: 'Connect Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Connect Group deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Connect Group not found' })
  @Delete(':id')
  async deleteGroup(@Param('id') id: string) {
    return this.connectGroupService.deleteGroup(id);
  }
}
