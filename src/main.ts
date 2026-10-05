import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

import { AppModule } from './app.module';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { PrismaService } from './prisma/prisma.service';
import { auditRequestContextMiddleware } from './common/request-context/audit-request-context';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const config = app.get(ConfigService);

  const requestBodyLimit = config.getOrThrow<string>('app.requestBodyLimit');

  app.use(json({ limit: requestBodyLimit }));
  app.use(urlencoded({ extended: true, limit: requestBodyLimit }));

  app.use(auditRequestContextMiddleware);

  const corsOrigins = config.getOrThrow<string[]>('app.corsOrigins');

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

  const port = config.getOrThrow<number>('app.port');

  await app.listen(port);

  const logger = new Logger('Bootstrap');

  logger.log(`Application started on http://localhost:${port}`);
}

bootstrap();
