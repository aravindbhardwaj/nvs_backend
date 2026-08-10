# Media Types Management Implementation

## Objective

Implement the **Media Types Management** module for the Production-Ready NVS CMS Backend.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

This feature implements the master data used to classify uploaded documents.

The Media module depends on this feature.

---

# Project Documentation

Before making any changes, read and understand

1. docs/01_PROJECT_SPECIFICATION.md
2. docs/02_IMPLEMENTATION_GUIDELINES.md
3. docs/04_DATABASE_DESIGN.md
4. docs/03_CODEX_WORKFLOW.md

Treat these documents as the single source of truth.

---

# Goal

Implement the complete Media Types Management module.

Media Types classify uploaded documents.

Examples

- Notice
- Circular
- Tender
- Office Memorandum
- Office Order
- Notification
- Guideline
- Policy
- Manual
- Report
- Recruitment
- Training Material
- Form
- Other

Media Types are configurable master data.

---

# Scope

Implement

- Media Types Module
- Controller
- Service
- DTOs
- Validation
- Pagination
- Filtering
- Sorting
- Soft Delete
- Restore
- Audit Logging

Implement only Media Types Management.

---

# Existing Code Review

Before implementation

Inspect

- Existing master modules
- Common DTOs
- Common services
- Pagination utilities
- Soft Delete implementation
- Audit logging

Reuse existing implementation.

Never duplicate code.

---

# Database

Use

```
nvs_media_types
```

Structure

```
id

name

description

display_order

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

## Create Media Type

POST /api/media-types

---

## Get Media Types

GET /api/media-types

Supports

- Pagination
- Search
- Sorting

---

## Get Media Type By ID

GET /api/media-types/:id

---

## Update Media Type

PUT /api/media-types/:id

---

## Soft Delete Media Type

DELETE /api/media-types/:id

---

## Restore Media Type

PATCH /api/media-types/:id/restore

---

# Validation

Validate

- Name required
- Name unique
- Description optional
- Display Order optional

Trim whitespace.

Prevent duplicate names.

---

# Business Rules

Only SUPER_ADMIN can manage Media Types.

A Media Type cannot be deleted if referenced by Media records.

Soft Deleted Media Types

- cannot be updated
- cannot be deleted again
- are excluded from normal queries

---

# Search / Filter / Sort

Support

```
?search=
?page=
?limit=
?sort=
?order=
?isDeleted=
```

Default

```
page=1

limit=20

sort=displayOrder

order=asc
```

Maximum

```
limit=100
```

---

# Audit Logging

Generate Audit Logs for

- Create
- Update
- Delete
- Restore

---

# Soft Delete

Implement

```
is_deleted

deleted_at

deleted_by
```

Never hard delete Media Types.

---

# Integration

Integrate with

- Authentication
- DTO Validation
- Audit Logs
- Soft Delete
- Standard API Response

---

# Constraints

Do NOT

- Implement Media Upload
- Implement File Storage
- Modify existing master modules

Implement only Media Types Management.

---

# Deliverables

Provide

## Files Created

## Files Modified

## APIs Implemented

## Database Changes

---

# Verification

Run

```bash
npm run build

npx prisma validate
```

Fix all issues before stopping.

---

# Final Review

Verify

✓ CRUD implemented

✓ Pagination

✓ Filtering

✓ Sorting

✓ Soft Delete

✓ Restore

✓ Audit Logging

✓ Authentication

✓ SUPER_ADMIN authorization

✓ Build successful

✓ Prisma validation successful

---

# Output Format

Return only

- Media Types Summary
- Files Created
- Files Modified
- APIs Implemented
- Database Changes
- Build Result
- Prisma Validation Result
- Remaining Work

Stop.

Wait for the next instruction.

Do not implement Pages.