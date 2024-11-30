import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SupabaseModule } from 'src/services/supabase/supabase.module';
import { LoggingModule } from 'src/logging/logging.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [SupabaseModule, UserModule, LoggingModule],
  providers: [],
  controllers: [AuthController],
})
export class AuthModule {}
