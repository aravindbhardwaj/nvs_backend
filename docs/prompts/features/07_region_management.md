# Region Management Implementation

## Objective

Implement the **Region Management** module for the Production-Ready NVS CMS Backend.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

This feature implements complete CRUD operations for Regions.

Regions are master data.

Regional Offices belong to Regions.

Organizations will depend on this module.

---

# Project Documentation

Before making any changes, read and understand:

1. docs/01_PROJECT_SPECIFICATION.md
2. docs/02_IMPLEMENTATION_GUIDELINES.md
3. docs/04_DATABASE_DESIGN.md
4. docs/03_CODEX_WORKFLOW.md

These documents are the single source of truth.

---

# Goal

Implement the complete Region Management module.

This module manages Region master data.

The implementation must be production-ready.

---

# Scope

Implement

- Region Module
- Region Controller
- Region Service
- DTOs
- Validation
- Pagination
- Filtering
- Sorting
- Soft Delete
- Restore
- Audit Logging

Implement only Region Management.

---

# Existing Code Review

Before implementation

Inspect

- Existing project structure
- Prisma schema
- Existing master modules
- Common utilities
- Common DTOs
- Exception handling
- Audit logging
- Soft Delete implementation

Reuse existing implementation.

Never duplicate code.

---

# Database

Use the existing table

```
nvs_regions
```

Structure

```
id

region_name

region_code

created_at

updated_at

created_by

updated_by

is_deleted

deleted_at

deleted_by
```

Do not redesign the schema.

---

# APIs

Implement

---

## Create Region

```
POST /api/regions
```

Authentication

Required

Authorization

SUPER_ADMIN

---

## Get Regions

```
GET /api/regions
```

Support

- Pagination
- Search
- Sorting

---

## Get Region By ID

```
GET /api/regions/:id
```

---

## Update Region

```
PUT /api/regions/:id
```

---

## Soft Delete Region

```
DELETE /api/regions/:id
```

---

## Restore Region

```
PATCH /api/regions/:id/restore
```

---

# Validation

Validate

- region_name required
- region_code required
- region_name unique
- region_code unique
- Trim whitespace
- Prevent duplicate values

Use DTO validation.

---

# Business Rules

Only SUPER_ADMIN can manage Regions.

Soft Deleted Regions

- cannot be updated
- cannot be deleted again
- are excluded from normal queries

A Region cannot be deleted if Organizations reference it.

Return a meaningful error message.

---

# Pagination

Default

```
page=1

limit=20
```

Maximum

```
100
```

---

# Filtering

Support

```
?search=

?isDeleted=
```

---

# Sorting

Support

```
?sort=

?order=
```

Default

```
createdAt DESC
```

---

# Audit Logging

Generate Audit Logs for

- Create
- Update
- Delete
- Restore

Record

- Previous Values
- New Values
- User
- Timestamp

---

# Soft Delete

Implement

```
is_deleted

deleted_at

deleted_by
```

Do not hard delete records.

---

# Integrations

Integrate with

- Authentication
- DTO Validation
- Audit Logs
- Soft Delete
- Standard API Response
- Pagination
- Filtering
- Sorting

---

# Constraints

Do NOT

- Implement Organizations
- Implement States
- Modify other master tables
- Redesign database
- Implement business modules

Only implement Region Management.

---

# Deliverables

Provide

## Files Created

Example

```
src/regions/

regions.module.ts

regions.controller.ts

regions.service.ts

dto/
```

---

## Files Modified

List every modified file.

---

## APIs Implemented

```
POST /api/regions

GET /api/regions

GET /api/regions/:id

PUT /api/regions/:id

DELETE /api/regions/:id

PATCH /api/regions/:id/restore
```

---

## Database Changes

List any schema changes.

If none

```
No schema changes required.
```

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

✓ CRUD implemented

✓ Pagination implemented

✓ Filtering implemented

✓ Sorting implemented

✓ Soft Delete implemented

✓ Restore implemented

✓ Audit Logging integrated

✓ Authentication enforced

✓ SUPER_ADMIN authorization enforced

✓ Build successful

✓ Prisma validation successful

---

# Output Format

Return only

## Region Module Summary

## Files Created

## Files Modified

## APIs Implemented

## Database Changes

## Build Result

## Prisma Validation Result

## Remaining Work

Stop.

Wait for the next instruction.

Do not implement State Management.