# Database Foundation Implementation

## Objective

Implement the complete database foundation for the **Production-Ready NVS CMS Backend**.

This feature establishes the application's database architecture and must be completed before implementing any business modules.

Your role is to act as a Senior Solution Architect, Senior NestJS Developer, Senior Prisma Developer, and Production Code Implementation Agent.

The implementation must strictly follow the project documentation while preserving the existing project architecture.

Do not redesign the project.

---

# Project Documentation

Before making any changes, read and understand the following documents.

These documents are the single source of truth.

1. docs/01_PROJECT_SPECIFICATION.md
2. docs/02_IMPLEMENTATION_GUIDELINES.md
3. docs/04_DATABASE_DESIGN.md
4. docs/03_CODEX_WORKFLOW.md

---

# Goal

Implement the complete database foundation required for the CMS backend.

This includes PostgreSQL configuration, Prisma configuration, schema creation, migrations, and database initialization.

This feature should prepare the project so that every subsequent module can be implemented without redesigning the database.

---

# Scope

Implement only the database foundation.

This includes

- PostgreSQL configuration
- Prisma configuration
- Prisma Client configuration
- Complete schema.prisma
- Initial migration
- Database connection
- Seed infrastructure
- Environment configuration
- Prisma module
- Prisma service
- Graceful shutdown support
- Common database utilities (if required)

Do not implement any business logic.

Do not implement CRUD APIs.

Do not implement authentication.

Do not implement authorization.

---

# Existing Code Review

Before implementation

Inspect

- Existing folder structure
- Existing Prisma schema
- Existing migrations
- Existing configuration
- Existing Prisma Service
- Existing environment configuration

Reuse existing implementation wherever possible.

Do not duplicate code.

---

# Database

Implement the database exactly as defined in

docs/04_DATABASE_DESIGN.md

Required implementation

## PostgreSQL

Configure PostgreSQL connection.

Use environment variables.

No hardcoded values.

---

## Prisma

Configure Prisma ORM.

Implement

- datasource
- generator
- enums
- models
- relationships
- indexes
- constraints

---

## Required Enums

Implement

- Role
- OrganizationType
- PageStatus
- UserStatus

---

## Required Tables

Implement

- nvs_regions
- nvs_states
- nvs_organizations
- nvs_users
- nvs_refresh_tokens
- nvs_content_types
- nvs_media_types
- nvs_pages
- nvs_media
- nvs_permissions
- nvs_role_permissions
- nvs_user_permissions
- nvs_audit_logs

Follow the database specification exactly.

---

## Relationships

Implement all relationships exactly as documented.

Do not introduce additional relationships.

---

## Constraints

Implement

- Primary Keys
- Foreign Keys
- Unique Constraints
- Composite Unique Constraints
- Required Indexes

---

## Naming

Follow

- nvs_ prefix
- snake_case database fields
- PascalCase Prisma models
- camelCase TypeScript properties

---

## Audit Columns

Implement

created_at

updated_at

created_by

updated_by

---

## Soft Delete Columns

Implement

is_deleted

deleted_at

deleted_by

where applicable.

---

## Migrations

Generate the initial migration.

Migration should create the complete database schema.

Do not manually edit migration files.

---

## Seed Infrastructure

Create the seed infrastructure only.

Do not implement complete seed data yet.

Seed implementation will be completed in the Seed Script feature.

---

# APIs

None.

This feature must not expose REST endpoints.

---

# Integrations

Implement

- Prisma Module
- Prisma Service
- Dependency Injection
- Configuration Module
- Environment Variables

Do not integrate business modules.

---

# Business Rules

Follow every database rule defined in

docs/04_DATABASE_DESIGN.md

Do not introduce additional entities.

Do not remove documented entities.

---

# Constraints

Do NOT

- Implement Authentication
- Implement Authorization
- Implement Controllers
- Implement Services (except Prisma Service)
- Implement DTOs
- Implement Guards
- Implement CRUD APIs
- Implement Seed Data
- Implement Audit Logic
- Implement Business Logic

Only establish the database foundation.

---

# Deliverables

Provide

## Files Created

Example

- prisma/schema.prisma
- prisma.config.ts
- prisma/seed.ts
- src/prisma/prisma.module.ts
- src/prisma/prisma.service.ts

---

## Files Modified

List every modified file.

---

## Database Changes

List

- Enums
- Models
- Relationships
- Constraints
- Indexes
- Migration Name

---

## Environment Variables

List required variables.

Example

DATABASE_URL

---

## Migration

Provide

Migration Name

Migration Command

Migration Result

---

# Verification

Run

```bash
npm run build

npx prisma validate
```

If validation fails

Fix all issues before stopping.

---

# Final Review

Verify

✓ PostgreSQL configured

✓ Prisma configured

✓ Prisma Client generated

✓ All required models created

✓ Relationships correct

✓ Constraints correct

✓ Indexes created

✓ Naming conventions followed

✓ Migration generated

✓ Build successful

✓ Prisma validation successful

---

# Output Format

Return only

## Database Foundation Summary

## Files Created

## Files Modified

## Database Models Implemented

## Enums Implemented

## Relationships Implemented

## Migration Details

## Environment Variables

## Build Result

## Prisma Validation Result

## Remaining Work

Stop.

Wait for the next instruction.

Do not continue to Authentication.