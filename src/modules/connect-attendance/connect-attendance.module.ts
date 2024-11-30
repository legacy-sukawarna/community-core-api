import { Module } from '@nestjs/common';
import { ConnectAttendanceService } from './connect-attendance.service';
import { ConnectAttendanceController } from './connect-attendance.controller';
import { SupabaseModule } from 'src/services/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [ConnectAttendanceService],
  controllers: [ConnectAttendanceController],
})
export class ConnectAttendanceModule {}
