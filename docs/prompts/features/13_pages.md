# Pages Management Implementation

## Objective

Implement the **Pages Management** module for the Production-Ready NVS CMS Backend.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

Pages represent the primary textual content managed by the CMS.

This implementation must be production-ready while preserving the existing project architecture.

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

Implement the complete Pages module.

Pages belong to exactly one Organization.

Pages belong to exactly one Content Type.

Each Organization may have only one Page for a given Content Type.

Implement the complete content lifecycle including creation, update, publishing, retrieval, search, soft delete and restore.

---

# Scope

Implement

- Pages Module
- Pages Controller
- Pages Service
- DTOs
- Validation
- Slug Generation
- Publish / Unpublish
- Pagination
- Filtering
- Sorting
- Search
- Soft Delete
- Restore
- Audit Logging

Implement only Pages.

---

# Existing Code Review

Before implementation

Inspect

- Authentication Module
- Organizations Module
- Content Types Module
- Common DTOs
- Pagination utilities
- Soft Delete implementation
- Audit Logging

Reuse existing implementation.

Do not duplicate code.

---

# Database

Use

```
nvs_pages
```

Structure

```
id

organization_id

content_type_id

title

slug

short_description

content

status

display_order

published_at

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

## Create Page

POST /api/pages

---

## Get Pages

GET /api/pages

Supports

- Pagination
- Search
- Filtering
- Sorting

---

## Get Page By ID

GET /api/pages/:id

---

## Get Page By Slug

GET /api/pages/slug/:slug

---

## Update Page

PUT /api/pages/:id

---

## Publish Page

PATCH /api/pages/:id/publish

---

## Unpublish Page

PATCH /api/pages/:id/unpublish

---

## Soft Delete Page

DELETE /api/pages/:id

---

## Restore Page

PATCH /api/pages/:id/restore

---

# Validation

Validate

- Organization exists
- Content Type exists
- Title required
- Content required
- Title trimmed
- Slug unique
- Status valid

Reject duplicate pages for

```
Organization

+

Content Type
```

Use DTO validation.

---

# Slug Generation

Automatically generate slug from title.

Example

```
About Us

↓

about-us
```

Rules

- lowercase
- hyphen separated
- URL friendly
- unique

If duplicate

```
about-us

↓

about-us-2
```

Never allow manual duplicate slugs.

---

# Publishing Workflow

Support two statuses

```
DRAFT

PUBLISHED
```

Publishing

- Set status
- Set published_at

Unpublishing

- Restore status to DRAFT
- Clear published_at

---

# Search / Filter / Sort

Support

```
?search=

?page=

?limit=

?organizationId=

?contentTypeId=

?status=

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

# Business Rules

Only one page per

```
Organization

+

Content Type
```

Only published pages are considered public.

Draft pages remain editable.

Soft Deleted pages

- cannot be published
- cannot be updated
- cannot be deleted again

---

# Ownership Rules

SUPER_ADMIN

- Full access

Other users

- Only manage Pages belonging to their Organization

Never allow users to modify Pages belonging to another Organization.

---

# Audit Logging

Generate Audit Logs for

- Create
- Update
- Publish
- Unpublish
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

Never hard delete Pages.

---

# Integration

Integrate with

- Authentication
- Organizations
- Content Types
- DTO Validation
- Audit Logs
- Soft Delete
- Standard API Response
- Pagination
- Search
- Filtering
- Sorting

---

# Constraints

Do NOT

- Implement Versioning
- Implement Workflow Approval
- Implement Categories
- Implement Tags
- Implement Revision History
- Implement SEO Module
- Implement Comments

Implement only the Pages module.

---

# Deliverables

Provide

## Files Created

Example

```
src/pages/

pages.module.ts

pages.controller.ts

pages.service.ts

dto/
```

---

## Files Modified

List every modified file.

---

## APIs Implemented

```
POST /api/pages

GET /api/pages

GET /api/pages/:id

GET /api/pages/slug/:slug

PUT /api/pages/:id

PATCH /api/pages/:id/publish

PATCH /api/pages/:id/unpublish

DELETE /api/pages/:id

PATCH /api/pages/:id/restore
```

---

## Database Changes

List schema or migration changes.

If none

```
No schema changes required.
```

---

## Content Management Summary

Summarize

- Slug Generation
- Publishing Workflow
- Ownership Rules
- Search
- Pagination

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

✓ Slug generation implemented

✓ Publish / Unpublish implemented

✓ One Page per Organization + Content Type enforced

✓ Search implemented

✓ Pagination implemented

✓ Filtering implemented

✓ Sorting implemented

✓ Soft Delete implemented

✓ Restore implemented

✓ Audit Logging integrated

✓ Authentication enforced

✓ Organization ownership enforced

✓ Build successful

✓ Prisma validation successful

---

# Output Format

Return only

- Pages Module Summary
- Files Created
- Files Modified
- APIs Implemented
- Database Changes
- Build Result
- Prisma Validation Result
- Remaining Work

Stop.

Wait for the next instruction.

Do not implement Media.