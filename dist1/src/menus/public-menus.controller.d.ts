import { GetMenuNavigationQueryDto } from './dto/get-menu-navigation-query.dto';
import { MenusService } from './menus.service';
export declare class PublicMenusController {
    private readonly menusService;
    constructor(menusService: MenusService);
    navigation(query: GetMenuNavigationQueryDto): Promise<{
        message: string;
        data: import("./dto/menu-response.dto").MenuNavigationDto[];
    }>;
}
