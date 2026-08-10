import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET!,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '30m',
}));
