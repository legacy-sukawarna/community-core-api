import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/services/supabase/supabase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return false;
    }

    try {
      const user = await this.supabaseService.getUser(token);
      request.user = user; // Attach the user to the request object
      return true;
    } catch {
      return false;
    }
  }
}
