import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/guard/roles.decorator';
import { UpdatedUserDto } from './dto/users.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @Roles('ADMIN', 'MENTOR')
  @ApiOperation({ summary: 'List all users or filter by role' })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: Role,
    description: 'Filter by user role',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search users by name or email',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
  })
  async listUsers(
    @Query('role') role?: Role,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.userService.listUsers(
      {
        role,
        search,
      },
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'MENTOR')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.userService.findUserById(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user data' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({
    schema: {
      example: {
        phone: '123-456-7890',
        congregation_id: 'cong-12345',
        gender: 'MALE',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'MENTOR',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(@Param('id') id: string, @Body() body: UpdatedUserDto) {
    return this.userService.updateUser(id, body);
  }
}
