import { Module } from '@nestjs/common';
import { SentryLogger } from './logging.service';

@Module({
  providers: [SentryLogger],
  exports: [SentryLogger],
})
export class LoggingModule {}
