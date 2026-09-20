import { AsyncLocalStorage } from 'node:async_hooks';
import { NextFunction, Request, Response } from 'express';

export interface AuditRequestContext {
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

const auditRequestStorage = new AsyncLocalStorage<AuditRequestContext>();

function firstHeaderValue(
  value: string | string[] | undefined,
): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return first?.split(',')[0]?.trim() || undefined;
}

function normalizeIp(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const withoutMappedPrefix = value.replace(/^::ffff:/, '');
  return withoutMappedPrefix === '::1' ? '127.0.0.1' : withoutMappedPrefix;
}

export function getRequestIp(request: Request): string | undefined {
  return normalizeIp(
    firstHeaderValue(request.headers['cf-connecting-ip']) ??
      firstHeaderValue(request.headers['true-client-ip']) ??
      firstHeaderValue(request.headers['x-real-ip']) ??
      firstHeaderValue(request.headers['x-forwarded-for']) ??
      request.socket.remoteAddress,
  );
}

export function getRequestLocation(request: Request): string | undefined {
  const city = firstHeaderValue(
    request.headers['x-vercel-ip-city'] ??
      request.headers['cloudfront-viewer-city'],
  );
  const region = firstHeaderValue(
    request.headers['x-vercel-ip-country-region'] ??
      request.headers['cloudfront-viewer-country-region'],
  );
  const country = firstHeaderValue(
    request.headers['x-vercel-ip-country'] ??
      request.headers['cloudfront-viewer-country'] ??
      request.headers['cf-ipcountry'],
  );

  const parts = [city, region, country]
    .filter((part): part is string => Boolean(part))
    .map((part) => {
      try {
        return decodeURIComponent(part);
      } catch {
        return part;
      }
    });

  return parts.length > 0 ? [...new Set(parts)].join(', ') : undefined;
}

export function auditRequestContextMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  auditRequestStorage.run(
    {
      ipAddress: getRequestIp(request),
      userAgent: firstHeaderValue(request.headers['user-agent']),
      location: getRequestLocation(request),
    },
    next,
  );
}

export function getAuditRequestContext(): AuditRequestContext | undefined {
  return auditRequestStorage.getStore();
}
