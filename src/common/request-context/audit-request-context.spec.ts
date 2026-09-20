import { Request } from 'express';
import { getRequestIp, getRequestLocation } from './audit-request-context';

function request(
  headers: Request['headers'],
  remoteAddress = '::ffff:127.0.0.1',
): Request {
  return { headers, socket: { remoteAddress } } as Request;
}

describe('audit request context', () => {
  it('uses the originating forwarded IP and normalizes mapped addresses', () => {
    expect(
      getRequestIp(request({ 'x-forwarded-for': '203.0.113.10, 10.0.0.2' })),
    ).toBe('203.0.113.10');
    expect(getRequestIp(request({}))).toBe('127.0.0.1');
  });

  it('prefers CDN client IP headers', () => {
    expect(
      getRequestIp(
        request({
          'cf-connecting-ip': '198.51.100.7',
          'x-forwarded-for': '203.0.113.10',
        }),
      ),
    ).toBe('198.51.100.7');
  });

  it('builds a location from available proxy geo headers', () => {
    expect(
      getRequestLocation(
        request({
          'x-vercel-ip-city': 'New%20Delhi',
          'x-vercel-ip-country-region': 'DL',
          'x-vercel-ip-country': 'IN',
        }),
      ),
    ).toBe('New Delhi, DL, IN');
  });
});
