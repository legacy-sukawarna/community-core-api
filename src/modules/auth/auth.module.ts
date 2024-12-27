import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SupabaseModule } from 'src/services/supabase/supabase.module';
import { LoggingModule } from 'src/logging/logging.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [SupabaseModule, UsersModule, LoggingModule],
  providers: [],
  controllers: [AuthController],
})
export class AuthModule {}
