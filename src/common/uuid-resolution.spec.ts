import { join } from 'node:path';

const models = {
  banners: 'banner',
  gallery: 'galleryImage',
  leadership: 'leader',
  media: 'media',
  pages: 'page',
  menus: 'menu',
  modals: 'modal',
  regions: 'region',
  'content-types': 'contentType',
  organizations: 'organization',
  users: 'user',
  permissions: 'permission',
  'audit-logs': 'auditLog',
  'user-permissions': 'user',
  'jnv-principals': 'jnvPrincipal',
};
const uuid = '550e8400-e29b-41d4-a716-446655440000';
describe('UUID model resolution', () => {
  it.each(Object.entries(models))(
    '%s resolves the correct table and allows existing state checks',
    async (module, model) => {
      const exports = require(
        join(__dirname, '..', module, `${module}.service.ts`),
      );
      const Service = Object.values(exports).find(
        (value) => typeof value === 'function',
      ) as new (prisma: unknown) => {
        resolveUuid(uuid: string): Promise<number>;
      };
      const findUnique = jest.fn().mockResolvedValue({ id: 17 });
      const service = new Service({ [model]: { findUnique } });
      await expect(service.resolveUuid(uuid)).resolves.toBe(17);
      expect(findUnique).toHaveBeenCalledWith({
        where: { uuid },
        select: { id: true },
      });
      findUnique.mockResolvedValue(null);
      await expect(service.resolveUuid(uuid)).rejects.toMatchObject({
        status: 404,
      });
    },
  );
});
