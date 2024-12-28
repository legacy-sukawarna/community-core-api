import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { SentryLogger } from './logging/logging.service';
import { VersioningType } from '@nestjs/common';
import { AllExceptionsFilter } from './lib/filters/all-exceptions.filter';
import { bootstrapConfig } from './config/bootstrap.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'development'
        ? ['log', 'debug', 'error', 'verbose', 'warn']
        : ['log', 'error', 'warn'],
  });

  bootstrapConfig(app);

  app.enableCors({
    origin: ['https://legacy-website-chi.vercel.app', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI, // This will add /v1, /v2 etc. to URLs
  });

  if (process.env.NODE_ENV !== 'development') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    });
  }

  app.useLogger(new SentryLogger());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Community Core API')
    .setDescription('API documentation for the Community Core')
    .setVersion('1.0')
    .addBearerAuth() // Add JWT authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
