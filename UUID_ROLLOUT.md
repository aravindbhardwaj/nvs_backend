# UUID rollout

## Development database verification (2026-09-15)

Read-only verification of `localhost:5432/nvs_cms` found both UUID migrations
already applied. All 22 models passed checks for UUID column type, non-null
constraints, database generation defaults and unique indexes. Existing rows had
no missing or duplicate UUIDs within each table, and Prisma queries succeeded for
every model. Available records still had numeric IDs. This verifies database
integrity and client reads, not authenticated end-to-end workflows.

Migration history has one existing blocker: the applied migration
`20260825130000_add_shared_media_placements` has an empty local directory with no
`migration.sql`. It is absent from available local Git history. Restore the
original file from another checkout or backup before running migration commands;
do not replace it with an invented migration or change its applied history.
All other applied migration files, including both UUID migrations, match their
stored checksums. No database writes were made during this verification.

### Follow-up workflow verification

Fetched remote Git history and searched other local development checkouts; the
missing migration was not found. Its original source is still required.

The media-type service passed a database-backed smoke test covering creation,
numeric detail lookup, filtered/paginated listing, update, soft delete, deleted
listing and restore. The UUID remained stable throughout, and audit records kept
numeric user/entity references while receiving their own UUIDs. All test record
and audit changes were rolled back; PostgreSQL sequence values may have advanced.
This called the service directly, so HTTP validation, login, permission guards
and frontend flows still require end-to-end verification.

All 22 Prisma models now have a unique, non-null PostgreSQL `uuid` column.
Numeric primary keys, foreign keys, request parameters, sorting and authentication
identifiers retain their existing types. Record response DTOs expose an additional
`uuid`, including public records, navigation items and nested entity references.
Internal refresh-token and visitor-session UUIDs are not new authentication tokens
or analytics visitor identifiers. Aggregate responses do not need record UUIDs.

## Deployment order

1. Rehearse both UUID migrations on a recent database copy and verify backups.
   PostgreSQL must provide `gen_random_uuid()` (built in on PostgreSQL 13+).
2. Review pending migrations before running `npx prisma migrate deploy` against
   the intended environment; this command applies all pending migrations.
3. Run `npx prisma generate`, build, and deploy the updated application only after
   the database migrations succeed. The new client selects the UUID column even
   in some existing queries that return complete records.
4. Check list/detail/create/update/delete/restore responses, permissions and login.

The migrations backfill existing records, including soft-deleted records, and
install database defaults for all insert paths. Each migration is atomic and uses
a five-second lock acquisition timeout. Backfills and index creation hold table
locks until commit; this is not a zero-downtime migration. For large tables such
as audit logs or visitor sessions, use a maintenance window or split deployment
into nullable-column addition, batched backfill, concurrent unique-index creation
and final non-null enforcement before deploying this application version.

If a migration fails, inspect the failure and Prisma migration status before
retrying. The application can be rolled back to its prior version while retaining
the additive database columns and defaults.

## Frontend compatibility

Existing numeric `id` fields and routes still work. Resource routes additionally
support UUID aliases with the same guards, permissions and response envelopes as
their numeric equivalents. For example, media types support:

| Operation | UUID route |
| --- | --- |
| View | `GET /api/media-types/uuid/:uuid` |
| Update | `POST /api/media-types/uuid/:uuid/update` |
| Soft delete | `POST /api/media-types/uuid/:uuid/delete` |
| Restore | `POST /api/media-types/uuid/:uuid/restore` |

Use the `uuid` returned by the media-type list or create response. Invalid UUIDs
return 400; unknown records return 404. Deleted-record behavior, reference checks
and audit logging continue through the existing numeric service operations.
UUIDs are identifiers, not access credentials.

### Remaining resource routes

An additional 78 aliases cover content types, regions, organizations, users,
permissions, user permissions, audit logs, pages, media, banners, gallery,
leadership, modals, menus and JNV principals. This includes existing actions such
as activate/deactivate, publish/unpublish, reset password, restore, image
replacement and file download wherever those numeric endpoints already exist.
Public image/download/detail endpoints also have aliases and retain their
existing public visibility checks.

The anonymous organization directories also expose `GET /api/public/regional-offices`
and `GET /api/public/nlis`. Both return paginated, non-deleted, functional
organizations with UUIDs, codes, bilingual names and addresses, and nullable
region names. They accept `page` and `limit` (up to 1,000), like the public JNV
directory. These list routes do not require a UUID in the URL.

The convention is to replace `:id` with `uuid/:uuid`. Write operations use POST
with an action suffix, while their request bodies and access rules stay the same:

```text
GET   /api/users/uuid/:uuid
POST  /api/pages/uuid/:uuid/publish
GET   /api/public/media/uuid/:uuid/download
POST  /api/user-permissions/uuid/:uuid/update
GET   /api/jnvs/:organizationId/principals/uuid/:uuid
```

For user permissions, the UUID identifies the user. For nested JNV principal
routes, it identifies the principal; `organizationId` remains numeric and the
existing organization/principal relationship checks still apply.

Create bodies, foreign-reference inputs, query filters, bulk/reorder arrays and
nested parent organization parameters retain their numeric contracts. List-only,
slug-based, role-enum and authentication endpoints keep their existing routes.
Frontend migration and UUID support for these other input types are separate work.

Ownership guards resolve UUIDs before checking resource ownership. File replacement
handlers resolve UUIDs inside their cleanup blocks so a missing record does not
leave an uploaded file behind.

The expanded build and all 252 tests passed. Added regression coverage checks all
78 aliases and access metadata, resolution against the intended model, ownership
denial and cleanup after failed upload lookups. This is not an end-to-end test of
every new route with real credentials and production data.

The build and 149 tests passed, including eight HTTP tests with simulated
authentication and mocked service responses for routing, validation, role denial,
permission metadata parity and numeric compatibility. A database-backed controller
smoke test also passed UUID lookup/update/delete/restore, missing UUID handling,
UUID stability and numeric audit references. Test record/audit writes were rolled
back; sequence values may have advanced. Actual login and frontend workflows are
not covered by these checks.

## Validation

Schema validation, application build and the existing Jest suite passed. Both UUID
migrations were also exercised on a disposable PostgreSQL 16 database with minimal
table fixtures: existing IDs were preserved, existing/new rows received UUIDs,
updates preserved UUIDs, and duplicate/null UUIDs were rejected for all 22 tables.
This does not measure production backfill time, lock contention or full-schema
integration behavior; perform the database-copy rehearsal before deployment.
