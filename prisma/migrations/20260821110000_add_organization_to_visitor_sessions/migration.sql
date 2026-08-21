ALTER TABLE "visitor_sessions"
  ADD COLUMN "organization_id" INTEGER;

DROP INDEX "visitor_sessions_session_id_key";

CREATE UNIQUE INDEX "visitor_sessions_organization_id_session_id_key"
  ON "visitor_sessions"("organization_id", "session_id");

CREATE INDEX "visitor_sessions_organization_id_idx"
  ON "visitor_sessions"("organization_id");

CREATE INDEX "visitor_sessions_organization_id_started_at_idx"
  ON "visitor_sessions"("organization_id", "started_at");

ALTER TABLE "visitor_sessions"
  ADD CONSTRAINT "visitor_sessions_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "nvs_organizations"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
