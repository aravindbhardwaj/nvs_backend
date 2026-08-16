INSERT INTO "nvs_permissions" (
  "permission_key",
  "module",
  "action",
  "description"
)
VALUES
  ('MENU_CREATE', 'MENU', 'CREATE', 'Create menu items.'),
  ('MENU_VIEW', 'MENU', 'VIEW', 'View menu items.'),
  ('MENU_UPDATE', 'MENU', 'UPDATE', 'Update menu items.')
ON CONFLICT ("permission_key") DO NOTHING;

INSERT INTO "nvs_role_permissions" ("role", "permission_id")
SELECT 'SUPER_ADMIN'::"Role", permission."id"
FROM "nvs_permissions" AS permission
WHERE permission."permission_key" IN ('MENU_CREATE', 'MENU_VIEW', 'MENU_UPDATE')
ON CONFLICT ("role", "permission_id") DO NOTHING;
