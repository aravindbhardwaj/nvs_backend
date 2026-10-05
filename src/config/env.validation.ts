type Environment = Record<string, unknown>;

const REQUIRED_VARIABLES = [
  'DATABASE_URL',
  'JWT_SECRET',
  'PASSWORD_PRIVATE_KEY_PATH',
] as const;

const POSITIVE_INTEGER_VARIABLES = [
  'ACCOUNT_LOCK_MINUTES',
  'AUTH_RATE_LIMIT_MAX_REQUESTS',
  'AUTH_RATE_LIMIT_TTL_MS',
  'BANNER_MAX_UPLOAD_SIZE',
  'GALLERY_MAX_UPLOAD_COUNT',
  'GALLERY_MAX_UPLOAD_SIZE',
  'JNV_PRINCIPAL_MAX_UPLOAD_SIZE',
  'LEADERSHIP_MAX_UPLOAD_SIZE',
  'MAX_BANNERS_PER_ORGANIZATION',
  'MAX_BANNERS_PER_USER',
  'MAX_LOGIN_ATTEMPTS',
  'MAX_UPLOAD_SIZE',
  'ORGANIZATION_LEADERSHIP_MAX_UPLOAD_SIZE',
  'VISITOR_RATE_LIMIT_MAX_REQUESTS',
  'VISITOR_RATE_LIMIT_TTL_MS',
] as const;

function optionalString(
  environment: Environment,
  key: string,
): string | undefined {
  const value = environment[key];
  return typeof value === 'string' ? value.trim() : undefined;
}

export function validateEnvironment(environment: Environment): Environment {
  const errors: string[] = [];

  for (const key of REQUIRED_VARIABLES) {
    if (!optionalString(environment, key)) errors.push(`${key} is required`);
  }

  const port = optionalString(environment, 'PORT');
  if (port !== undefined) {
    const parsed = Number(port);
    if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 65_535)
      errors.push('PORT must be an integer between 1 and 65535');
  }

  const bcryptRounds = optionalString(environment, 'BCRYPT_ROUNDS');
  if (bcryptRounds !== undefined) {
    const parsed = Number(bcryptRounds);
    if (!Number.isSafeInteger(parsed) || parsed < 4 || parsed > 31)
      errors.push('BCRYPT_ROUNDS must be an integer between 4 and 31');
  }

  for (const key of POSITIVE_INTEGER_VARIABLES) {
    const value = optionalString(environment, key);
    if (value === undefined) continue;
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < 1)
      errors.push(`${key} must be a positive integer`);
  }

  const requestBodyLimit = optionalString(environment, 'REQUEST_BODY_LIMIT');
  if (
    requestBodyLimit !== undefined &&
    !/^\d+(?:b|kb|mb|gb)?$/i.test(requestBodyLimit)
  )
    errors.push('REQUEST_BODY_LIMIT must be a size such as 2mb');

  if (errors.length)
    throw new Error(`Invalid environment configuration: ${errors.join('; ')}`);

  return environment;
}
