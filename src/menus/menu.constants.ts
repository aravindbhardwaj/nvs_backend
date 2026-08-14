export const MENU_LOCATION = {
  HEADER: 1,
  FOOTER: 2,
} as const;

export const LINK_TARGET = {
  SAME_PAGE: 1,
  NEW_PAGE: 2,
} as const;

export const MENU_LOCATION_VALUES = Object.values(MENU_LOCATION);
export const LINK_TARGET_VALUES = Object.values(LINK_TARGET);
