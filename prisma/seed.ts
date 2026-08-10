import { PrismaClient, Role } from '@prisma/client';

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

const businessPermissionKeys = [
  'PAGE_VIEW',
  'PAGE_CREATE',
  'PAGE_UPDATE',
  'MEDIA_UPLOAD',
  'MEDIA_VIEW',
] as const;

const defaultRolePermissionKeys: Record<Role, readonly string[]> = {
  [Role.SUPER_ADMIN]: permissions.map(([permissionKey]) => permissionKey),
  [Role.HEADQUARTER]: businessPermissionKeys,
  [Role.NLI]: businessPermissionKeys,
  [Role.REGIONAL]: businessPermissionKeys,
  [Role.JNV]: businessPermissionKeys,
};

const mediaTypes = [
  'Notice',
  'Circular',
  'Tender',
  'Office Memorandum',
  'Office Order',
  'Notification',
  'Guideline',
  'Policy',
  'Manual',
  'Report',
  'Recruitment',
  'Training Material',
  'Form',
  'Other',
] as const;

async function main(): Promise<void> {
  await Promise.all(
    mediaTypes.map((name, displayOrder) =>
      prisma.mediaType.upsert({
        where: { name },
        update: {},
        create: { name, displayOrder },
      }),
    ),
  );

  await Promise.all(
    permissions.map(([permissionKey, module, action, description]) =>
      prisma.permission.upsert({
        where: { permissionKey },
        update: {},
        create: { permissionKey, module, action, description },
      }),
    ),
  );

  const seededPermissions = await prisma.permission.findMany({
    select: { id: true, permissionKey: true },
  });
  const permissionsByKey = new Map(
    seededPermissions.map((permission) => [
      permission.permissionKey,
      permission.id,
    ]),
  );

  await prisma.$transaction(
    Object.entries(defaultRolePermissionKeys).flatMap(
      ([role, permissionKeys]) =>
        permissionKeys.map((permissionKey) =>
          prisma.rolePermission.upsert({
            where: {
              role_permissionId: {
                role: role as Role,
                permissionId: permissionsByKey.get(permissionKey)!,
              },
            },
            update: {},
            create: {
              role: role as Role,
              permissionId: permissionsByKey.get(permissionKey)!,
            },
          }),
        ),
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
