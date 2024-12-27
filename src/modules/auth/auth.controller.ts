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

      // Upsert the user in your database
      const savedUser = await this.userService.insertUser({
        id: user.id,
        email: user.email,
        name: user.user_metadata.full_name || user.email,
        role: 'MEMBER', // Default role for new users
        phone: user.phone,
      });

      return {
        message: 'Login successful',
        user: savedUser,
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
