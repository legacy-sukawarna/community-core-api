import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService, HealthStatus } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getHealth(): Promise<HealthStatus> {
    return this.healthService.checkHealth();
  }

  @Get('ping')
  @HttpCode(HttpStatus.OK)
  async ping(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'pong',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  async readiness(): Promise<{
    status: string;
    timestamp: string;
    database: string;
    memory: string;
    uptime: number;
  }> {
    const health = await this.healthService.checkHealth();

    if (health.status === 'healthy') {
      return {
        status: 'ready',
        timestamp: health.timestamp,
        database: health.database.status,
        memory: `${health.memory.percentage}%`,
        uptime: health.uptime,
      };
    } else {
      throw new Error('Service not ready');
    }
  }
}
