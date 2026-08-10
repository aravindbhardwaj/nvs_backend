import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
  ['USER_CREATE', 'USER', 'CREATE', 'Create users.'],
  ['USER_VIEW', 'USER', 'VIEW', 'View users.'],
  ['USER_UPDATE', 'USER', 'UPDATE', 'Update users.'],
  ['USER_DELETE', 'USER', 'DELETE', 'Delete users.'],
  ['USER_RESTORE', 'USER', 'RESTORE', 'Restore users.'],
  ['ORGANIZATION_CREATE', 'ORGANIZATION', 'CREATE', 'Create organizations.'],
  ['ORGANIZATION_VIEW', 'ORGANIZATION', 'VIEW', 'View organizations.'],
  ['ORGANIZATION_UPDATE', 'ORGANIZATION', 'UPDATE', 'Update organizations.'],
  ['ORGANIZATION_DELETE', 'ORGANIZATION', 'DELETE', 'Delete organizations.'],
  ['PAGE_CREATE', 'PAGE', 'CREATE', 'Create pages.'],
  ['PAGE_VIEW', 'PAGE', 'VIEW', 'View pages.'],
  ['PAGE_UPDATE', 'PAGE', 'UPDATE', 'Update pages.'],
  ['PAGE_DELETE', 'PAGE', 'DELETE', 'Delete pages.'],
  ['MEDIA_UPLOAD', 'MEDIA', 'UPLOAD', 'Upload media.'],
  ['MEDIA_VIEW', 'MEDIA', 'VIEW', 'View media.'],
  ['MEDIA_DELETE', 'MEDIA', 'DELETE', 'Delete media.'],
  ['AUDIT_LOG_VIEW', 'AUDIT_LOG', 'VIEW', 'View audit logs.'],
] as const;

async function main(): Promise<void> {
  await Promise.all(
    permissions.map(([permissionKey, module, action, description]) =>
      prisma.permission.upsert({
        where: { permissionKey },
        update: {},
        create: { permissionKey, module, action, description },
      }),
    ),
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
