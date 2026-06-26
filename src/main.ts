import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { logger: ['log', 'warn', 'error', 'debug'] });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const apiVersion = configService.get<string>('app.apiVersion', 'v1');
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
  const corsOrigin = configService.get<string[]>('app.corsOrigin', ['*']);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS — `origin: true` reflects the request origin, required when credentials: true + wildcard
  const isWildcard = corsOrigin.includes('*');
  app.enableCors({
    origin: isWildcard ? true : corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global prefix & versioning
  app.setGlobalPrefix(`api/${apiVersion}`);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger (disabled in production)
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('CloudSolutions API')
      .setDescription(
        `
## API Structure

| Panel | Prefix | Auth Required | Roles |
|-------|--------|---------------|-------|
| Public | \`/api/v1/health\`, \`/api/v1/courses\` | No | — |
| Auth | \`/api/v1/auth\` | Partial | — |
| Student | \`/api/v1/student/*\` | Yes | STUDENT |
| Admin | \`/api/v1/admin/*\` | Yes | ADMIN, SUPER_ADMIN |
| Super Admin | \`/api/v1/superadmin/*\` | Yes | SUPER_ADMIN |

## Authentication
All protected endpoints require a Bearer token:
\`Authorization: Bearer <access_token>\`
      `,
      )
      .setVersion(apiVersion)
      .addBearerAuth()
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Public — Health', 'Health check')
      .addTag('Public — Courses', 'Publicly accessible course listings')
      .addTag('Student — Profile', 'Student profile management')
      .addTag('Student — Courses', 'Course browsing and enrollment')
      .addTag('Admin — Users', 'Admin user management')
      .addTag('Admin — Students', 'Admin student management')
      .addTag('Admin — Courses', 'Admin course management')
      .addTag('Super Admin — Dashboard', 'Platform-wide analytics')
      .addTag('Super Admin — Users', 'Full user CRUD')
      .addTag('Super Admin — Admins', 'Admin account management')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    logger.log(`Swagger docs → http://localhost:${port}/api/docs`);
  }

  await app.listen(port);

  logger.log(`Application running on http://localhost:${port}`);
  logger.log(`API base URL: http://localhost:${port}/api/${apiVersion}`);
  logger.log(`Environment: ${nodeEnv}`);
}

bootstrap();
