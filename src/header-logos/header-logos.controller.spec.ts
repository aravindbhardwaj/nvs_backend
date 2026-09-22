import { Role } from '@prisma/client';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { HeaderLogosController } from './header-logos.controller';

describe('HeaderLogosController access', () => {
  it('allows Super Admin and Headquarters to manage header logos', () => {
    expect(Reflect.getMetadata(ROLES_KEY, HeaderLogosController)).toEqual([
      Role.SUPER_ADMIN,
      Role.HEADQUARTER,
    ]);
  });
});
