import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SentryExceptionFilter } from './logging/exception.filter';
import * as Sentry from '@sentry/node';
import { SentryLogger } from './logging/logging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'development'
        ? ['log', 'debug', 'error', 'verbose', 'warn']
        : ['log', 'error', 'warn'],
  });

  if (process.env.NODE_ENV !== 'development') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    });
  }

  app.useLogger(new SentryLogger());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Community Core API')
    .setDescription('API documentation for the Community Core')
    .setVersion('1.0')
    .addBearerAuth() // Add JWT authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Apply Sentry exception filter globally
  app.useGlobalFilters(new SentryExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
