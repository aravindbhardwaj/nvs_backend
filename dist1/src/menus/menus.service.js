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
exports.MenusService = void 0;
const common_1 = require("@nestjs/common");
const pagination_util_1 = require("../common/utils/pagination.util");
const prisma_service_1 = require("../prisma/prisma.service");
const menu_constants_1 = require("./menu.constants");
let MenusService = class MenusService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, actor) {
        await this.validateConfiguration(dto);
        const menu = await this.prisma.$transaction(async (transaction) => {
            await this.validateReferences(transaction, dto);
            const created = await transaction.menu.create({
                data: {
                    organizationTypeId: dto.organization_type_id,
                    menuLocation: dto.menu_location,
                    parentMenuId: dto.parent_menu_id ?? null,
                    titleEnglish: dto.title_english,
                    titleHindi: dto.title_hindi ?? null,
                    contentTypeId: dto.content_type_id ?? null,
                    mediaTypeId: dto.media_type_id ?? null,
                    externalUrl: dto.external_url ?? null,
                    linkTarget: dto.link_target ?? menu_constants_1.LINK_TARGET.SAME_PAGE,
                    display_order: dto.display_order ?? 0,
                    isActive: dto.is_active ?? true,
                    showOnAllOrganizations: dto.show_on_all_organizations ?? false,
                    createdById: actor.id,
                    updatedById: actor.id,
                },
            });
            await this.audit(transaction, actor.id, 'CREATE', created);
            return created;
        });
        return this.toResponse(menu);
    }
    async findAll(query) {
        const where = this.buildWhere(query);
        const [items, totalItems] = await this.prisma.$transaction([
            this.prisma.menu.findMany({
                where,
                orderBy: [
                    { display_order: 'asc' },
                    { createdAt: 'desc' },
                    { id: 'desc' },
                ],
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            this.prisma.menu.count({ where }),
        ]);
        return {
            items: items.map((menu) => this.toResponse(menu)),
            meta: pagination_util_1.PaginationUtil.buildMeta(query.page, query.limit, totalItems),
        };
    }
    async findOne(id) {
        return this.toResponse(await this.findMenu(id));
    }
    async update(id, dto, actor) {
        const existing = await this.findMenu(id);
        const candidate = {
            organization_type_id: dto.organization_type_id ?? existing.organizationTypeId,
            menu_location: dto.menu_location ?? existing.menuLocation,
            parent_menu_id: dto.parent_menu_id === undefined
                ? existing.parentMenuId
                : dto.parent_menu_id,
            content_type_id: dto.content_type_id === undefined
                ? existing.contentTypeId
                : dto.content_type_id,
            media_type_id: dto.media_type_id === undefined
                ? existing.mediaTypeId
                : dto.media_type_id,
            external_url: dto.external_url === undefined
                ? existing.externalUrl
                : dto.external_url,
        };
        await this.validateConfiguration(candidate);
        const menu = await this.prisma.$transaction(async (transaction) => {
            await this.validateReferences(transaction, candidate, id);
            const updated = await transaction.menu.update({
                where: { id },
                data: {
                    ...(dto.organization_type_id === undefined
                        ? {}
                        : { organizationTypeId: dto.organization_type_id }),
                    ...(dto.menu_location === undefined
                        ? {}
                        : { menuLocation: dto.menu_location }),
                    ...(dto.parent_menu_id === undefined
                        ? {}
                        : { parentMenuId: dto.parent_menu_id }),
                    ...(dto.title_english === undefined
                        ? {}
                        : { titleEnglish: dto.title_english }),
                    ...(dto.title_hindi === undefined
                        ? {}
                        : { titleHindi: dto.title_hindi }),
                    ...(dto.content_type_id === undefined
                        ? {}
                        : { contentTypeId: dto.content_type_id }),
                    ...(dto.media_type_id === undefined
                        ? {}
                        : { mediaTypeId: dto.media_type_id }),
                    ...(dto.external_url === undefined
                        ? {}
                        : { externalUrl: dto.external_url }),
                    ...(dto.link_target === undefined
                        ? {}
                        : { linkTarget: dto.link_target }),
                    ...(dto.display_order === undefined
                        ? {}
                        : { display_order: dto.display_order }),
                    ...(dto.is_active === undefined ? {} : { isActive: dto.is_active }),
                    ...(dto.show_on_all_organizations === undefined
                        ? {}
                        : { showOnAllOrganizations: dto.show_on_all_organizations }),
                    updatedById: actor.id,
                },
            });
            await this.audit(transaction, actor.id, 'UPDATE', updated, existing);
            return updated;
        });
        return this.toResponse(menu);
    }
    async setActive(id, isActive, actor) {
        const existing = await this.findMenu(id);
        const menu = await this.prisma.$transaction(async (transaction) => {
            const updated = await transaction.menu.update({
                where: { id },
                data: { isActive, updatedById: actor.id },
            });
            await this.audit(transaction, actor.id, isActive ? 'ACTIVATE' : 'DEACTIVATE', updated, existing);
            return updated;
        });
        return this.toResponse(menu);
    }
    async navigation(query) {
        const organizationType = await this.prisma.organizationType.findFirst({
            where: { id: query.organization_type_id, isActive: true },
        });
        if (!organizationType)
            throw new common_1.NotFoundException('Organization type not found or is inactive.');
        const sharedOrganizationTypeCodes = organizationType.code === 'JNV'
            ? ['HEADQUARTER', 'REGIONAL_OFFICE']
            : organizationType.code === 'REGIONAL_OFFICE' ||
                organizationType.code === 'NLI'
                ? ['HEADQUARTER']
                : [];
        const menus = await this.prisma.menu.findMany({
            where: {
                menuLocation: query.menu_location,
                isActive: true,
                isDeleted: false,
                ...(sharedOrganizationTypeCodes.length === 0
                    ? { organizationTypeId: query.organization_type_id }
                    : {
                        OR: [
                            { organizationTypeId: query.organization_type_id },
                            {
                                organizationType: {
                                    code: { in: sharedOrganizationTypeCodes },
                                },
                                showOnAllOrganizations: true,
                            },
                        ],
                    }),
            },
            orderBy: [
                { display_order: 'asc' },
                { createdAt: 'desc' },
                { id: 'desc' },
            ],
        });
        return this.toTree(menus);
    }
    async validateReferences(transaction, dto, menuId) {
        const organizationType = await transaction.organizationType.findFirst({
            where: { id: dto.organization_type_id, isActive: true },
        });
        if (!organizationType)
            throw new common_1.NotFoundException('Organization type not found or is inactive.');
        if (dto.content_type_id) {
            const contentType = await transaction.contentType.findFirst({
                where: { id: dto.content_type_id, isDeleted: false },
            });
            if (!contentType)
                throw new common_1.NotFoundException('Content type not found or has been deleted.');
        }
        if (dto.media_type_id) {
            const mediaType = await transaction.mediaType.findFirst({
                where: { id: dto.media_type_id, isDeleted: false },
            });
            if (!mediaType)
                throw new common_1.NotFoundException('Media type not found or has been deleted.');
        }
        if (dto.parent_menu_id) {
            if (dto.parent_menu_id === menuId)
                throw new common_1.BadRequestException('A menu item cannot be its own parent.');
            const parent = await transaction.menu.findFirst({
                where: { id: dto.parent_menu_id, isDeleted: false },
            });
            if (!parent)
                throw new common_1.NotFoundException('Parent menu not found or has been deleted.');
            if (parent.organizationTypeId !== dto.organization_type_id ||
                parent.menuLocation !== dto.menu_location)
                throw new common_1.BadRequestException('Parent menu must use the same organization type and menu location.');
            if (menuId)
                await this.assertNoCircularParent(transaction, menuId, parent.id);
        }
        if (menuId) {
            const invalidChild = await transaction.menu.findFirst({
                where: {
                    parentMenuId: menuId,
                    isDeleted: false,
                    OR: [
                        { organizationTypeId: { not: dto.organization_type_id } },
                        { menuLocation: { not: dto.menu_location } },
                    ],
                },
            });
            if (invalidChild)
                throw new common_1.BadRequestException('A menu with children cannot change organization type or menu location independently.');
        }
    }
    async assertNoCircularParent(transaction, menuId, parentId) {
        let currentId = parentId;
        while (currentId) {
            if (currentId === menuId)
                throw new common_1.BadRequestException('Menu hierarchy cannot contain a circular reference.');
            const current = await transaction.menu.findUnique({
                where: { id: currentId },
                select: { parentMenuId: true },
            });
            currentId = current?.parentMenuId ?? null;
        }
    }
    async validateConfiguration(dto) {
        const destinations = [
            dto.content_type_id,
            dto.media_type_id,
            dto.external_url,
        ].filter((value) => value !== undefined && value !== null && value !== '').length;
        if (destinations > 1)
            throw new common_1.BadRequestException('Only one of content_type_id, media_type_id, or external_url may be configured.');
    }
    buildWhere(query) {
        return {
            organizationTypeId: query.organization_type_id,
            menuLocation: query.menu_location,
            parentMenuId: query.parent_menu_id,
            isActive: query.is_active,
            isDeleted: query.is_deleted ?? false,
            ...(query.search?.trim()
                ? {
                    OR: [
                        {
                            titleEnglish: {
                                contains: query.search.trim(),
                                mode: 'insensitive',
                            },
                        },
                        {
                            titleHindi: {
                                contains: query.search.trim(),
                                mode: 'insensitive',
                            },
                        },
                    ],
                }
                : {}),
        };
    }
    async findMenu(id) {
        const menu = await this.prisma.menu.findFirst({
            where: { id, isDeleted: false },
        });
        if (!menu)
            throw new common_1.NotFoundException('Menu not found or has been deleted.');
        return menu;
    }
    toTree(menus) {
        const items = new Map();
        const roots = [];
        for (const menu of menus)
            items.set(menu.id, this.toNavigation(menu));
        for (const menu of menus) {
            const item = items.get(menu.id);
            if (menu.parentMenuId === null)
                roots.push(item);
            else
                items.get(menu.parentMenuId)?.children.push(item);
        }
        return roots;
    }
    toResponse(menu) {
        return {
            id: menu.id,
            organization_type_id: menu.organizationTypeId,
            menu_location: menu.menuLocation,
            parent_menu_id: menu.parentMenuId,
            title_english: menu.titleEnglish,
            title_hindi: menu.titleHindi,
            content_type_id: menu.contentTypeId,
            media_type_id: menu.mediaTypeId,
            external_url: menu.externalUrl,
            link_target: menu.linkTarget,
            display_order: menu.display_order,
            is_active: menu.isActive,
            show_on_all_organizations: menu.showOnAllOrganizations,
            created_at: menu.createdAt,
            updated_at: menu.updatedAt,
            is_deleted: menu.isDeleted,
        };
    }
    toNavigation(menu) {
        return {
            id: menu.id,
            title_english: menu.titleEnglish,
            title_hindi: menu.titleHindi,
            content_type_id: menu.contentTypeId,
            media_type_id: menu.mediaTypeId,
            external_url: menu.externalUrl,
            link_target: menu.linkTarget,
            display_order: menu.display_order,
            children: [],
        };
    }
    async audit(transaction, userId, action, menu, previous) {
        await transaction.auditLog.create({
            data: {
                userId,
                module: 'MENU',
                entity: 'MENU',
                entityId: menu.id,
                action,
                ...(previous ? { previousValues: this.toAudit(previous) } : {}),
                newValues: this.toAudit(menu),
            },
        });
    }
    toAudit(menu) {
        return {
            id: menu.id,
            organization_type_id: menu.organizationTypeId,
            menu_location: menu.menuLocation,
            parent_menu_id: menu.parentMenuId,
            title_english: menu.titleEnglish,
            title_hindi: menu.titleHindi,
            content_type_id: menu.contentTypeId,
            media_type_id: menu.mediaTypeId,
            external_url: menu.externalUrl,
            link_target: menu.linkTarget,
            display_order: menu.display_order,
            is_active: menu.isActive,
            show_on_all_organizations: menu.showOnAllOrganizations,
            is_deleted: menu.isDeleted,
        };
    }
};
exports.MenusService = MenusService;
exports.MenusService = MenusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenusService);
//# sourceMappingURL=menus.service.js.map