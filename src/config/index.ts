import appConfig from './app.config';
import authConfig from './auth.config';
import bannerConfig from './banner.config';
import jwtConfig from './jwt.config';
import rateLimitConfig from './rate-limit.config';
import uploadConfig from './upload.config';

const configuration = [
  appConfig,
  authConfig,
  bannerConfig,
  jwtConfig,
  rateLimitConfig,
  uploadConfig,
];

export default configuration;
