import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryService {
  private isEnabled = false;

  constructor() {
    // Enable Sentry only in non-local environments
    if (process.env.NODE_ENV !== 'development') {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 1.0, // Adjust for production as needed
      });
      this.isEnabled = true;

      // Enable breadcrumb logging for console logs
      this.configureBreadcrumbLogging();
    }
  }

  private configureBreadcrumbLogging() {
    if (this.isEnabled) {
      const consoleLog = console.log;
      const consoleError = console.error;
      const consoleWarn = console.warn;

      console.log = (...args) => {
        Sentry.addBreadcrumb({
          category: 'console',
          message: args.join(' '),
          level: 'info',
        });
        consoleLog(...args);
      };

      console.error = (...args) => {
        Sentry.addBreadcrumb({
          category: 'console',
          message: args.join(' '),
          level: 'error',
        });
        consoleError(...args);
      };

      console.warn = (...args) => {
        Sentry.addBreadcrumb({
          category: 'console',
          message: args.join(' '),
          level: 'warning',
        });
        consoleWarn(...args);
      };
    }
  }

  captureException(exception: any) {
    if (this.isEnabled) {
      Sentry.captureException(exception);
    }
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    if (this.isEnabled) {
      Sentry.captureMessage(message, level);
    }
  }
}
