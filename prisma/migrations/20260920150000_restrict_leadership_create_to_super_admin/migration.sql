DELETE FROM "nvs_role_permissions"
WHERE "role" IN (
    'HEADQUARTER'::"Role",
    'NLI'::"Role",
    'REGIONAL'::"Role",
    'JNV'::"Role"
  )
  AND "permission_id" IN (
    SELECT "id"
    FROM "nvs_permissions"
    WHERE "permission_key" IN (
      'LEADERSHIP_CREATE',
      'LEADERSHIP_UPDATE',
      'LEADERSHIP_DELETE'
    )
  );
