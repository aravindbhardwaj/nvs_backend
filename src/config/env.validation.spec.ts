import { validateEnvironment } from './env.validation';

const validEnvironment = {
  DATABASE_URL: 'postgresql://localhost/database',
  JWT_SECRET: 'test-secret',
  PASSWORD_PRIVATE_KEY_PATH: '.secrets/password-private.pem',
};

describe('validateEnvironment', () => {
  it('accepts required values and preserves the environment', () => {
    expect(validateEnvironment(validEnvironment)).toBe(validEnvironment);
  });

  it('reports all missing required values', () => {
    expect(() => validateEnvironment({})).toThrow(
      'DATABASE_URL is required; JWT_SECRET is required; PASSWORD_PRIVATE_KEY_PATH is required',
    );
  });

  it.each([
    ['PORT', '0', 'PORT must be an integer between 1 and 65535'],
    [
      'BCRYPT_ROUNDS',
      'abc',
      'BCRYPT_ROUNDS must be an integer between 4 and 31',
    ],
    ['MAX_UPLOAD_SIZE', '-1', 'MAX_UPLOAD_SIZE must be a positive integer'],
    [
      'REQUEST_BODY_LIMIT',
      'large',
      'REQUEST_BODY_LIMIT must be a size such as 2mb',
    ],
  ])('rejects invalid %s values', (key, value, message) => {
    expect(() =>
      validateEnvironment({ ...validEnvironment, [key]: value }),
    ).toThrow(message);
  });
});
