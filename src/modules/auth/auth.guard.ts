import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SupabaseService } from 'src/services/supabase/supabase.service';
import { decode } from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return false;
    }

    try {
      // Decode JWT token locally (without verification for performance)
      const decoded = decode(token) as any;

      if (!decoded) {
        this.logger.warn('Invalid JWT token structure');
        return false;
      }

      //! For now, only allow google auth
      if (decoded.app_metadata.provider === 'google') {
        // Extract user ID from JWT payload
        const userId = decoded.sub;

        // Fetch user from database using google_id (which is the Supabase user ID)
        const dbUser = await this.prisma.user.findUnique({
          where: { google_id: userId },
        });

        if (!dbUser) {
          this.logger.warn(
            `User not found in database for google_id: ${userId}`,
          );
          return false;
        }

        // Attach enriched user object to the request
        request.user = {
          id: dbUser.id,
          google_id: dbUser.google_id,
          email: dbUser.email,
          role: dbUser.role,
        };

        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error decoding JWT token:', error);
      return false;
    }
  }
}
