import 'dotenv/config';

import { registerAs } from '@nestjs/config';

export function getRateLimitConfiguration() {
  return {
    auth: {
      ttl: Number(process.env.AUTH_RATE_LIMIT_TTL_MS ?? 60_000),
      limit: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS ?? 5),
    },
    visitor: {
      ttl: Number(process.env.VISITOR_RATE_LIMIT_TTL_MS ?? 60_000),
      limit: Number(process.env.VISITOR_RATE_LIMIT_MAX_REQUESTS ?? 100),
    },
  };
}

export default registerAs('rateLimit', getRateLimitConfiguration);
