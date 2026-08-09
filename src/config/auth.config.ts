import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  bcrypt: {
    rounds: 12,
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
    maxAttempts: 5,
    lockMinutes: 30,
  },
}));