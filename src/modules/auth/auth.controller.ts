import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SupabaseService } from 'src/services/supabase/supabase.service';
import { UsersService } from '../users/users.service';
import { Role } from '@prisma/client';

@ApiTags('Auth') // Group endpoints under 'Auth'
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly userService: UsersService,
  ) {}

  @Get('google')
  @ApiResponse({ status: 302, description: 'Redirects to Google Login' })
  async redirectToGoogle() {
    try {
      const loginUrl = await this.supabaseService.signInWithOAuth('google');
      return { loginUrl };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Get('callback')
  @ApiQuery({ name: 'access_token', description: 'Supabase access token' })
  @ApiResponse({ status: 200, description: 'Handles login callback' })
  async handleCallback(
    @Query('access_token') accessToken: string,
    @Query('refresh_token') refreshToken: string,
    @Query('expires_in') expiresIn: string,
    @Query('token_type') tokenType: string,
  ) {
    try {
      if (!accessToken) {
        throw new UnauthorizedException('Access token is missing');
      }

      const { user } = await this.supabaseService.getUser(accessToken);

      // First, try to find user by google_id
      let existingUser = await this.userService.findUserByGoogleId(user.id);

      if (!existingUser) {
        // If not found by google_id, check if user exists with same email
        const userByEmail = await this.userService.findUserByEmail(user.email);

        if (userByEmail) {
          // User exists with same email but no google_id (created by admin)
          // Update the user with google_id and proceed with login
          this.logger.log(
            `Linking existing user ${userByEmail.email} with google_id ${user.id}`,
          );
          existingUser = await this.userService.updateGoogleId(
            userByEmail.id,
            user.id,
          );
        } else {
          // No existing user found, create new user
          this.logger.log(`Creating new user with email ${user.email}`);
          const newUser = await this.userService.insertUser({
            google_id: user.id,
            email: user.email,
            name: user.user_metadata.full_name || user.email,
            role: Role.MEMBER,
            phone: user.phone,
          });

          // Fetch the complete user data with relations
          existingUser = await this.userService.findUserById(newUser.id);
        }
      }

      return {
        message: 'Login successful',
        user: existingUser,
        profile_pic: user.user_metadata.picture,
        accessToken,
        refreshToken,
        expiresIn,
        tokenType,
      };
    } catch (error) {
      // Capture the exception in Sentry
      this.logger.error(error);

      // Re-throw the error to ensure it's handled by global exception filters
      throw error;
    }
  }

  @Post('refresh-token')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    const session = await this.supabaseService.refreshToken(refreshToken);
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    };
  }
}
