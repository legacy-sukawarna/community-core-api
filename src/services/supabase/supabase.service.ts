import { Injectable, Logger } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  logger = new Logger(SupabaseService.name);

  private readonly supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
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

  async uploadFile(bucket: string, file: Express.Multer.File) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(file.originalname, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    this.logger.log(`Uploaded file: ${data}`);

    // Get public URL of the photo
    const { data: publicUrlData } = this.supabase.storage
      .from('connect-photos')
      .getPublicUrl(file.originalname);

    return publicUrlData.publicUrl;
  }
}
