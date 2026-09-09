import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  PayloadTooLargeException,
} from '@nestjs/common';
import { catchError, throwError } from 'rxjs';

export class UploadSizeErrorInterceptor implements NestInterceptor {
  constructor(private readonly maxFileSize: number) {}

  intercept(_context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      catchError((error: unknown) => {
        if (
          error instanceof PayloadTooLargeException &&
          error.message === 'File too large'
        ) {
          const sizeInMb = this.maxFileSize / (1024 * 1024);
          return throwError(
            () =>
              new PayloadTooLargeException(
                `File too large. Maximum allowed size is ${sizeInMb} MB per file.`,
              ),
          );
        }
        return throwError(() => error);
      }),
    );
  }
}
