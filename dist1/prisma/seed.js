"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const districts_1 = require("./seed/districts");
const jnvs_1 = require("./seed/jnvs");
const states_1 = require("./seed/states");
const constants_1 = require("./seed/constants");
const prisma = new client_1.PrismaClient();
async function main() {
    await seedStates();
    await seedDistricts();
    await seedRegions();
    const organizationTypesByCode = await seedOrganizationTypes();
    const organizationsByCode = await seedOrganizations(organizationTypesByCode);
    await seedJnvs(organizationsByCode, organizationTypesByCode);
    const permissionsByKey = await seedPermissions();
    await seedRolePermissions(permissionsByKey);
    const usersByEmail = await seedUsers(organizationsByCode, organizationTypesByCode);
    const { contentTypesByCode, mediaTypesByCode } = await seedReferenceData();
    await seedSamplePages(organizationsByCode, contentTypesByCode, usersByEmail);
    await seedMenus(organizationTypesByCode, contentTypesByCode, mediaTypesByCode, usersByEmail);
}
async function seedDistricts() {
    const referencedStateIds = [
        ...new Set(districts_1.DISTRICTS.map(({ stateId }) => stateId)),
    ];
    const states = await prisma.state.findMany({
        where: { id: { in: referencedStateIds } },
        select: { id: true },
    });
    const resolvedStateIds = new Set(states.map(({ id }) => id));
    const missingStateIds = referencedStateIds.filter((stateId) => !resolvedStateIds.has(stateId));
    if (missingStateIds.length > 0) {
        throw new Error(`District seed references missing State IDs: ${missingStateIds.join(', ')}.`);
    }
    for (const district of districts_1.DISTRICTS) {
        await prisma.district.upsert({
            where: { id: district.id },
            update: district,
            create: district,
        });
    }
}
async function seedOrganizationTypes() {
    await Promise.all(constants_1.ORGANIZATION_TYPES.map((organizationType) => prisma.organizationType.upsert({
        where: { id: organizationType.id },
        update: {
            code: organizationType.code,
            name: organizationType.name,
            isActive: true,
        },
        create: organizationType,
    })));
    const organizationTypes = await prisma.organizationType.findMany({
        select: { id: true, code: true },
    });
    return new Map(organizationTypes.map(({ id, code }) => [code, id]));
}
async function seedRegions() {
    const states = await prisma.state.findMany({
        select: { id: true, stateCode: true },
    });
    const stateIdsByCode = new Map(states.map(({ id, stateCode }) => [stateCode, id]));
    await Promise.all(constants_1.REGIONS.map(([regionName, regionCode, stateCodes]) => {
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
    }));
}
async function seedStates() {
    await Promise.all(states_1.STATES.map((state) => prisma.state.upsert({
        where: { id: state.id },
        update: {
            stateName: state.stateName,
            stateCode: state.stateCode,
            isActive: state.isActive,
            roId: state.roId,
            isoCode: state.isoCode,
            isDeleted: false,
            deletedAt: null,
            deletedById: null,
        },
        create: state,
    })));
}
async function seedOrganizations(organizationTypesByCode) {
    const regions = await prisma.region.findMany({
        select: { id: true, regionCode: true },
    });
    const states = await prisma.state.findMany({
        select: { id: true, stateCode: true },
    });
    const regionIds = new Map(regions.map(({ id, regionCode }) => [regionCode, id]));
    const stateIds = new Map(states.map(({ id, stateCode }) => [stateCode, id]));
    const organizationIds = new Map();
    for (const organization of constants_1.ORGANIZATIONS) {
        const parentOrganizationId = organization.parentCode
            ? organizationIds.get(organization.parentCode)
            : null;
        if (organization.parentCode && !parentOrganizationId) {
            throw new Error(`Seed parent organization ${organization.parentCode} was not resolved.`);
        }
        const organizationTypeId = organizationTypesByCode.get(organization.typeCode);
        if (!organizationTypeId)
            throw new Error(`Seed organization type ${organization.typeCode} was not resolved.`);
        const organizationData = {
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
        };
        const existing = await prisma.organization.findFirst({
            where: { organizationCode: organization.code },
            orderBy: { id: 'asc' },
        });
        const record = existing
            ? await prisma.organization.update({
                where: { id: existing.id },
                data: organizationData,
            })
            : await prisma.organization.create({
                data: {
                    organizationCode: organization.code,
                    ...organizationData,
                },
            });
        organizationIds.set(organization.code, record.id);
    }
    return organizationIds;
}
async function seedJnvs(organizationsByCode, organizationTypesByCode) {
    const jnvOrganizationTypeId = organizationTypesByCode.get('JNV');
    if (!jnvOrganizationTypeId)
        throw new Error('Seed organization type JNV was not resolved.');
    const [regions, states, districts] = await Promise.all([
        prisma.region.findMany({ select: { id: true, regionCode: true } }),
        prisma.state.findMany({ select: { id: true, stateCode: true } }),
        prisma.district.findMany({ select: { id: true, stateId: true, isActive: true } }),
    ]);
    const regionIds = new Map(regions.map(({ id, regionCode }) => [regionCode, id]));
    const stateIds = new Map(states.map(({ id, stateCode }) => [stateCode, id]));
    const districtsById = new Map(districts.map((district) => [district.id, district]));
    for (const jnv of jnvs_1.JNVS) {
        const parentOrganizationId = organizationsByCode.get(jnv.parentOrganizationCode);
        const stateId = stateIds.get(jnv.stateCode);
        const regionId = jnv.regionCode
            ? regionIds.get(jnv.regionCode)
            : null;
        if (!parentOrganizationId)
            throw new Error(`Seed JNV ${jnv.organizationCode} parent ${jnv.parentOrganizationCode} was not resolved.`);
        if (!stateId)
            throw new Error(`Seed JNV ${jnv.organizationCode} state ${jnv.stateCode} was not resolved.`);
        if (jnv.regionCode && !regionId)
            throw new Error(`Seed JNV ${jnv.organizationCode} region ${jnv.regionCode} was not resolved.`);
        const district = districtsById.get(jnv.districtId);
        if (!district || !district.isActive || district.stateId !== stateId) {
            throw new Error(`Seed JNV ${jnv.organizationCode} district ${jnv.districtId} was not resolved for state ${jnv.stateCode}.`);
        }
        const record = await prisma.organization.upsert({
            where: { schoolUrl: jnv.schoolUrl },
            update: {
                organizationName: jnv.organizationName,
                organizationTypeId: jnvOrganizationTypeId,
                parentOrganizationId,
                regionId,
                stateId,
                districtId: jnv.districtId,
                organizationHindiName: jnv.organizationHindiName,
                estdYear: jnv.estdYear,
                studentsCount: jnv.studentsCount,
                schoolUrl: jnv.schoolUrl,
                address: jnv.address,
                isDeleted: false,
                deletedAt: null,
                deletedById: null,
            },
            create: {
                organizationName: jnv.organizationName,
                organizationCode: jnv.organizationCode,
                organizationTypeId: jnvOrganizationTypeId,
                parentOrganizationId,
                regionId,
                stateId,
                districtId: jnv.districtId,
                organizationHindiName: jnv.organizationHindiName,
                estdYear: jnv.estdYear,
                studentsCount: jnv.studentsCount,
                schoolUrl: jnv.schoolUrl,
                address: jnv.address,
            },
        });
        organizationsByCode.set(jnv.organizationCode, record.id);
    }
}
async function seedPermissions() {
    await Promise.all(constants_1.PERMISSIONS.map(([permissionKey, module, action, description]) => prisma.permission.upsert({
        where: { permissionKey },
        update: {},
        create: { permissionKey, module, action, description },
    })));
    const permissions = await prisma.permission.findMany({
        where: {
            permissionKey: {
                in: constants_1.PERMISSIONS.map(([permissionKey]) => permissionKey),
            },
        },
        select: { id: true, permissionKey: true },
    });
    return new Map(permissions.map(({ id, permissionKey }) => [permissionKey, id]));
}
async function seedRolePermissions(permissionsByKey) {
    await prisma.$transaction(Object.entries(constants_1.ROLE_PERMISSIONS).flatMap(([role, permissionKeys]) => permissionKeys.map((permissionKey) => {
        const permissionId = permissionsByKey.get(permissionKey);
        if (!permissionId)
            throw new Error(`Seed permission ${permissionKey} was not resolved.`);
        return prisma.rolePermission.upsert({
            where: { role_permissionId: { role: role, permissionId } },
            update: {},
            create: { role: role, permissionId },
        });
    })));
}
async function seedUsers(organizationsByCode, organizationTypesByCode) {
    const passwordHash = await bcrypt_1.default.hash(process.env.SEED_USER_PASSWORD ?? constants_1.DEFAULT_SEED_PASSWORD, 12);
    const usersByEmail = new Map();
    for (const user of constants_1.SAMPLE_USERS) {
        const organizationId = organizationsByCode.get(user.organizationCode);
        if (!organizationId)
            throw new Error(`Seed organization ${user.organizationCode} was not resolved.`);
        const organizationTypeCode = user.role === client_1.Role.REGIONAL ? 'REGIONAL_OFFICE' : user.role;
        const organizationTypeId = organizationTypesByCode.get(organizationTypeCode);
        if (!organizationTypeId)
            throw new Error(`Seed organization type ${organizationTypeCode} was not resolved.`);
        const record = await prisma.user.upsert({
            where: { email: user.email },
            update: {
                name: user.name,
                username: user.username,
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
                username: user.username,
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
async function seedReferenceData() {
    const contentTypes = await Promise.all(constants_1.CONTENT_TYPES.map(([code, nameEnglish], display_order) => prisma.contentType.upsert({
        where: { nameEnglish },
        update: {
            code,
            display_order,
            isDeleted: false,
            deletedAt: null,
            deletedById: null,
        },
        create: { code, nameEnglish, nameHindi: null, display_order },
    })));
    const mediaTypes = await Promise.all(constants_1.MEDIA_TYPES.map(([code, nameEnglish], display_order) => prisma.mediaType.upsert({
        where: { nameEnglish },
        update: {
            code,
            display_order,
            isDeleted: false,
            deletedAt: null,
            deletedById: null,
        },
        create: { code, nameEnglish, nameHindi: null, display_order },
    })));
    return {
        contentTypesByCode: new Map(contentTypes.map(({ id, code }) => [code, id])),
        mediaTypesByCode: new Map(mediaTypes.map(({ id, code }) => [code, id])),
    };
}
async function seedSamplePages(organizationsByCode, contentTypesByCode, usersByEmail) {
    const superAdminId = usersByEmail.get('super.admin@nvs.gov.in');
    if (!superAdminId)
        throw new Error('Seed super administrator was not resolved.');
    for (const page of constants_1.SAMPLE_PAGES) {
        const organizationId = organizationsByCode.get(page.organizationCode);
        const contentTypeId = contentTypesByCode.get(page.contentType);
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
                status: constants_1.SAMPLE_PAGE_STATUS,
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
                status: constants_1.SAMPLE_PAGE_STATUS,
                publishedAt: new Date('2026-01-01T00:00:00.000Z'),
                createdById: superAdminId,
                updatedById: superAdminId,
            },
        });
    }
}
async function seedMenus(organizationTypesByCode, contentTypesByCode, mediaTypesByCode, usersByEmail) {
    const superAdminId = usersByEmail.get('super.admin@nvs.gov.in');
    if (!superAdminId)
        throw new Error('Seed super administrator was not resolved.');
    for (const organizationTypeCode of constants_1.WEBSITE_ORGANIZATION_TYPE_CODES) {
        const organizationTypeId = organizationTypesByCode.get(organizationTypeCode);
        if (!organizationTypeId)
            throw new Error(`Seed organization type ${organizationTypeCode} was not resolved.`);
        const headerMenus = constants_1.HEADER_MENU_SEEDS[organizationTypeCode];
        for (const [index, menu] of headerMenus.entries()) {
            const mediaTypeId = menu.mediaTypeCode
                ? mediaTypesByCode.get(menu.mediaTypeCode)
                : null;
            if (menu.mediaTypeCode && !mediaTypeId)
                throw new Error(`Seed media type ${menu.mediaTypeCode} was not resolved.`);
            await upsertFirstLevelMenu({
                organizationTypeId,
                menuLocation: 1,
                titleEnglish: menu.titleEnglish,
                contentTypeId: null,
                mediaTypeId: mediaTypeId ?? null,
                display_order: index + 1,
                superAdminId,
            });
        }
        for (const [index, menu] of constants_1.FOOTER_MENU_SEEDS.entries()) {
            const contentTypeId = contentTypesByCode.get(menu.contentTypeCode);
            if (!contentTypeId)
                throw new Error(`Seed content type ${menu.contentTypeCode} was not resolved.`);
            await upsertFirstLevelMenu({
                organizationTypeId,
                menuLocation: 2,
                titleEnglish: menu.titleEnglish,
                contentTypeId,
                mediaTypeId: null,
                display_order: index + 1,
                superAdminId,
            });
        }
    }
}
async function upsertFirstLevelMenu({ organizationTypeId, menuLocation, titleEnglish, contentTypeId, mediaTypeId, display_order, superAdminId, }) {
    const data = {
        titleHindi: null,
        contentTypeId,
        mediaTypeId,
        externalUrl: null,
        linkTarget: 1,
        display_order,
        isActive: true,
        isDeleted: false,
        deletedAt: null,
        deletedById: null,
        updatedById: superAdminId,
    };
    const existing = await prisma.menu.findFirst({
        where: {
            organizationTypeId,
            menuLocation,
            parentMenuId: null,
            titleEnglish,
        },
        orderBy: { id: 'asc' },
    });
    if (existing) {
        await prisma.menu.update({ where: { id: existing.id }, data });
        return;
    }
    await prisma.menu.create({
        data: {
            organizationTypeId,
            menuLocation,
            parentMenuId: null,
            titleEnglish,
            ...data,
            createdById: superAdminId,
        },
    });
}
main()
    .catch((error) => {
    console.error(error);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map