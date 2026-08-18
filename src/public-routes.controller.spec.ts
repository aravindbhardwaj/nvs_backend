import { IS_PUBLIC_KEY } from './auth/decorators/public.decorator';
import { PublicBannersController } from './banners/public-banners.controller';
import { PublicGalleryController } from './gallery/public-gallery.controller';
import { PublicMediaController } from './media/public-media.controller';
import { PublicMenusController } from './menus/public-menus.controller';
import { PublicPagesController } from './pages/public-pages.controller';

describe('Public website controllers', () => {
  it.each([
    PublicPagesController,
    PublicMediaController,
    PublicBannersController,
    PublicGalleryController,
    PublicMenusController,
  ])('explicitly marks %p public', (controller) => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, controller)).toBe(true);
  });
});
