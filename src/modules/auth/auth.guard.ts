import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SupabaseService } from 'src/services/supabase/supabase.service';

@Injectable()
export class AuthGuard implements CanActivate {
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
      const user = await this.supabaseService.getUser(token);
      if (!user) {
        return false; // Invalid token
      }

      // Fetch user from database to enrich with role
      const dbUser = await this.prisma.user.findUnique({
        where: { email: user.user.email },
      });
      if (!dbUser) {
        return false; // User not found in the database
      }

      // Attach enriched user object to the request
      request.user = {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role, // Add role from database
      };
      return true;
    } catch {
      return false;
    }
  }
}
