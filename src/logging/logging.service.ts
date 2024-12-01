import { ConsoleLogger, LogLevel } from '@nestjs/common';
import * as Sentry from '@sentry/node';

export class SentryLogger extends ConsoleLogger {
  constructor() {
    super();
  }

  initializeSentry() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    });

    this.configureBreadcrumbLogging();
  }

  log(message: string, context?: string) {
    super.log(message, context);
    Sentry.captureMessage(message, 'info');
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
    Sentry.captureMessage(message, 'warning');
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context);
    Sentry.captureException(new Error(message));
  }

  debug(message: string, context?: string) {
    super.debug(message, context);
    Sentry.captureMessage(message, 'debug');
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context);
    Sentry.captureMessage(message, 'log');
  }

  private configureBreadcrumbLogging() {
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

  captureLog(
    level: LogLevel,
    message: string,
    context?: string,
    trace?: string,
  ) {
    // Send to Sentry
    if (level === 'error') {
      Sentry.captureException(new Error(message));
    } else {
      Sentry.captureMessage(
        `[${level.toUpperCase()}] ${message} - Context: ${context ?? 'N/A'}`,
      );
    }

    // Log locally if needed
    console[level]?.(`[${level.toUpperCase()}] ${message}`, trace);
  }
}
