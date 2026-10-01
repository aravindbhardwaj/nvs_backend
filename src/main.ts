import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

import { AppModule } from './app.module';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { PrismaService } from './prisma/prisma.service';
import { auditRequestContextMiddleware } from './common/request-context/audit-request-context';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  const requestBodyLimit = process.env.REQUEST_BODY_LIMIT?.trim() || '2mb';

  app.use(json({ limit: requestBodyLimit }));
  app.use(urlencoded({ extended: true, limit: requestBodyLimit }));

  app.use(auditRequestContextMiddleware);

  const corsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'HEAD', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const prismaService = app.get(PrismaService);
  app.useGlobalInterceptors(new ResponseInterceptor(prismaService));

  await prismaService.enableShutdownHooks(app);

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);

  const logger = new Logger('Bootstrap');

  logger.log(`Application started on http://localhost:${port}`);
}

bootstrap();
