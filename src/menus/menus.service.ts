import { getAuditRequestContext } from '../common/request-context/audit-request-context';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Menu, Prisma } from '@prisma/client';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import { resolveRelatedId } from '../common/utils/resolve-related-id.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { GetMenuNavigationQueryDto } from './dto/get-menu-navigation-query.dto';
import { GetMenusQueryDto } from './dto/get-menus-query.dto';
import { MenuNavigationDto, MenuResponseDto } from './dto/menu-response.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { LINK_TARGET } from './menu.constants';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveUuid(uuid: string): Promise<number> {
    // Resolve deleted records too; existing operations enforce visibility and state.
    const record = await this.prisma.menu.findUnique({
      where: { uuid },
      select: { id: true },
    });
    if (!record) throw new NotFoundException('Record not found.');
    return record.id;
  }

  async create(
    dto: CreateMenuDto,
    actor: AuthenticatedUser,
  ): Promise<MenuResponseDto> {
    const resolvedDto = await this.resolveCreateRelations(dto);
    await this.validateConfiguration(resolvedDto);
    const menu = await this.prisma.$transaction(async (transaction) => {
      await this.validateReferences(transaction, resolvedDto);
      const created = await transaction.menu.create({
        data: {
          organizationTypeId: resolvedDto.organization_type_id,
          menuLocation: resolvedDto.menu_location,
          parentMenuId: resolvedDto.parent_menu_id ?? null,
          titleEnglish: resolvedDto.title_english,
          titleHindi: resolvedDto.title_hindi ?? null,
          contentTypeId: resolvedDto.content_type_id ?? null,
          mediaTypeId: resolvedDto.media_type_id ?? null,
          externalUrl: resolvedDto.external_url ?? null,
          pageUrl: resolvedDto.page_url ?? null,
          tabularType: resolvedDto.tabular_type ?? null,
          tabularData: resolvedDto.tabular_data ?? null,
          linkTarget: resolvedDto.link_target ?? LINK_TARGET.SAME_PAGE,
          display_order: resolvedDto.display_order ?? 0,
          isActive: resolvedDto.is_active ?? true,
          showOnAllOrganizations:
            resolvedDto.show_on_all_organizations ?? false,
          createdById: actor.id,
          updatedById: actor.id,
        },
      });
      await this.audit(transaction, actor.id, 'CREATE', created);
      return created;
    });
    return this.toResponse(menu);
  }

  async findAll(
    query: GetMenusQueryDto,
  ): Promise<PaginatedResponseDto<MenuResponseDto>> {
    query.organization_type_id = await this.resolveOrganizationTypeId(
      query.organization_type_id,
      query.organization_type_uuid,
    );
    query.parent_menu_id = await this.resolveMenuId(
      query.parent_menu_id,
      query.parent_menu_uuid,
    );
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
      meta: PaginationUtil.buildMeta(query.page, query.limit, totalItems),
    };
  }

  async findOne(id: number): Promise<MenuResponseDto> {
    return this.toResponse(await this.findMenu(id));
  }

  async update(
    id: number,
    dto: UpdateMenuDto,
    actor: AuthenticatedUser,
  ): Promise<MenuResponseDto> {
    const existing = await this.findMenu(id);
    dto.organization_type_id = await this.resolveOrganizationTypeId(
      dto.organization_type_id,
      dto.organization_type_uuid,
    );
    dto.parent_menu_id = await this.resolveMenuId(
      dto.parent_menu_id,
      dto.parent_menu_uuid,
    );
    dto.content_type_id = await this.resolveContentTypeId(
      dto.content_type_id,
      dto.content_type_uuid,
    );
    dto.media_type_id = await this.resolveMediaTypeId(
      dto.media_type_id,
      dto.media_type_uuid,
    );
    const candidate = {
      organization_type_id:
        dto.organization_type_id ?? existing.organizationTypeId,
      menu_location: dto.menu_location ?? existing.menuLocation,
      parent_menu_id:
        dto.parent_menu_id === undefined
          ? existing.parentMenuId
          : dto.parent_menu_id,
      content_type_id:
        dto.content_type_id === undefined
          ? existing.contentTypeId
          : dto.content_type_id,
      media_type_id:
        dto.media_type_id === undefined
          ? existing.mediaTypeId
          : dto.media_type_id,
      external_url:
        dto.external_url === undefined
          ? existing.externalUrl
          : dto.external_url,
      page_url: dto.page_url === undefined ? existing.pageUrl : dto.page_url,
      tabular_type:
        dto.tabular_type === undefined
          ? existing.tabularType
          : dto.tabular_type,
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
          ...(dto.page_url === undefined ? {} : { pageUrl: dto.page_url }),
          ...(dto.tabular_type === undefined
            ? {}
            : { tabularType: dto.tabular_type }),
          ...(dto.tabular_data === undefined
            ? {}
            : { tabularData: dto.tabular_data }),
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

  async setActive(
    id: number,
    isActive: boolean,
    actor: AuthenticatedUser,
  ): Promise<MenuResponseDto> {
    const existing = await this.findMenu(id);
    const menu = await this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.menu.update({
        where: { id },
        data: { isActive, updatedById: actor.id },
      });
      await this.audit(
        transaction,
        actor.id,
        isActive ? 'ACTIVATE' : 'DEACTIVATE',
        updated,
        existing,
      );
      return updated;
    });
    return this.toResponse(menu);
  }

  async navigation(
    query: GetMenuNavigationQueryDto,
  ): Promise<MenuNavigationDto[]> {
    query.organization_type_id = await this.resolveOrganizationTypeId(
      query.organization_type_id,
      query.organization_type_uuid,
    );
    const organizationType = await this.prisma.organizationType.findFirst({
      where: { id: query.organization_type_id, isActive: true },
    });
    if (!organizationType)
      throw new NotFoundException(
        'Organization type not found or is inactive.',
      );
    const sharedOrganizationTypeCodes =
      organizationType.code === 'JNV'
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

  private async validateReferences(
    transaction: Prisma.TransactionClient,
    dto: {
      organization_type_id: number;
      menu_location: number;
      parent_menu_id?: number | null;
      content_type_id?: number | null;
      media_type_id?: number | null;
    },
    menuId?: number,
  ): Promise<void> {
    const organizationType = await transaction.organizationType.findFirst({
      where: { id: dto.organization_type_id, isActive: true },
    });
    if (!organizationType)
      throw new NotFoundException(
        'Organization type not found or is inactive.',
      );
    if (dto.content_type_id) {
      const contentType = await transaction.contentType.findFirst({
        where: { id: dto.content_type_id, isDeleted: false },
      });
      if (!contentType)
        throw new NotFoundException(
          'Content type not found or has been deleted.',
        );
    }
    if (dto.media_type_id) {
      const mediaType = await transaction.mediaType.findFirst({
        where: { id: dto.media_type_id, isDeleted: false },
      });
      if (!mediaType)
        throw new NotFoundException(
          'Media type not found or has been deleted.',
        );
    }
    if (dto.parent_menu_id) {
      if (dto.parent_menu_id === menuId)
        throw new BadRequestException('A menu item cannot be its own parent.');
      const parent = await transaction.menu.findFirst({
        where: { id: dto.parent_menu_id, isDeleted: false },
      });
      if (!parent)
        throw new NotFoundException(
          'Parent menu not found or has been deleted.',
        );
      if (
        parent.organizationTypeId !== dto.organization_type_id ||
        parent.menuLocation !== dto.menu_location
      )
        throw new BadRequestException(
          'Parent menu must use the same organization type and menu location.',
        );
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
        throw new BadRequestException(
          'A menu with children cannot change organization type or menu location independently.',
        );
    }
  }

  private async assertNoCircularParent(
    transaction: Prisma.TransactionClient,
    menuId: number,
    parentId: number,
  ): Promise<void> {
    let currentId: number | null = parentId;
    while (currentId) {
      if (currentId === menuId)
        throw new BadRequestException(
          'Menu hierarchy cannot contain a circular reference.',
        );
      const current = await transaction.menu.findUnique({
        where: { id: currentId },
        select: { parentMenuId: true },
      });
      currentId = current?.parentMenuId ?? null;
    }
  }

  private async validateConfiguration(dto: {
    content_type_id?: number | null;
    media_type_id?: number | null;
    external_url?: string | null;
    tabular_type?: boolean | null;
  }): Promise<void> {
    const destinations = [
      dto.content_type_id,
      dto.media_type_id,
      dto.external_url,
    ].filter(
      (value) => value !== undefined && value !== null && value !== '',
    ).length;
    const destinationCount = destinations + (dto.tabular_type === true ? 1 : 0);
    if (destinationCount > 1)
      throw new BadRequestException(
        'Only one of content_type_id, media_type_id, external_url, or tabular_type may be configured.',
      );
  }

  private buildWhere(query: GetMenusQueryDto): Prisma.MenuWhereInput {
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

  private async findMenu(id: number): Promise<Menu> {
    const menu = await this.prisma.menu.findFirst({
      where: { id, isDeleted: false },
    });
    if (!menu)
      throw new NotFoundException('Menu not found or has been deleted.');
    return menu;
  }

  private resolveOrganizationTypeId(id?: number, uuid?: string) {
    return resolveRelatedId(id, uuid, 'Organization type', (value) =>
      this.prisma.organizationType.findUnique({
        where: { uuid: value },
        select: { id: true },
      }),
    );
  }
  private resolveMenuId(id?: number | null, uuid?: string | null) {
    if (uuid === null) return Promise.resolve(undefined);
    return resolveRelatedId(id, uuid, 'Menu', (value) =>
      this.prisma.menu.findUnique({
        where: { uuid: value },
        select: { id: true },
      }),
    );
  }
  private resolveContentTypeId(id?: number | null, uuid?: string | null) {
    if (
      (id === null && (uuid === undefined || uuid === null)) ||
      (id === undefined && uuid === null)
    )
      return Promise.resolve(null);
    return resolveRelatedId(id, uuid, 'Content type', (value) =>
      this.prisma.contentType.findUnique({
        where: { uuid: value },
        select: { id: true },
      }),
    );
  }
  private resolveMediaTypeId(id?: number | null, uuid?: string | null) {
    if (
      (id === null && (uuid === undefined || uuid === null)) ||
      (id === undefined && uuid === null)
    )
      return Promise.resolve(null);
    return resolveRelatedId(id, uuid, 'Media type', (value) =>
      this.prisma.mediaType.findUnique({
        where: { uuid: value },
        select: { id: true },
      }),
    );
  }

  private async resolveCreateRelations(
    dto: CreateMenuDto,
  ): Promise<CreateMenuDto & { organization_type_id: number }> {
    const resolveId = (
      id: number | null | undefined,
      uuid: string | null | undefined,
      label: string,
      findByUuid: (uuid: string) => Promise<{ id: number } | null>,
    ) => resolveRelatedId(id, uuid, label, findByUuid);

    return {
      ...dto,
      organization_type_id: (await resolveId(
        dto.organization_type_id,
        dto.organization_type_uuid,
        'Organization type',
        (uuid) =>
          this.prisma.organizationType.findUnique({
            where: { uuid },
            select: { id: true },
          }),
      ))!,
      parent_menu_id: await resolveId(
        dto.parent_menu_id,
        dto.parent_menu_uuid,
        'Parent menu',
        (uuid) =>
          this.prisma.menu.findUnique({
            where: { uuid },
            select: { id: true },
          }),
      ),
      content_type_id: await resolveId(
        dto.content_type_id,
        dto.content_type_uuid,
        'Content type',
        (uuid) =>
          this.prisma.contentType.findUnique({
            where: { uuid },
            select: { id: true },
          }),
      ),
      media_type_id: await resolveId(
        dto.media_type_id,
        dto.media_type_uuid,
        'Media type',
        (uuid) =>
          this.prisma.mediaType.findUnique({
            where: { uuid },
            select: { id: true },
          }),
      ),
    };
  }

  private toTree(menus: Menu[]): MenuNavigationDto[] {
    const items = new Map<number, MenuNavigationDto>();
    const roots: MenuNavigationDto[] = [];
    for (const menu of menus) items.set(menu.id, this.toNavigation(menu));
    for (const menu of menus) {
      const item = items.get(menu.id)!;
      if (menu.parentMenuId === null) roots.push(item);
      else items.get(menu.parentMenuId)?.children.push(item);
    }
    return roots;
  }

  private toResponse(menu: Menu): MenuResponseDto {
    return {
      id: menu.id,
      uuid: menu.uuid,
      organization_type_id: menu.organizationTypeId,
      menu_location: menu.menuLocation,
      parent_menu_id: menu.parentMenuId,
      title_english: menu.titleEnglish,
      title_hindi: menu.titleHindi,
      content_type_id: menu.contentTypeId,
      media_type_id: menu.mediaTypeId,
      external_url: menu.externalUrl,
      page_url: menu.pageUrl,
      tabular_type: menu.tabularType,
      tabular_data: menu.tabularData,
      link_target: menu.linkTarget,
      display_order: menu.display_order,
      is_active: menu.isActive,
      show_on_all_organizations: menu.showOnAllOrganizations,
      created_at: menu.createdAt,
      updated_at: menu.updatedAt,
      is_deleted: menu.isDeleted,
    };
  }

  private toNavigation(menu: Menu): MenuNavigationDto {
    return {
      id: menu.id,
      uuid: menu.uuid,
      title_english: menu.titleEnglish,
      title_hindi: menu.titleHindi,
      content_type_id: menu.contentTypeId,
      media_type_id: menu.mediaTypeId,
      external_url: menu.externalUrl,
      page_url: menu.pageUrl,
      tabular_type: menu.tabularType,
      tabular_data: menu.tabularData,
      link_target: menu.linkTarget,
      display_order: menu.display_order,
      children: [],
    };
  }

  private async audit(
    transaction: Prisma.TransactionClient,
    userId: number,
    action: string,
    menu: Menu,
    previous?: Menu,
  ): Promise<void> {
    await transaction.auditLog.create({
      data: {
        ...getAuditRequestContext(),
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

  private toAudit(menu: Menu): Prisma.InputJsonValue {
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
      page_url: menu.pageUrl,
      tabular_type: menu.tabularType,
      tabular_data: menu.tabularData,
      link_target: menu.linkTarget,
      display_order: menu.display_order,
      is_active: menu.isActive,
      show_on_all_organizations: menu.showOnAllOrganizations,
      is_deleted: menu.isDeleted,
    };
  }
}
