import { ArgumentsHost, BadRequestException, Logger } from '@nestjs/common';

import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  const status = jest.fn().mockReturnThis();
  const json = jest.fn();
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status, json }),
      getRequest: () => ({
        method: 'POST',
        url: '/api/pages/uuid/page-uuid/update',
        originalUrl: '/api/pages/uuid/page-uuid/update',
      }),
    }),
  } as unknown as ArgumentsHost;

  beforeEach(() => jest.clearAllMocks());

  it('logs an unexpected exception while retaining the safe response', () => {
    const logger = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const exception = new Error('Database update failed');

    new GlobalExceptionFilter().catch(exception, host);

    expect(logger).toHaveBeenCalledWith(
      'POST /api/pages/uuid/page-uuid/update - Database update failed',
      exception.stack,
    );
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 500,
        message: 'Internal server error',
        path: '/api/pages/uuid/page-uuid/update',
      }),
    );
  });

  it('does not log expected client errors', () => {
    const logger = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    new GlobalExceptionFilter().catch(
      new BadRequestException('Invalid request.'),
      host,
    );

    expect(logger).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(400);
  });

  it('returns 413 for an oversized request body', () => {
    const logger = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const exception = Object.assign(new Error('request entity too large'), {
      status: 413,
      type: 'entity.too.large',
    });

    new GlobalExceptionFilter().catch(exception, host);

    expect(logger).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(413);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 413,
        message: 'Request payload is too large.',
        path: '/api/pages/uuid/page-uuid/update',
      }),
    );
  });
});
