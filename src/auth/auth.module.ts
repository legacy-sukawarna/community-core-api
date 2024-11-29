import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseModule } from 'src/services/supabase/supabase.module';
import { UserModule } from 'src/user/user.module';
import { LoggingModule } from 'src/logging/logging.module';

@Module({
  imports: [SupabaseModule, UserModule, LoggingModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
