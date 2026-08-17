CREATE TABLE "visitor_sessions" (
    "id" SERIAL NOT NULL,
    "visitor_id" VARCHAR(36) NOT NULL,
    "session_id" VARCHAR(36) NOT NULL,
    "used_english" BOOLEAN NOT NULL DEFAULT false,
    "used_hindi" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "visitor_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "visitor_sessions_session_id_key" ON "visitor_sessions"("session_id");
CREATE INDEX "visitor_sessions_visitor_id_idx" ON "visitor_sessions"("visitor_id");
CREATE INDEX "visitor_sessions_started_at_idx" ON "visitor_sessions"("started_at");

INSERT INTO "nvs_permissions" (
  "permission_key",
  "module",
  "action",
  "description"
)
VALUES (
  'VISITOR_ANALYTICS_VIEW',
  'VISITOR_ANALYTICS',
  'VIEW',
  'View visitor analytics reports.'
)
ON CONFLICT ("permission_key") DO NOTHING;

INSERT INTO "nvs_role_permissions" ("role", "permission_id")
SELECT 'SUPER_ADMIN'::"Role", permission."id"
FROM "nvs_permissions" AS permission
WHERE permission."permission_key" = 'VISITOR_ANALYTICS_VIEW'
ON CONFLICT ("role", "permission_id") DO NOTHING;
