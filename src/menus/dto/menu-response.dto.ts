export class MenuResponseDto {
  id: number;
  organization_type_id: number;
  menu_location: number;
  parent_menu_id: number | null;
  title_english: string;
  title_hindi: string | null;
  content_type_id: number | null;
  media_type_id: number | null;
  external_url: string | null;
  link_target: number;
  display_order: number;
  is_active: boolean;
  show_on_all_organizations: boolean;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export class MenuNavigationDto {
  id: number;
  title_english: string;
  title_hindi: string | null;
  content_type_id: number | null;
  media_type_id: number | null;
  external_url: string | null;
  link_target: number;
  display_order: number;
  children: MenuNavigationDto[];
}
