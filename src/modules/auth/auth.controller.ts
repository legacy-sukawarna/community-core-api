import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SentryService } from 'src/logging/sentry.service';
import { SupabaseService } from 'src/services/supabase/supabase.service';
import { UserService } from '../user/user.service';

@ApiTags('Auth') // Group endpoints under 'Auth'
@Controller('auth')
export class AuthController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly userService: UserService,
    private readonly sentryService: SentryService,
  ) {}

  @Get('google')
  @ApiResponse({ status: 302, description: 'Redirects to Google Login' })
  async redirectToGoogle() {
    try {
      const loginUrl = await this.supabaseService.signInWithOAuth('google');
      this.sentryService.captureMessage('Google login URL generated', 'info');
      return { loginUrl };
    } catch (error) {
      this.sentryService.captureException(error);
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

      this.sentryService.captureMessage(`User fetched: ${user.email}`, 'info');

      // Upsert the user in your database
      const savedUser = await this.userService.upsertUser({
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
      this.sentryService.captureException(error);

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
