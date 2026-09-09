import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateMenuDto } from './dto/create-menu.dto';
import { GetMenuNavigationQueryDto } from './dto/get-menu-navigation-query.dto';
import { GetMenusQueryDto } from './dto/get-menus-query.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenusService } from './menus.service';
export declare class MenusController {
    private readonly menusService;
    constructor(menusService: MenusService);
    create(dto: CreateMenuDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/menu-response.dto").MenuResponseDto;
    }>;
    findAll(query: GetMenusQueryDto): Promise<{
        message: string;
        data: import("../common/dto/paginated-response.dto").PaginatedResponseDto<import("./dto/menu-response.dto").MenuResponseDto>;
    }>;
    navigation(query: GetMenuNavigationQueryDto): Promise<{
        message: string;
        data: import("./dto/menu-response.dto").MenuNavigationDto[];
    }>;
    findOne(id: number): Promise<{
        message: string;
        data: import("./dto/menu-response.dto").MenuResponseDto;
    }>;
    update(id: number, dto: UpdateMenuDto, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/menu-response.dto").MenuResponseDto;
    }>;
    activate(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/menu-response.dto").MenuResponseDto;
    }>;
    deactivate(id: number, user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./dto/menu-response.dto").MenuResponseDto;
    }>;
}
