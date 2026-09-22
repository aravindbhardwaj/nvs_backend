INSERT INTO "nvs_role_permissions" ("role", "permission_id")
SELECT role_name::"Role", permission."id"
FROM unnest(ARRAY['HEADQUARTER', 'NLI', 'REGIONAL', 'JNV']) AS role_name
CROSS JOIN "nvs_permissions" AS permission
WHERE permission."permission_key" IN (
  'ORGANIZATION_VIEW',
  'ORGANIZATION_UPDATE'
)
ON CONFLICT ("role", "permission_id") DO NOTHING;
