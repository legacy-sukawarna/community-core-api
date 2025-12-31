import { Module } from '@nestjs/common';
import { EventNoticeService } from './event-notice.service';
import { EventNoticeController } from './event-notice.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from 'src/services/supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, SupabaseModule, AuthModule],
  providers: [EventNoticeService],
  controllers: [EventNoticeController],
  exports: [EventNoticeService],
})
export class EventNoticeModule {}

