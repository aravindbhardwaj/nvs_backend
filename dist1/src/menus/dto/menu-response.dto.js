"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuNavigationDto = exports.MenuResponseDto = void 0;
class MenuResponseDto {
    id;
    organization_type_id;
    menu_location;
    parent_menu_id;
    title_english;
    title_hindi;
    content_type_id;
    media_type_id;
    external_url;
    link_target;
    display_order;
    is_active;
    show_on_all_organizations;
    created_at;
    updated_at;
    is_deleted;
}
exports.MenuResponseDto = MenuResponseDto;
class MenuNavigationDto {
    id;
    title_english;
    title_hindi;
    content_type_id;
    media_type_id;
    external_url;
    link_target;
    display_order;
    children;
}
exports.MenuNavigationDto = MenuNavigationDto;
//# sourceMappingURL=menu-response.dto.js.map