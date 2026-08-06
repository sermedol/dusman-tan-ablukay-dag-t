import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

const logger = new Logger('NestApplication');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'error', 'log', 'warn'],
  });

  const port = process.env.API_PORT || 3001;
  const host = process.env.API_HOST || '0.0.0.0';

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      process.env.ADMIN_NEXT_PUBLIC_BASE_URL || 'http://localhost:3002',
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  await app.listen(port, host);
  logger.log(`🚀 Server listening on ${host}:${port}`);
  logger.log(`📚 API docs available at http://${host}:${port}/api/v1/docs`);
}

bootstrap().catch((err) => {
  logger.error('Failed to start application', err);
  process.exit(1);
});
