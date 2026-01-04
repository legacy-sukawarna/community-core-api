import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { SupabaseModule } from './services/supabase/supabase.module';
import { LoggingModule } from './logging/logging.module';
import { ConnectAttendanceModule } from './modules/connect-attendance/connect-attendance.module';
import { ConnectGroupModule } from './modules/connect-group/connect-group.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { BlogModule } from './modules/blog/blog.module';
import { EventNoticeModule } from './modules/event-notice/event-notice.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    SupabaseModule,
    LoggingModule,
    ConnectAttendanceModule,
    ConnectGroupModule,
    HealthModule,
    BlogModule,
    EventNoticeModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
