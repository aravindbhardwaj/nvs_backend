# Organization Management Implementation

## Objective

Implement the **Organization Management** module for the Production-Ready NVS CMS Backend.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

This feature implements complete Organization Management while preserving the existing project architecture.

Organizations represent the complete NVS hierarchy and are the ownership boundary for Users, Pages, and Media.

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

Implement the complete Organization Management module.

Organizations define the ownership hierarchy for the CMS.

Every User belongs to exactly one Organization.

Every Page belongs to exactly one Organization.

Every Media item belongs to exactly one Organization.

---

# Scope

Implement

- Organization Module
- Organization Controller
- Organization Service
- DTOs
- Validation
- Pagination
- Filtering
- Sorting
- Soft Delete
- Restore
- Audit Logging

Implement only Organization Management.

---

# Existing Code Review

Before implementation

Inspect

- Region Module
- State Module
- Existing Master Modules
- Common Utilities
- Common DTOs
- Audit Logging
- Soft Delete
- Exception Filters

Reuse existing implementation.

Do not duplicate code.

---

# Database

Use the existing table

```
nvs_organizations
```

Structure

```
id

organization_name

organization_code

organization_type

parent_organization_id

region_id

state_id

address

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

# Organization Types

Supported values

```
HEADQUARTER

NLI

REGIONAL_OFFICE

JNV
```

Use the Prisma Enum.

Do not create an Organization Type master table.

---

# Organization Hierarchy

Implement the following hierarchy.

```
SUPER_ADMIN

├── HEADQUARTER

├── NLI

└── REGIONAL_OFFICE
      └── JNV
```

---

# Hierarchy Rules

## Headquarters

- No parent organization.
- Only one Headquarters organization may exist.

---

## NLI

- No parent organization.
- Multiple NLIs are allowed.

---

## Regional Office

Parent Organization

```
HEADQUARTER
```

Must reference

- One Region

Must not reference

- State

---

## JNV

Parent Organization

```
REGIONAL_OFFICE
```

Must reference

- One State

Must inherit Region from its Regional Office.

---

# APIs

Implement

---

## Create Organization

```
POST /api/organizations
```

Authentication

Required

Authorization

SUPER_ADMIN

---

## Get Organizations

```
GET /api/organizations
```

Support

- Pagination
- Search
- Sorting
- Filtering

---

## Get Organization By ID

```
GET /api/organizations/:id
```

---

## Update Organization

```
PUT /api/organizations/:id
```

---

## Soft Delete Organization

```
DELETE /api/organizations/:id
```

---

## Restore Organization

```
PATCH /api/organizations/:id/restore
```

---

# Validation

Validate

- organization_name required
- organization_code required
- organization_name unique
- organization_code unique
- organization_type required
- Parent hierarchy valid
- Region exists
- State exists (where applicable)

Trim whitespace.

Prevent duplicates.

Use DTO validation.

---

# Business Rules

Only SUPER_ADMIN may manage Organizations.

Organizations cannot violate the hierarchy.

Examples

Invalid

```
JNV

↓

HEADQUARTER
```

Invalid

```
REGIONAL_OFFICE

↓

NLI
```

Valid

```
HEADQUARTER

↓

REGIONAL_OFFICE

↓

JNV
```

Valid

```
NLI
```

---

# Delete Rules

Prevent deletion when Organization contains

- Users
- Child Organizations
- Pages
- Media

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

?organizationType=

?regionId=

?stateId=

?parentOrganizationId=

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

Never hard delete Organizations.

---

# Integration

Integrate with

- Authentication
- DTO Validation
- Audit Logs
- Soft Delete
- Region Module
- State Module
- Standard API Response
- Pagination
- Filtering
- Sorting

---

# Constraints

Do NOT

- Implement User Management
- Implement Pages
- Implement Media
- Modify Region Module
- Modify State Module
- Redesign the hierarchy
- Introduce additional Organization Types

Implement only Organization Management.

---

# Deliverables

Provide

## Files Created

Example

```
src/organizations/

organizations.module.ts

organizations.controller.ts

organizations.service.ts

dto/
```

---

## Files Modified

List every modified file.

---

## APIs Implemented

```
POST /api/organizations

GET /api/organizations

GET /api/organizations/:id

PUT /api/organizations/:id

DELETE /api/organizations/:id

PATCH /api/organizations/:id/restore
```

---

## Database Changes

List

- Schema Changes
- Migration Changes

If none

State

```
No schema changes required.
```

---

## Hierarchy Validation

Summarize

- Parent validation
- Region validation
- State validation
- Delete protection

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

✓ Hierarchy validation implemented

✓ Parent validation implemented

✓ Region validation implemented

✓ State validation implemented

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

## Organization Module Summary

## Files Created

## Files Modified

## APIs Implemented

## Hierarchy Rules Implemented

## Database Changes

## Build Result

## Prisma Validation Result

## Remaining Work

Stop.

Wait for the next instruction.

Do not implement User Management.