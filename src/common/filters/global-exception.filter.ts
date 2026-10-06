import {
  BadRequestException,
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const parserError = exception as {
      status?: unknown;
      statusCode?: unknown;
      type?: unknown;
    } | null;

    if (
      parserError &&
      (parserError.status === HttpStatus.PAYLOAD_TOO_LARGE ||
        parserError.statusCode === HttpStatus.PAYLOAD_TOO_LARGE ||
        parserError.type === 'entity.too.large')
    ) {
      exception = new PayloadTooLargeException('Request payload is too large.');
    }

    // Prisma Errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          exception = new ConflictException('Record already exists.');
          break;

        case 'P2025':
          exception = new NotFoundException('Record not found.');
          break;

        case 'P2003':
          exception = new ConflictException(
            'Operation conflicts with a related record.',
          );
          break;

        case 'P2014':
          exception = new ConflictException(
            'Operation would violate a required relation.',
          );
          break;

        case 'P2000':
          exception = new BadRequestException(
            'One or more values exceed the allowed length.',
          );
          break;

        case 'P2024':
          exception = new ServiceUnavailableException(
            'Database is temporarily unavailable. Please try again later.',
          );
          break;

        case 'P2034':
          exception = new ConflictException(
            'Transaction conflict. Please retry the request.',
          );
          break;
      }
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const value = (response as { message: string | string[] }).message;

        message = Array.isArray(value) ? value.join(', ') : value;
      }
    }

    if (status >= 500) {
      const error = exception instanceof Error ? exception : undefined;
      this.logger.error(
        `${request.method} ${request.originalUrl || request.url} - ${
          error?.message ?? message
        }`,
        error?.stack,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
