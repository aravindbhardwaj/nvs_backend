# Soft Delete Integration & Verification

## Objective

Perform a project-wide review and integration of **Soft Delete** across the Production-Ready NVS CMS Backend.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

This is an **integration and verification phase**, not a standalone CRUD implementation.

Soft Delete support should already exist in the database schema and business modules.

Your objective is to ensure it is implemented consistently across the entire application.

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

Review every implemented module.

Ensure Soft Delete is implemented consistently.

Do not redesign existing modules.

Only fix inconsistencies.

---

# Scope

Review

- Users
- Organizations
- Regions
- States
- Content Types
- Media Types
- Pages
- Media

Verify

- Soft Delete
- Restore
- Query Filtering
- Delete Restrictions
- Audit Logging
- Pagination
- Search

Implement only missing Soft Delete behavior.

---

# Existing Code Review

Inspect

- Prisma Models
- Services
- Controllers
- Common Utilities
- Repository Methods

Reuse existing implementation.

Never duplicate logic.

---

# Database Verification

Verify every applicable entity contains

```
is_deleted

deleted_at

deleted_by
```

Do not modify immutable tables

- Permissions
- Role Permissions
- Audit Logs

---

# Query Verification

Verify normal queries automatically exclude

```
is_deleted = true
```

Administrative queries should optionally support

```
?isDeleted=true

?isDeleted=false
```

Do not require every service to manually repeat filtering logic if a common abstraction already exists.

---

# Restore Verification

Verify Restore exists for

- Users
- Organizations
- Regions
- States
- Content Types
- Media Types
- Pages
- Media

Restore should

```
is_deleted = false

deleted_at = null

deleted_by = null
```

---

# Delete Restrictions

Prevent Soft Delete when dependent records exist.

Examples

Organization

Cannot delete if it contains

- Users
- Pages
- Media
- Child Organizations

Region

Cannot delete if referenced by Organizations.

State

Cannot delete if referenced by Organizations.

Content Type

Cannot delete if referenced by Pages.

Media Type

Cannot delete if referenced by Media.

---

# API Verification

Verify every applicable module exposes

```
DELETE

PATCH Restore
```

Routes should remain consistent.

Example

```
DELETE /api/users/:id

PATCH /api/users/:id/restore
```

---

# Audit Logging

Verify every Soft Delete

and

every Restore

creates an Audit Log.

Record

- Previous Values
- New Values
- User
- Timestamp

---

# Business Rules

Soft Delete

- Never physically remove records.
- Preserve relationships.
- Preserve audit history.
- Preserve created_at.

Restore

Must fully restore the entity.

---

# Integration

Verify integration with

- Authentication
- Audit Logs
- Standard Response
- Pagination
- Filtering
- Search

---

# Constraints

Do NOT

- Hard Delete business records.
- Modify immutable tables.
- Introduce duplicate Soft Delete implementations.
- Redesign existing services.

Implement only missing Soft Delete functionality.

---

# Deliverables

Provide

## Modules Reviewed

List every module reviewed.

---

## Missing Integrations Fixed

Summarize all fixes.

---

## APIs Verified

List Restore APIs.

---

## Database Changes

List schema changes.

If none

State

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

Verify

- Deleted records hidden
- Restore works
- Search ignores deleted records
- Pagination ignores deleted records
- Audit Logs generated

Fix all issues before stopping.

---

# Final Review

Verify

✓ Soft Delete consistent

✓ Restore consistent

✓ Query filtering consistent

✓ Audit Logging integrated

✓ Build successful

✓ Prisma validation successful

---

# Output Format

Return only

## Soft Delete Integration Summary

## Modules Reviewed

## Missing Issues Fixed

## APIs Verified

## Database Changes

## Build Result

## Prisma Validation Result

## Remaining Work

Stop.

Wait for the next instruction.