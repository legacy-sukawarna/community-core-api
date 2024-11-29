import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SupabaseModule } from './services/supabase/supabase.module';
import { LoggingModule } from './logging/logging.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    SupabaseModule,
    LoggingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
