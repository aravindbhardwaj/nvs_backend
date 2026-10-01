export class MenuResponseDto {
  id: number;
  uuid: string;
  organization_type_id: number;
  organization_type_uuid: string;
  organization_type: {
    uuid: string;
    code: string;
    name: string;
  };
  menu_location: number;
  parent_menu_id: number | null;
  parent_menu_uuid: string | null;
  parent_menu: {
    uuid: string;
    title_english: string;
    title_hindi: string | null;
  } | null;
  title_english: string;
  title_hindi: string | null;
  content_type_id: number | null;
  content_type_uuid: string | null;
  content_type: {
    uuid: string;
    name_english: string;
    name_hindi: string | null;
  } | null;
  media_type_id: number | null;
  media_type_uuid: string | null;
  media_type: {
    uuid: string;
    name_english: string;
    name_hindi: string | null;
  } | null;
  external_url: string | null;
  page_url: string | null;
  tabular_type: boolean | null;
  tabular_data: string | null;
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
  uuid: string;
  title_english: string;
  title_hindi: string | null;
  content_type_id: number | null;
  content_type_uuid: string | null;
  media_type_id: number | null;
  media_type_uuid: string | null;
  external_url: string | null;
  page_url: string | null;
  tabular_type: boolean | null;
  tabular_data: string | null;
  link_target: number;
  display_order: number;
  children: MenuNavigationDto[];
}
