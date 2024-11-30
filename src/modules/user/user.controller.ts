import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { UserService } from './user.service';
import { Gender, Role } from '@prisma/client';
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

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles('ADMIN', 'MENTOR')
  @ApiOperation({ summary: 'List all users or filter by role' })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: Role, // Add enum values
    description: 'Filter by user role',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
  })
  @Get()
  async listUsers(@Query('role') role?: Role) {
    return this.userService.listUsers(role ? { role } : undefined);
  }

  @Roles('ADMIN', 'MENTOR')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findUserById(id);
  }

  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Put(':id/role')
  async assignRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.userService.assignRole(id, role);
  }

  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @ApiOperation({ summary: 'Update user phone and congregation ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({
    schema: {
      example: {
        phone: '123-456-7890',
        congregation_id: 'cong-12345',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: { phone?: string; congregation_id?: string; gender?: Gender },
  ) {
    return this.userService.updateUser(id, body);
  }
}
