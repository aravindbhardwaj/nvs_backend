import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  bcrypt: {
    rounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
  },

  password: {
    minLength: 12,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialCharacter: true,
  },

  login: {
    maxAttempts: Number(process.env.MAX_LOGIN_ATTEMPTS ?? 5),
    lockMinutes: Number(process.env.ACCOUNT_LOCK_MINUTES ?? 30),
  },
}));
