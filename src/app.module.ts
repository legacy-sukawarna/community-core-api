import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { SupabaseModule } from './services/supabase/supabase.module';
import { LoggingModule } from './logging/logging.module';
import { ConnectAttendanceModule } from './modules/connect-attendance/connect-attendance.module';
import { ConnectGroupModule } from './modules/connect-group/connect-group.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    SupabaseModule,
    LoggingModule,
    ConnectAttendanceModule,
    ConnectGroupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
