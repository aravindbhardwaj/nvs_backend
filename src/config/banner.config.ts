import { registerAs } from '@nestjs/config';

const DEFAULT_MAX_BANNERS_PER_USER = 5;

const positiveIntegerOrDefault = (value: string | undefined): number => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MAX_BANNERS_PER_USER;
};

export default registerAs('banner', () => ({
  maxBannersPerUser: positiveIntegerOrDefault(process.env.MAX_BANNERS_PER_USER),
}));
