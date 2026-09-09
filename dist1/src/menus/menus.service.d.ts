import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { GetMenuNavigationQueryDto } from './dto/get-menu-navigation-query.dto';
import { GetMenusQueryDto } from './dto/get-menus-query.dto';
import { MenuNavigationDto, MenuResponseDto } from './dto/menu-response.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
export declare class MenusService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateMenuDto, actor: AuthenticatedUser): Promise<MenuResponseDto>;
    findAll(query: GetMenusQueryDto): Promise<PaginatedResponseDto<MenuResponseDto>>;
    findOne(id: number): Promise<MenuResponseDto>;
    update(id: number, dto: UpdateMenuDto, actor: AuthenticatedUser): Promise<MenuResponseDto>;
    setActive(id: number, isActive: boolean, actor: AuthenticatedUser): Promise<MenuResponseDto>;
    navigation(query: GetMenuNavigationQueryDto): Promise<MenuNavigationDto[]>;
    private validateReferences;
    private assertNoCircularParent;
    private validateConfiguration;
    private buildWhere;
    private findMenu;
    private toTree;
    private toResponse;
    private toNavigation;
    private audit;
    private toAudit;
}
