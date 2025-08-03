import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HealthSchedulerService } from './health-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [HealthController],
  providers: [HealthService, HealthSchedulerService],
  exports: [HealthService],
})
export class HealthModule {}
