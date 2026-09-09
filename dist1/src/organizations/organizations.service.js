"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const pagination_util_1 = require("../common/utils/pagination.util");
const prisma_service_1 = require("../prisma/prisma.service");
const organizationInclude = {
    organizationType: { select: { id: true, code: true, name: true } },
    parentOrganization: {
        select: {
            id: true,
            organizationName: true,
            organizationType: { select: { code: true } },
        },
    },
    region: { select: { id: true, regionName: true } },
    state: { select: { id: true, stateName: true } },
    district: { select: { id: true, districtName: true } },
};
const organizationTypeCodes = {
    headquarters: 'HEADQUARTER',
    nli: 'NLI',
    regionalOffice: 'REGIONAL_OFFICE',
    jnv: 'JNV',
};
const JNV_ORGANIZATION_TYPE_ID = 4;
const publicJnvSelect = {
    id: true,
    organizationName: true,
    organizationHindiName: true,
    organizationCode: true,
    schoolUrl: true,
    address: true,
    addressHindi: true,
    estdYear: true,
    studentsCount: true,
    region: {
        select: {
            dcRoName: true,
            dcRoNameHi: true,
            regionName: true,
            regionNameHi: true,
        },
    },
    state: { select: { stateName: true, nameHi: true, isoCode: true } },
    district: { select: { districtName: true, nameHi: true } },
    jnvPrincipals: {
        where: { isActive: true, isDeleted: false, relievedAt: null },
        select: {
            principalNameEnglish: true,
            principalNameHindi: true,
            email: true,
            mobile: true,
        },
        orderBy: [{ joinedAt: 'desc' }, { id: 'desc' }],
        take: 1,
    },
};
let OrganizationsService = class OrganizationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, actor) {
        await this.ensureValuesAreUnique(dto.organizationName, dto.organizationCode);
        const normalized = await this.validateHierarchy(dto);
        const organization = await this.prisma.$transaction(async (transaction) => {
            const createdOrganization = await transaction.organization.create({
                data: { ...normalized, createdById: actor.id, updatedById: actor.id },
                include: organizationInclude,
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'ORGANIZATION',
                    entity: 'ORGANIZATION',
                    entityId: createdOrganization.id,
                    action: 'CREATE',
                    newValues: this.toAuditValues(createdOrganization),
                },
            });
            return createdOrganization;
        });
        return this.toResponse(organization);
    }
    async findAll(query) {
        const { page, limit, sort, order } = query;
        const where = this.buildWhere(query);
        const orderBy = {
            [sort]: order,
        };
        const [organizations, totalItems] = await this.prisma.$transaction([
            this.prisma.organization.findMany({
                where,
                include: organizationInclude,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.organization.count({ where }),
        ]);
        return {
            items: organizations.map((organization) => this.toResponse(organization)),
            meta: pagination_util_1.PaginationUtil.buildMeta(page, limit, totalItems),
        };
    }
    async findMaster(query) {
        const { page, limit, sort, order } = query;
        const where = this.buildWhere(query);
        const [organizations, totalItems] = await this.prisma.$transaction([
            this.prisma.organization.findMany({
                where,
                select: {
                    id: true,
                    organizationName: true,
                    organizationTypeId: true,
                },
                orderBy: { [sort]: order },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.organization.count({ where }),
        ]);
        return {
            items: organizations.map((organization) => ({
                id: organization.id,
                name: organization.organizationName,
                organizationTypeId: organization.organizationTypeId,
            })),
            meta: pagination_util_1.PaginationUtil.buildMeta(page, limit, totalItems),
        };
    }
    async findOne(id) {
        const organization = await this.prisma.organization.findFirst({
            where: { id, isDeleted: false },
            include: organizationInclude,
        });
        if (!organization)
            throw new common_1.NotFoundException('Organization not found.');
        return this.toResponse(organization);
    }
    async findPublicJnvs(query) {
        const stateCode = query.state_code?.trim().toUpperCase();
        const where = {
            organizationTypeId: JNV_ORGANIZATION_TYPE_ID,
            isDeleted: false,
            isFunctional: true,
            ...(query.district_id ? { districtId: query.district_id } : {}),
            ...(query.regional_office_id
                ? { parentOrganizationId: query.regional_office_id }
                : {}),
            ...(stateCode
                ? {
                    state: {
                        isoCode: {
                            equals: `IN-${stateCode}`,
                            mode: 'insensitive',
                        },
                    },
                }
                : {}),
        };
        const [organizations, totalItems] = await this.prisma.$transaction([
            this.prisma.organization.findMany({
                where,
                select: publicJnvSelect,
                orderBy: [{ organizationName: 'asc' }, { id: 'asc' }],
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            this.prisma.organization.count({ where }),
        ]);
        return {
            items: organizations.map((organization) => this.toPublicJnvResponse(organization)),
            meta: pagination_util_1.PaginationUtil.buildMeta(query.page, query.limit, totalItems),
        };
    }
    async findPublicJnvStateMap() {
        const organizations = await this.prisma.organization.findMany({
            where: {
                organizationTypeId: JNV_ORGANIZATION_TYPE_ID,
                isDeleted: false,
                isFunctional: true,
                state: { isActive: true, isDeleted: false },
                region: { isDeleted: false },
            },
            select: {
                state: { select: { isoCode: true } },
                region: { select: { regionName: true } },
            },
            orderBy: [{ state: { isoCode: 'asc' } }, { id: 'asc' }],
        });
        return organizations.reduce((stateMap, organization) => {
            if (!organization.state || !organization.region)
                return stateMap;
            const stateCode = organization.state.isoCode
                .replace(/^IN-/i, '')
                .toUpperCase();
            const stateKey = stateCode.toLowerCase();
            const regionName = organization.region.regionName.replace(/\s+Region$/i, '');
            const current = stateMap[stateKey];
            stateMap[stateKey] = current
                ? [current[0], current[1] + 1, current[2]]
                : [regionName, 1, stateCode];
            return stateMap;
        }, {});
    }
    async update(id, dto, actor) {
        const existingOrganization = await this.findActiveOrganization(id);
        const mergedDto = this.mergeWithExistingOrganization(dto, existingOrganization);
        await this.ensureValuesAreUnique(mergedDto.organizationName, mergedDto.organizationCode, id);
        const normalized = await this.validateHierarchy(mergedDto, id);
        await this.ensureTypeChangeDoesNotInvalidateChildren(existingOrganization, mergedDto.organizationTypeId);
        const organization = await this.prisma.$transaction(async (transaction) => {
            const updatedOrganization = await transaction.organization.update({
                where: { id },
                data: { ...normalized, updatedById: actor.id },
                include: organizationInclude,
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'ORGANIZATION',
                    entity: 'ORGANIZATION',
                    entityId: id,
                    action: 'UPDATE',
                    previousValues: this.toAuditValues(existingOrganization),
                    newValues: this.toAuditValues(updatedOrganization),
                },
            });
            return updatedOrganization;
        });
        return this.toResponse(organization);
    }
    async remove(id, actor) {
        const organization = await this.prisma.$transaction(async (transaction) => {
            const existingOrganization = await transaction.organization.findFirst({
                where: { id, isDeleted: false },
                include: organizationInclude,
            });
            if (!existingOrganization)
                throw new common_1.NotFoundException('Organization not found or has already been deleted.');
            const [users, children, pages, media] = await Promise.all([
                transaction.user.count({ where: { organizationId: id } }),
                transaction.organization.count({ where: { parentOrganizationId: id } }),
                transaction.page.count({ where: { organizationId: id } }),
                transaction.media.count({ where: { organizationId: id } }),
            ]);
            if (users || children || pages || media) {
                const dependencies = [
                    users && 'users',
                    children && 'child organizations',
                    pages && 'pages',
                    media && 'media',
                ]
                    .filter(Boolean)
                    .join(', ');
                throw new common_1.ConflictException(`Organization cannot be deleted because it contains ${dependencies}.`);
            }
            const deletedOrganization = await transaction.organization.update({
                where: { id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    deletedById: actor.id,
                    updatedById: actor.id,
                },
                include: organizationInclude,
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'ORGANIZATION',
                    entity: 'ORGANIZATION',
                    entityId: id,
                    action: 'DELETE',
                    previousValues: this.toAuditValues(existingOrganization),
                    newValues: this.toAuditValues(deletedOrganization),
                },
            });
            return deletedOrganization;
        });
        return this.toResponse(organization);
    }
    async restore(id, actor) {
        const organization = await this.prisma.$transaction(async (transaction) => {
            const existingOrganization = await transaction.organization.findFirst({
                where: { id, isDeleted: true },
                include: organizationInclude,
            });
            if (!existingOrganization)
                throw new common_1.NotFoundException('Deleted organization not found.');
            await this.validateRestoration(existingOrganization);
            const restoredOrganization = await transaction.organization.update({
                where: { id },
                data: {
                    isDeleted: false,
                    deletedAt: null,
                    deletedById: null,
                    updatedById: actor.id,
                },
                include: organizationInclude,
            });
            await transaction.auditLog.create({
                data: {
                    userId: actor.id,
                    module: 'ORGANIZATION',
                    entity: 'ORGANIZATION',
                    entityId: id,
                    action: 'RESTORE',
                    previousValues: this.toAuditValues(existingOrganization),
                    newValues: this.toAuditValues(restoredOrganization),
                },
            });
            return restoredOrganization;
        });
        return this.toResponse(organization);
    }
    async validateHierarchy(dto, organizationId) {
        const { organizationTypeId, parentOrganizationId, regionId, stateId } = dto;
        const organizationType = await this.ensureActiveOrganizationType(organizationTypeId);
        if (parentOrganizationId === organizationId)
            throw new common_1.BadRequestException('An organization cannot be its own parent.');
        if (organizationType.code === organizationTypeCodes.headquarters ||
            organizationType.code === organizationTypeCodes.nli) {
            if (parentOrganizationId || regionId || stateId)
                throw new common_1.BadRequestException(`${organizationType.code} organizations cannot have a parent, region, or state.`);
            if (organizationType.code === organizationTypeCodes.headquarters) {
                const headquarters = await this.prisma.organization.findFirst({
                    where: {
                        organizationTypeId,
                        isDeleted: false,
                        ...(organizationId ? { id: { not: organizationId } } : {}),
                    },
                    select: { id: true },
                });
                if (headquarters)
                    throw new common_1.ConflictException('Only one Headquarters organization may exist.');
            }
            return this.withSupplementalFields({
                organizationName: dto.organizationName,
                organizationHindiName: dto.organizationHindiName ?? null,
                organizationCode: dto.organizationCode,
                organizationTypeId,
                address: dto.address ?? null,
                addressHindi: dto.addressHindi ?? null,
                isFunctional: dto.isFunctional ?? true,
                parentOrganizationId: null,
                regionId: null,
                stateId: null,
            }, dto, null, organizationType.code);
        }
        if (!parentOrganizationId)
            throw new common_1.BadRequestException(`${organizationType.code} organizations must reference a parent organization.`);
        const parent = await this.prisma.organization.findFirst({
            where: { id: parentOrganizationId, isDeleted: false },
            include: { organizationType: { select: { code: true } } },
        });
        if (!parent)
            throw new common_1.NotFoundException('Parent organization not found or has been deleted.');
        if (organizationType.code === organizationTypeCodes.regionalOffice) {
            if (parent.organizationType.code !== organizationTypeCodes.headquarters)
                throw new common_1.BadRequestException('A Regional Office parent must be Headquarters.');
            if (!regionId)
                throw new common_1.BadRequestException('A Regional Office must reference a region.');
            if (stateId)
                throw new common_1.BadRequestException('A Regional Office must not reference a state.');
            await this.ensureActiveRegion(regionId);
            return this.withSupplementalFields({
                organizationName: dto.organizationName,
                organizationHindiName: dto.organizationHindiName ?? null,
                organizationCode: dto.organizationCode,
                organizationTypeId,
                address: dto.address ?? null,
                addressHindi: dto.addressHindi ?? null,
                isFunctional: dto.isFunctional ?? true,
                parentOrganizationId,
                regionId,
                stateId: null,
            }, dto, null, organizationType.code);
        }
        if (parent.organizationType.code !== organizationTypeCodes.regionalOffice)
            throw new common_1.BadRequestException('A JNV parent must be a Regional Office.');
        if (!stateId)
            throw new common_1.BadRequestException('A JNV must reference a state.');
        if (regionId && regionId !== parent.regionId)
            throw new common_1.BadRequestException('A JNV region must match its Regional Office region.');
        if (!parent.regionId)
            throw new common_1.BadRequestException('The parent Regional Office must reference a region.');
        await this.ensureActiveState(stateId);
        return this.withSupplementalFields({
            organizationName: dto.organizationName,
            organizationHindiName: dto.organizationHindiName ?? null,
            organizationCode: dto.organizationCode,
            organizationTypeId,
            address: dto.address ?? null,
            addressHindi: dto.addressHindi ?? null,
            isFunctional: dto.isFunctional ?? true,
            parentOrganizationId,
            regionId: parent.regionId,
            stateId,
        }, dto, stateId, organizationType.code);
    }
    async withSupplementalFields(data, dto, stateId, organizationTypeCode) {
        const districtId = dto.districtId ?? null;
        const studentsCount = dto.studentsCount ?? null;
        if (districtId !== null)
            await this.ensureActiveDistrict(districtId, stateId);
        if (studentsCount !== null &&
            organizationTypeCode !== organizationTypeCodes.jnv)
            throw new common_1.BadRequestException('studentsCount is only applicable to JNV organizations.');
        return {
            ...data,
            districtId,
            estdYear: dto.estdYear ?? null,
            studentsCount,
        };
    }
    mergeWithExistingOrganization(dto, existing) {
        return {
            organizationName: dto.organizationName ?? existing.organizationName,
            organizationHindiName: dto.organizationHindiName === undefined
                ? (existing.organizationHindiName ?? undefined)
                : (dto.organizationHindiName ?? undefined),
            organizationCode: dto.organizationCode ?? existing.organizationCode,
            organizationTypeId: dto.organizationTypeId ?? existing.organizationTypeId,
            parentOrganizationId: dto.parentOrganizationId === undefined
                ? (existing.parentOrganizationId ?? undefined)
                : (dto.parentOrganizationId ?? undefined),
            regionId: dto.regionId === undefined
                ? (existing.regionId ?? undefined)
                : (dto.regionId ?? undefined),
            stateId: dto.stateId === undefined
                ? (existing.stateId ?? undefined)
                : (dto.stateId ?? undefined),
            districtId: dto.districtId === undefined ? existing.districtId : dto.districtId,
            estdYear: dto.estdYear === undefined ? existing.estdYear : dto.estdYear,
            studentsCount: dto.studentsCount === undefined
                ? existing.studentsCount
                : dto.studentsCount,
            address: dto.address === undefined
                ? (existing.address ?? undefined)
                : (dto.address ?? undefined),
            addressHindi: dto.addressHindi === undefined
                ? (existing.addressHindi ?? undefined)
                : (dto.addressHindi ?? undefined),
            isFunctional: dto.isFunctional ?? existing.isFunctional,
        };
    }
    async validateRestoration(organization) {
        if (organization.organizationType.code === organizationTypeCodes.headquarters) {
            const headquarters = await this.prisma.organization.findFirst({
                where: {
                    organizationTypeId: organization.organizationTypeId,
                    isDeleted: false,
                    id: { not: organization.id },
                },
                select: { id: true },
            });
            if (headquarters)
                throw new common_1.ConflictException('Organization cannot be restored because a Headquarters organization already exists.');
            return;
        }
        if (organization.organizationType.code === organizationTypeCodes.nli)
            return;
        if (!organization.parentOrganizationId ||
            !organization.parentOrganization ||
            organization.parentOrganizationId !== organization.parentOrganization.id)
            throw new common_1.ConflictException('Organization cannot be restored because its parent organization is unavailable.');
        const parent = await this.prisma.organization.findFirst({
            where: { id: organization.parentOrganizationId, isDeleted: false },
            include: { organizationType: { select: { code: true } } },
        });
        if (!parent)
            throw new common_1.ConflictException('Organization cannot be restored because its parent organization has been deleted.');
        if (organization.organizationType.code ===
            organizationTypeCodes.regionalOffice) {
            if (parent.organizationType.code !== organizationTypeCodes.headquarters ||
                !organization.regionId)
                throw new common_1.ConflictException('Organization cannot be restored because its hierarchy is invalid.');
            await this.ensureActiveRegion(organization.regionId);
            return;
        }
        if (parent.organizationType.code !== organizationTypeCodes.regionalOffice ||
            !organization.stateId ||
            organization.regionId !== parent.regionId)
            throw new common_1.ConflictException('Organization cannot be restored because its hierarchy is invalid.');
        await this.ensureActiveState(organization.stateId);
    }
    async ensureTypeChangeDoesNotInvalidateChildren(existing, nextTypeId) {
        if (existing.organizationTypeId === nextTypeId)
            return;
        const children = await this.prisma.organization.count({
            where: { parentOrganizationId: existing.id, isDeleted: false },
        });
        if (children)
            throw new common_1.ConflictException('Organization type cannot be changed while active child organizations exist.');
    }
    async ensureActiveRegion(id) {
        const region = await this.prisma.region.findFirst({
            where: { id, isDeleted: false },
            select: { id: true },
        });
        if (!region)
            throw new common_1.NotFoundException('Region not found or has been deleted.');
    }
    async ensureActiveState(id) {
        const state = await this.prisma.state.findFirst({
            where: { id, isDeleted: false },
            select: { id: true },
        });
        if (!state)
            throw new common_1.NotFoundException('State not found or has been deleted.');
    }
    async ensureActiveDistrict(id, stateId) {
        const district = await this.prisma.district.findFirst({
            where: { id, isActive: true },
            select: { id: true, stateId: true },
        });
        if (!district)
            throw new common_1.NotFoundException('District not found or is inactive.');
        if (stateId !== null && district.stateId !== stateId)
            throw new common_1.BadRequestException('District must belong to the selected state.');
    }
    async ensureActiveOrganizationType(id) {
        const organizationType = await this.prisma.organizationType.findFirst({
            where: { id, isActive: true },
            select: { id: true, code: true },
        });
        if (!organizationType)
            throw new common_1.NotFoundException('Organization type not found or is inactive.');
        return organizationType;
    }
    async findActiveOrganization(id) {
        const organization = await this.prisma.organization.findFirst({
            where: { id, isDeleted: false },
            include: organizationInclude,
        });
        if (!organization)
            throw new common_1.NotFoundException('Organization not found or has been deleted.');
        return organization;
    }
    async ensureValuesAreUnique(name, code, excludedId) {
        const duplicate = await this.prisma.organization.findFirst({
            where: {
                ...(excludedId ? { id: { not: excludedId } } : {}),
                OR: [{ organizationName: name }, { organizationCode: code }],
            },
            select: { id: true },
        });
        if (duplicate)
            throw new common_1.ConflictException('An organization with the same name or code already exists.');
    }
    buildWhere(query) {
        const where = {
            isDeleted: query.isDeleted ?? false,
            ...(query.organizationTypeId
                ? { organizationTypeId: query.organizationTypeId }
                : {}),
            ...(query.regionId ? { regionId: query.regionId } : {}),
            ...(query.stateId ? { stateId: query.stateId } : {}),
            ...(query.districtId ? { districtId: query.districtId } : {}),
            ...(query.parentOrganizationId
                ? { parentOrganizationId: query.parentOrganizationId }
                : {}),
        };
        if (query.search?.trim())
            where.OR = [
                {
                    organizationName: {
                        contains: query.search.trim(),
                        mode: 'insensitive',
                    },
                },
                {
                    organizationCode: {
                        contains: query.search.trim(),
                        mode: 'insensitive',
                    },
                },
            ];
        return where;
    }
    toResponse(organization) {
        return {
            id: organization.id,
            organizationName: organization.organizationName,
            organizationHindiName: organization.organizationHindiName,
            organizationCode: organization.organizationCode,
            organizationTypeId: organization.organizationTypeId,
            organizationType: organization.organizationType,
            parentOrganizationId: organization.parentOrganizationId,
            regionId: organization.regionId,
            stateId: organization.stateId,
            districtId: organization.districtId,
            estdYear: organization.estdYear,
            studentsCount: organization.studentsCount,
            address: organization.address,
            addressHindi: organization.addressHindi,
            isFunctional: organization.isFunctional,
            parentOrganization: organization.parentOrganization
                ? {
                    id: organization.parentOrganization.id,
                    name: organization.parentOrganization.organizationName,
                }
                : null,
            region: organization.region
                ? { id: organization.region.id, name: organization.region.regionName }
                : null,
            state: organization.state
                ? { id: organization.state.id, name: organization.state.stateName }
                : null,
            district: organization.district
                ? {
                    id: organization.district.id,
                    name: organization.district.districtName,
                }
                : null,
            isDeleted: organization.isDeleted,
            createdAt: organization.createdAt,
            updatedAt: organization.updatedAt,
        };
    }
    toPublicJnvResponse(organization) {
        const stateCode = organization.state
            ? this.publicStateCode(organization.state.isoCode)
            : null;
        const principal = organization.jnvPrincipals[0];
        return {
            id: organization.id,
            name: organization.organizationName,
            stateCode,
            address: organization.address,
            address_hindi: organization.addressHindi,
            state: organization.state?.stateName ?? null,
            stateHi: organization.state?.nameHi ?? null,
            district: organization.district?.districtName ?? null,
            schoolUrl: organization.schoolUrl ??
                (stateCode
                    ? `/nvs-school/${stateCode.toLowerCase()}/${this.publicSchoolCode(organization.organizationCode)}`
                    : null),
            estd: organization.estdYear,
            students: organization.studentsCount,
            districtHi: organization.district?.nameHi ?? null,
            nameHi: organization.organizationHindiName,
            dc_ro_name: organization.region?.dcRoName ?? null,
            dc_ro_name_hi: organization.region?.dcRoNameHi ?? null,
            ro_name: organization.region?.regionName ?? null,
            ro_name_hi: organization.region?.regionNameHi ?? null,
            principal_name_english: principal?.principalNameEnglish ?? null,
            principal_name_hindi: principal?.principalNameHindi ?? null,
            principal_email: principal?.email ?? null,
            principal_mobile: principal?.mobile ?? null,
        };
    }
    publicStateCode(isoCode) {
        return isoCode.split('-').at(-1)?.toUpperCase() ?? isoCode.toUpperCase();
    }
    publicSchoolCode(organizationCode) {
        return organizationCode.replace(/^JNV-/i, '').trim().toLowerCase();
    }
    toAuditValues(organization) {
        return {
            id: organization.id,
            organizationName: organization.organizationName,
            organizationHindiName: organization.organizationHindiName,
            organizationCode: organization.organizationCode,
            organizationTypeId: organization.organizationTypeId,
            parentOrganizationId: organization.parentOrganizationId,
            regionId: organization.regionId,
            stateId: organization.stateId,
            districtId: organization.districtId,
            estdYear: organization.estdYear,
            studentsCount: organization.studentsCount,
            address: organization.address,
            addressHindi: organization.addressHindi,
            isFunctional: organization.isFunctional,
            createdAt: organization.createdAt.toISOString(),
            updatedAt: organization.updatedAt.toISOString(),
            createdById: organization.createdById,
            updatedById: organization.updatedById,
            isDeleted: organization.isDeleted,
            deletedAt: organization.deletedAt?.toISOString() ?? null,
            deletedById: organization.deletedById,
        };
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map