import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService) {
    // In production, add pgbouncer=true to disable prepared statements
    const isProduction = configService.get<string>('NODE_ENV') === 'production';
    const databaseUrl = configService.get<string>('DATABASE_URL');

    let connectionUrl = databaseUrl;
    if (
      isProduction &&
      databaseUrl &&
      !databaseUrl.includes('pgbouncer=true')
    ) {
      connectionUrl = databaseUrl.includes('?')
        ? `${databaseUrl}&pgbouncer=true`
        : `${databaseUrl}?pgbouncer=true`;
    }

    super({
      ...(isProduction && { datasourceUrl: connectionUrl }),
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
        {
          emit: 'event',
          level: 'error',
        },
      ],
    });
  }

  async onModuleInit() {
    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      this.$on('query', (e) => {
        console.log(e);
      });
      this.$on('info', (e) => {
        console.log(e);
      });
      this.$on('warn', (e) => {
        console.log(e);
      });
    }

    this.$on('error', (e) => {
      console.log(e);
    });

    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
