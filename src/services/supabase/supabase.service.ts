import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || '',
  );

  async getUser(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error) throw new Error(error.message);
    return data;
  }

  async signInWithOAuth(provider: 'google') {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo:
          process.env.REDIRECT_URL || 'http://localhost:3000/auth/callback',
      },
    });
    if (error) throw new Error(error.message);
    return data.url;
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new Error(`Failed to refresh session: ${error.message}`);
    }

    return data.session; // Contains new access_token and refresh_token
  }
}
