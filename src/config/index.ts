import appConfig from './app.config';
import authConfig from './auth.config';
import bannerConfig from './banner.config';
import jwtConfig from './jwt.config';
import rateLimitConfig from './rate-limit.config';
import mediaArchiveConfig from './media-archive.config';
import uploadConfig from './upload.config';

const configuration = [
  appConfig,
  authConfig,
  bannerConfig,
  jwtConfig,
  rateLimitConfig,
  mediaArchiveConfig,
  uploadConfig,
];

export default configuration;
