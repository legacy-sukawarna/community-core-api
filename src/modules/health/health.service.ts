import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  database: {
    status: 'connected' | 'disconnected' | 'error';
    responseTime?: number;
    error?: string;
  };
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();

    // Get memory usage
    const memUsage = process.memoryUsage();
    const memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    };

    // Check database connectivity
    let databaseStatus: HealthStatus['database'];

    try {
      const dbStartTime = Date.now();

      // Simple query to test database connectivity
      await this.prisma.$queryRaw`SELECT 1 as health_check`;

      const dbResponseTime = Date.now() - dbStartTime;

      databaseStatus = {
        status: 'connected',
        responseTime: dbResponseTime,
      };

      this.logger.log(`Database health check passed in ${dbResponseTime}ms`);
    } catch (error) {
      databaseStatus = {
        status: 'error',
        error:
          error instanceof Error ? error.message : 'Unknown database error',
      };

      this.logger.error('Database health check failed', error);
    }

    // Determine overall health status
    const overallStatus: 'healthy' | 'unhealthy' =
      databaseStatus.status === 'connected' ? 'healthy' : 'unhealthy';

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp,
      database: databaseStatus,
      uptime,
      memory,
    };

    // Log health check results
    if (overallStatus === 'healthy') {
      this.logger.log(
        `Health check passed - Database: ${databaseStatus.status}, Response time: ${databaseStatus.responseTime}ms`,
      );
    } else {
      this.logger.error(
        `Health check failed - Database: ${databaseStatus.status}, Error: ${databaseStatus.error}`,
      );
    }

    return healthStatus;
  }

  async performHealthCheck(): Promise<void> {
    try {
      const health = await this.checkHealth();

      if (health.status === 'healthy') {
        this.logger.log('Daily health check completed successfully');
      } else {
        this.logger.error('Daily health check failed', {
          databaseStatus: health.database.status,
          error: health.database.error,
        });
      }
    } catch (error) {
      this.logger.error('Error during health check', error);
    }
  }
}
