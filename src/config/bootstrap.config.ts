/* istanbul ignore file */

import helmet from 'helmet';
import { INestApplication } from '@nestjs/common';

/**
 * Shared configuration for the nest application.
 * Much of this would otherwise be duplicated between
 * the 'lambda-entry' and 'main' functions that bootstrap
 * the application.
 */

export function bootstrapConfig(nestApp: INestApplication): void {
  nestApp.use(helmet());

  //ValidationPipe is not configured here, see GroupAwarePipe
}
