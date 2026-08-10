# Content Types Management Implementation

## Objective

Implement the **Content Types Management** module for the Production-Ready NVS CMS Backend.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

This feature implements the master data for Content Types.

Pages depend on this module.

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

Implement the complete Content Types Management module.

Content Types define the categories of CMS pages.

Examples

- About Us
- Mission
- Vision
- Objectives
- Welcome Message
- Notice
- Announcement
- Circular
- News

Content Types are configurable master data.

---

# Scope

Implement

- Content Types Module
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

Implement only Content Types Management.

---

# Existing Code Review

Before implementation

Inspect

- Existing master modules
- Common DTOs
- Common Services
- Pagination utilities
- Audit logging
- Soft Delete implementation

Reuse existing implementation.

Do not duplicate code.

---

# Database

Use

```
nvs_content_types
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

## Create Content Type

POST /api/content-types

---

## Get Content Types

GET /api/content-types

Support

- Pagination
- Search
- Sorting

---

## Get Content Type By ID

GET /api/content-types/:id

---

## Update Content Type

PUT /api/content-types/:id

---

## Soft Delete Content Type

DELETE /api/content-types/:id

---

## Restore Content Type

PATCH /api/content-types/:id/restore

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

Only SUPER_ADMIN can manage Content Types.

A Content Type cannot be deleted if referenced by Pages.

Soft Deleted Content Types

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

- is_deleted
- deleted_at
- deleted_by

Never hard delete records.

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

- Implement Pages
- Implement Media
- Modify existing master modules

Implement only Content Types Management.

---

# Deliverables

Provide

- Files Created
- Files Modified
- APIs Implemented
- Database Changes

---

# Verification

Run

npm run build

npx prisma validate

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

- Content Types Summary
- Files Created
- Files Modified
- APIs Implemented
- Database Changes
- Build Result
- Prisma Validation Result
- Remaining Work

Stop.

Wait for the next instruction.

Do not implement Media Types.