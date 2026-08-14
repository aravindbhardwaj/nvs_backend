import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

import {
  CONTENT_TYPES,
  DEFAULT_SEED_PASSWORD,
  MEDIA_TYPES,
  ORGANIZATIONS,
  ORGANIZATION_TYPES,
  PERMISSIONS,
  REGIONS,
  ROLE_PERMISSIONS,
  SAMPLE_PAGES,
  SAMPLE_PAGE_STATUS,
  SAMPLE_USERS,
  STATES,
} from './seed/constants';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await seedStates();
  await seedRegions();
  const organizationTypesByCode = await seedOrganizationTypes();
  const organizationsByCode = await seedOrganizations(organizationTypesByCode);
  const permissionsByKey = await seedPermissions();
  await seedRolePermissions(permissionsByKey);
  const usersByEmail = await seedUsers(
    organizationsByCode,
    organizationTypesByCode,
  );
  const contentTypesByName = await seedReferenceData();
  await seedSamplePages(organizationsByCode, contentTypesByName, usersByEmail);
}

async function seedOrganizationTypes(): Promise<Map<string, number>> {
  await Promise.all(
    ORGANIZATION_TYPES.map((organizationType) =>
      prisma.organizationType.upsert({
        where: { id: organizationType.id },
        update: {
          code: organizationType.code,
          name: organizationType.name,
          isActive: true,
        },
        create: organizationType,
      }),
    ),
  );
  const organizationTypes = await prisma.organizationType.findMany({
    select: { id: true, code: true },
  });
  return new Map(organizationTypes.map(({ id, code }) => [code, id]));
}

async function seedRegions(): Promise<void> {
  const states = await prisma.state.findMany({
    select: { id: true, stateCode: true },
  });
  const stateIdsByCode = new Map(
    states.map(({ id, stateCode }) => [stateCode, id]),
  );

  await Promise.all(
    REGIONS.map(([regionName, regionCode, stateCodes]) => {
      const stateIds = stateCodes.map((stateCode) => {
        const stateId = stateIdsByCode.get(stateCode);
        if (!stateId)
          throw new Error(`Seed state ${stateCode} was not resolved.`);
        return stateId;
      });

      return prisma.region.upsert({
        where: { regionCode },
        update: {
          regionName,
          stateIds: stateIds.join(','),
          isDeleted: false,
          deletedAt: null,
          deletedById: null,
        },
        create: { regionName, regionCode, stateIds: stateIds.join(',') },
      });
    }),
  );
}

async function seedStates(): Promise<void> {
  await Promise.all(
    STATES.map(([stateName, stateCode]) =>
      prisma.state.upsert({
        where: { stateCode },
        update: {
          stateName,
          isDeleted: false,
          deletedAt: null,
          deletedById: null,
        },
        create: { stateName, stateCode },
      }),
    ),
  );
}

async function seedOrganizations(
  organizationTypesByCode: Map<string, number>,
): Promise<Map<string, number>> {
  const regions = await prisma.region.findMany({
    select: { id: true, regionCode: true },
  });
  const states = await prisma.state.findMany({
    select: { id: true, stateCode: true },
  });
  const regionIds = new Map(
    regions.map(({ id, regionCode }) => [regionCode, id]),
  );
  const stateIds = new Map(states.map(({ id, stateCode }) => [stateCode, id]));
  const organizationIds = new Map<string, number>();

  for (const organization of ORGANIZATIONS) {
    const parentOrganizationId = organization.parentCode
      ? organizationIds.get(organization.parentCode)
      : null;
    if (organization.parentCode && !parentOrganizationId) {
      throw new Error(
        `Seed parent organization ${organization.parentCode} was not resolved.`,
      );
    }
    const organizationTypeId = organizationTypesByCode.get(
      organization.typeCode,
    );
    if (!organizationTypeId)
      throw new Error(
        `Seed organization type ${organization.typeCode} was not resolved.`,
      );

    const record = await prisma.organization.upsert({
      where: { organizationCode: organization.code },
      update: {
        organizationName: organization.name,
        organizationTypeId,
        parentOrganizationId,
        regionId: organization.regionCode
          ? (regionIds.get(organization.regionCode) ?? null)
          : null,
        stateId: organization.stateCode
          ? (stateIds.get(organization.stateCode) ?? null)
          : null,
        isDeleted: false,
        deletedAt: null,
        deletedById: null,
      },
      create: {
        organizationName: organization.name,
        organizationCode: organization.code,
        organizationTypeId,
        parentOrganizationId,
        regionId: organization.regionCode
          ? (regionIds.get(organization.regionCode) ?? null)
          : null,
        stateId: organization.stateCode
          ? (stateIds.get(organization.stateCode) ?? null)
          : null,
      },
    });
    organizationIds.set(organization.code, record.id);
  }

  return organizationIds;
}

async function seedPermissions(): Promise<Map<string, number>> {
  await Promise.all(
    PERMISSIONS.map(([permissionKey, module, action, description]) =>
      prisma.permission.upsert({
        where: { permissionKey },
        update: {},
        create: { permissionKey, module, action, description },
      }),
    ),
  );
  const permissions = await prisma.permission.findMany({
    where: {
      permissionKey: {
        in: PERMISSIONS.map(([permissionKey]) => permissionKey),
      },
    },
    select: { id: true, permissionKey: true },
  });
  return new Map(
    permissions.map(({ id, permissionKey }) => [permissionKey, id]),
  );
}

async function seedRolePermissions(
  permissionsByKey: Map<string, number>,
): Promise<void> {
  await prisma.$transaction(
    Object.entries(ROLE_PERMISSIONS).flatMap(([role, permissionKeys]) =>
      permissionKeys.map((permissionKey) => {
        const permissionId = permissionsByKey.get(permissionKey);
        if (!permissionId)
          throw new Error(`Seed permission ${permissionKey} was not resolved.`);
        return prisma.rolePermission.upsert({
          where: { role_permissionId: { role: role as Role, permissionId } },
          update: {},
          create: { role: role as Role, permissionId },
        });
      }),
    ),
  );
}

async function seedUsers(
  organizationsByCode: Map<string, number>,
  organizationTypesByCode: Map<string, number>,
): Promise<Map<string, number>> {
  const passwordHash = await bcrypt.hash(
    process.env.SEED_USER_PASSWORD ?? DEFAULT_SEED_PASSWORD,
    12,
  );
  const usersByEmail = new Map<string, number>();

  for (const user of SAMPLE_USERS) {
    const organizationId = organizationsByCode.get(user.organizationCode);
    if (!organizationId)
      throw new Error(
        `Seed organization ${user.organizationCode} was not resolved.`,
      );
    const organizationTypeCode =
      user.role === Role.REGIONAL ? 'REGIONAL_OFFICE' : user.role;
    const organizationTypeId =
      organizationTypesByCode.get(organizationTypeCode);
    if (!organizationTypeId)
      throw new Error(
        `Seed organization type ${organizationTypeCode} was not resolved.`,
      );
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        organizationId,
        organizationTypeId,
        status: 'ACTIVE',
        isDeleted: false,
        deletedAt: null,
        deletedById: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        organizationId,
        organizationTypeId,
      },
    });
    usersByEmail.set(user.email, record.id);
  }

  return usersByEmail;
}

async function seedReferenceData(): Promise<Map<string, number>> {
  const contentTypes = await Promise.all(
    CONTENT_TYPES.map((nameEnglish, displayOrder) =>
      prisma.contentType.upsert({
        where: { nameEnglish },
        update: {
          displayOrder,
          isDeleted: false,
          deletedAt: null,
          deletedById: null,
        },
        create: { nameEnglish, nameHindi: null, displayOrder },
      }),
    ),
  );
  await Promise.all(
    MEDIA_TYPES.map((nameEnglish, displayOrder) =>
      prisma.mediaType.upsert({
        where: { nameEnglish },
        update: {
          displayOrder,
          isDeleted: false,
          deletedAt: null,
          deletedById: null,
        },
        create: { nameEnglish, nameHindi: null, displayOrder },
      }),
    ),
  );
  return new Map(contentTypes.map(({ id, nameEnglish }) => [nameEnglish, id]));
}

async function seedSamplePages(
  organizationsByCode: Map<string, number>,
  contentTypesByName: Map<string, number>,
  usersByEmail: Map<string, number>,
): Promise<void> {
  const superAdminId = usersByEmail.get('super.admin@nvs.gov.in');
  if (!superAdminId)
    throw new Error('Seed super administrator was not resolved.');

  for (const page of SAMPLE_PAGES) {
    const organizationId = organizationsByCode.get(page.organizationCode);
    const contentTypeId = contentTypesByName.get(page.contentType);
    if (!organizationId || !contentTypeId)
      throw new Error(`Seed page ${page.slug} dependencies were not resolved.`);
    await prisma.page.upsert({
      where: {
        organizationId_contentTypeId: { organizationId, contentTypeId },
      },
      update: {
        titleEnglish: page.title,
        titleHindi: null,
        slug: page.slug,
        contentEnglish: page.content,
        contentHindi: null,
        status: SAMPLE_PAGE_STATUS,
        publishedAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedById: superAdminId,
        isDeleted: false,
        deletedAt: null,
        deletedById: null,
      },
      create: {
        organizationId,
        contentTypeId,
        titleEnglish: page.title,
        titleHindi: null,
        slug: page.slug,
        contentEnglish: page.content,
        contentHindi: null,
        status: SAMPLE_PAGE_STATUS,
        publishedAt: new Date('2026-01-01T00:00:00.000Z'),
        createdById: superAdminId,
        updatedById: superAdminId,
      },
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
