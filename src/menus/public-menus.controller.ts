import { Controller, Get, Query } from '@nestjs/common';

import { GetMenuNavigationQueryDto } from './dto/get-menu-navigation-query.dto';
import { MenusService } from './menus.service';

@Controller('api/public/menus')
export class PublicMenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get('navigation')
  async navigation(@Query() query: GetMenuNavigationQueryDto) {
    return {
      message: 'Menu navigation retrieved successfully.',
      data: await this.menusService.navigation(query),
    };
  }
}
