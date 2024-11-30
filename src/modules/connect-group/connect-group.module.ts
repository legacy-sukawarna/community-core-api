import { Module } from '@nestjs/common';
import { ConnectGroupController } from './connect-group.controller';
import { ConnectGroupService } from './connect-group.service';
import { SupabaseModule } from 'src/services/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ConnectGroupController],
  providers: [ConnectGroupService],
})
export class ConnectGroupModule {}
