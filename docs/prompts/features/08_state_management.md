# State Management Implementation

## Objective

Implement the **State Management** module for the Production-Ready NVS CMS Backend.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

This feature implements complete CRUD operations for States.

States are master data.

JNV organizations belong to one State.

Organizations depend on this module.

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

Implement the complete State Management module.

This module manages State master data.

The implementation must be production-ready.

---

# Scope

Implement

- State Module
- State Controller
- State Service
- DTOs
- Validation
- Pagination
- Filtering
- Sorting
- Soft Delete
- Restore
- Audit Logging

Implement only State Management.

---

# Existing Code Review

Before implementation

Inspect

- Region Module
- Existing master modules
- Common utilities
- DTOs
- Exception handling
- Audit logging
- Soft Delete implementation

Reuse existing implementation.

Do not duplicate code.

---

# Database

Use the existing table

```
nvs_states
```

Structure

```
id

state_name

state_code

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

## Create State

```
POST /api/states
```

Authentication

Required

Authorization

SUPER_ADMIN

---

## Get States

```
GET /api/states
```

Support

- Pagination
- Search
- Sorting

---

## Get State By ID

```
GET /api/states/:id
```

---

## Update State

```
PUT /api/states/:id
```

---

## Soft Delete State

```
DELETE /api/states/:id
```

---

## Restore State

```
PATCH /api/states/:id/restore
```

---

# Validation

Validate

- state_name required
- state_code required
- state_name unique
- state_code unique
- Trim whitespace
- Prevent duplicates

Use DTO validation.

---

# Business Rules

Only SUPER_ADMIN can manage States.

A State cannot be deleted if referenced by any Organization.

Soft Deleted States

- cannot be updated
- cannot be deleted again
- are excluded from normal queries

Return meaningful validation errors.

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
sort=createdAt
order=desc
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

Never hard delete records.

---

# Integration

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
- Modify Regions
- Implement User Management
- Redesign database

Implement only State Management.

---

# Deliverables

Provide

## Files Created

## Files Modified

## APIs Implemented

## Database Changes

## Build Result

## Prisma Validation Result

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

- State Module Summary
- Files Created
- Files Modified
- APIs Implemented
- Database Changes
- Build Result
- Prisma Validation Result
- Remaining Work

Stop.

Wait for the next instruction.

Do not implement Organization Management.