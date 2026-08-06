import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { createRateLimitMiddleware } from './shared/middleware/rate-limit.middleware';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { ApiResponseInterceptor } from './shared/interceptors/api-response.interceptor';

const logger = new Logger('NestApplication');

/**
 * Parse CORS origins from environment variable
 */
function getCorsOrigins(): string[] {
  const corsEnv = process.env.CORS_ORIGINS || '';

  if (!corsEnv) {
    // Fallback for development
    return [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:3003',
    ];
  }

  return corsEnv.split(',').map(origin => origin.trim()).filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'error', 'log', 'warn'],
  });

  const port = process.env.API_PORT || 3001;
  const host = process.env.API_HOST || '0.0.0.0';
  const nodeEnv = process.env.NODE_ENV || 'development';

  // CORS Configuration
  const corsOrigins = getCorsOrigins();
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
  });

  // Rate Limiting
  const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
  const rateLimitMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

  app.use(
    createRateLimitMiddleware({
      windowMs: rateLimitWindowMs,
      maxRequests: rateLimitMaxRequests,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    })
  );

  // Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (nodeEnv === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    next();
  });

  // Global exception filters (most specific first)
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  app.setGlobalPrefix('api/v1');

  await app.listen(port, host);

  logger.log(`🚀 Server listening on ${host}:${port}`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
  logger.log(`🔐 CORS origins: ${corsOrigins.join(', ')}`);

  if (nodeEnv === 'development') {
    logger.debug(`📚 API available at http://${host}:${port}/api/v1`);
  }
}

bootstrap().catch((err) => {
  logger.error('Failed to start application', err);
  process.exit(1);
});
