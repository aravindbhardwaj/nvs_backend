import { registerAs } from '@nestjs/config';

const DEFAULT_MAX_BANNERS_PER_ORGANIZATION = 5;

const positiveIntegerOrDefault = (value: string | undefined): number => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MAX_BANNERS_PER_ORGANIZATION;
};

export default registerAs('banner', () => ({
  maxBannersPerOrganization: positiveIntegerOrDefault(
    process.env.MAX_BANNERS_PER_ORGANIZATION ??
      process.env.MAX_BANNERS_PER_USER,
  ),
}));
