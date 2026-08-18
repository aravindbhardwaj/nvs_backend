import { Controller, Get, Query } from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorator';
import { GetMenuNavigationQueryDto } from './dto/get-menu-navigation-query.dto';
import { MenusService } from './menus.service';

@Public()
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
