# Permissions Master Implementation

## Objective

Implement the **Permissions Master** for the Production-Ready NVS CMS Backend.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

This feature creates the application's immutable permission catalog.

It does **NOT** assign permissions to Roles or Users.

Those are implemented in subsequent features.

---

# Project Documentation

Before making any changes, read and understand:

1. docs/01_PROJECT_SPECIFICATION.md
2. docs/02_IMPLEMENTATION_GUIDELINES.md
3. docs/04_DATABASE_DESIGN.md
4. docs/03_CODEX_WORKFLOW.md

Treat these documents as the single source of truth.

---

# Goal

Implement the Permission Master.

The Permission Master defines every permission available in the system.

Permission definitions are immutable.

They are created only through database seed scripts.

Applications consume these permissions during authorization.

---

# Scope

Implement only

- Permission Module
- Permission Entity (Prisma already exists)
- Permission Service
- Permission Controller
- Permission DTOs (Read only)
- Permission Queries

Implement only

- Get Permissions
- Get Permission By ID

Do NOT implement

- Create Permission
- Update Permission
- Delete Permission
- Assign Permission
- Authorization Logic

---

# Existing Code Review

Before implementation

Inspect

- Prisma Models
- Existing Modules
- Existing Controllers
- Existing Services
- Existing DTOs

Reuse existing implementation.

Do not duplicate code.

---

# Database

Use the existing table

```
nvs_permissions
```

Do not modify the schema unless absolutely required.

Columns

```
id

permission_key

module

action

description

created_at
```

Permission definitions are immutable.

---

# APIs

Implement

---

## Get Permissions

```
GET /api/permissions
```

Authentication

```
Required
```

Authorization

```
SUPER_ADMIN only
```

Supports

- Pagination
- Search
- Sorting

---

## Get Permission By ID

```
GET /api/permissions/:id
```

Authentication

Required

Authorization

SUPER_ADMIN

---

# Business Rules

Permissions

- Cannot be created through API.
- Cannot be updated through API.
- Cannot be deleted through API.
- Must be seeded.
- Must remain immutable.

Permission definitions are maintained only through code and database migrations.

---

# Example Seed Data

Implement seed support for permissions such as

```
USER_CREATE

USER_VIEW

USER_UPDATE

USER_DELETE

USER_RESTORE

ORGANIZATION_CREATE

ORGANIZATION_VIEW

ORGANIZATION_UPDATE

ORGANIZATION_DELETE

PAGE_CREATE

PAGE_VIEW

PAGE_UPDATE

PAGE_DELETE

MEDIA_UPLOAD

MEDIA_VIEW

MEDIA_DELETE

AUDIT_LOG_VIEW
```

Additional permissions may be added later.

---

# Integrations

Integrate with

- Prisma
- Authentication
- DTO Validation
- Standard API Response

Do not integrate Role Permissions yet.

Do not integrate User Permissions yet.

---

# Constraints

Do NOT

- Assign Permissions
- Implement Authorization
- Implement Role Mapping
- Implement User Mapping
- Implement Permission CRUD

Implement only the immutable Permission Master.

---

# Deliverables

Provide

## Files Created

Example

```
src/permissions/

permission.controller.ts

permission.service.ts

permission.module.ts

dto/
```

---

## Files Modified

List every modified file.

---

## APIs Implemented

```
GET /api/permissions

GET /api/permissions/:id
```

---

## Database Changes

List

- Schema Changes
- Seed Changes

If none

State

```
No database schema changes required.
```

---

## Permission Definitions

List

- Number of permissions added
- Modules covered

---

# Verification

Run

```bash
npm run build

npx prisma validate
```

Fix every issue before stopping.

---

# Final Review

Verify

✓ Permission Module implemented

✓ Read APIs implemented

✓ Pagination implemented

✓ Search implemented

✓ Sorting implemented

✓ Authentication enforced

✓ SUPER_ADMIN authorization enforced

✓ Permission definitions immutable

✓ Build successful

✓ Prisma validation successful

---

# Output Format

Return only

## Permission Module Summary

## Files Created

## Files Modified

## APIs Implemented

## Permission Definitions Added

## Database Changes

## Build Result

## Prisma Validation Result

## Remaining Work

Stop.

Wait for the next instruction.

Do not implement Role Permissions or User Permission Overrides.