import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HealthService } from './health.service';

@Injectable()
export class HealthSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(HealthSchedulerService.name);

  constructor(private readonly healthService: HealthService) {}

  onModuleInit() {
    this.logger.log('Health scheduler service initialized');
  }

  // Run health check every day at 2:00 AM for daily monitoring
  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'daily-health-check',
    timeZone: 'UTC',
  })
  async runDailyHealthCheck() {
    this.logger.log('Starting daily health check...');
    await this.healthService.performHealthCheck();
  }
}
