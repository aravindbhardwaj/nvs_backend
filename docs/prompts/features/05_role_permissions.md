# Role Permissions Implementation

## Objective

Implement the **Role Permissions** module for the Production-Ready NVS CMS Backend.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

This feature establishes the application's **default authorization model** by assigning permissions to Roles.

Permission definitions already exist.

Do not modify Permission definitions.

Do not implement User Permission Overrides.

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

Implement Role Permission management.

The application has fixed Roles implemented as Prisma Enums.

Each Role receives a default set of permissions.

These permissions become the authorization baseline.

User-specific overrides will be implemented later.

---

# Scope

Implement only

- Role Permission Module
- Role Permission Service
- Role Permission Controller
- DTOs
- Seed Integration

Implement

- View Role Permissions
- Replace Role Permissions

Do NOT implement

- User Permission Overrides
- Permission CRUD
- Authorization Guards
- Permission Evaluation Logic

---

# Existing Code Review

Before implementation

Inspect

- Authentication Module
- Permission Module
- Prisma Schema
- Existing Services
- Existing DTOs
- Existing Controllers

Reuse existing implementation.

Never duplicate code.

---

# Database

Use the existing table

```
nvs_role_permissions
```

Do not redesign the schema.

Structure

```
id

role

permission_id

created_at
```

Composite Unique

```
role

+

permission_id
```

---

# APIs

Implement

---

## Get Role Permissions

```
GET /api/role-permissions/:role
```

Authentication

Required

Authorization

SUPER_ADMIN

Returns every permission assigned to the selected role.

---

## Replace Role Permissions

```
PUT /api/role-permissions/:role
```

Authentication

Required

Authorization

SUPER_ADMIN

Body

```json
{
  "permissionIds": [1,2,3,4]
}
```

Behavior

Replace all permissions assigned to the specified Role.

The operation should execute within a Prisma transaction.

---

# Business Rules

Roles are fixed.

Supported Roles

```
SUPER_ADMIN

HEADQUARTER

NLI

REGIONAL

JNV
```

Role names cannot be changed.

Roles cannot be created.

Roles cannot be deleted.

Role Permissions may be replaced only by SUPER_ADMIN.

---

# Default Permission Matrix

Implement default permissions according to the project specification.

Example

SUPER_ADMIN

```
All Permissions
```

HEADQUARTER

```
PAGE_VIEW

PAGE_CREATE

PAGE_UPDATE

MEDIA_UPLOAD

MEDIA_VIEW
```

NLI

```
PAGE_VIEW

PAGE_CREATE

PAGE_UPDATE

MEDIA_UPLOAD

MEDIA_VIEW
```

REGIONAL

```
PAGE_VIEW

PAGE_CREATE

PAGE_UPDATE

MEDIA_UPLOAD

MEDIA_VIEW
```

JNV

```
PAGE_VIEW

PAGE_CREATE

PAGE_UPDATE

MEDIA_UPLOAD

MEDIA_VIEW
```

Do not hardcode permission IDs.

Resolve permissions using

```
permission_key
```

---

# Transaction Strategy

Updating Role Permissions must execute as a single Prisma transaction.

Sequence

```
Validate Role

↓

Validate Permissions

↓

Delete Existing Role Permissions

↓

Insert New Role Permissions

↓

Create Audit Log

↓

Commit
```

Rollback if any operation fails.

---

# Audit Logging

Generate Audit Logs for

- Role Permission Update

Record

- Role
- Previous Permissions
- New Permissions
- User
- Timestamp

---

# Integrations

Integrate with

- Authentication
- Permission Module
- Audit Logs
- Prisma
- DTO Validation
- Standard API Response

Do not integrate User Permission Overrides.

---

# Constraints

Do NOT

- Modify Permission definitions.
- Implement Authorization Guards.
- Implement Permission Evaluation.
- Implement User Permission Overrides.

Implement only Role Permission management.

---

# Deliverables

Provide

## Files Created

Example

```
src/role-permissions/

role-permissions.module.ts

role-permissions.controller.ts

role-permissions.service.ts

dto/
```

---

## Files Modified

List every modified file.

---

## APIs Implemented

```
GET /api/role-permissions/:role

PUT /api/role-permissions/:role
```

---

## Database Changes

List

- Schema Changes
- Seed Changes

If none

```
No schema changes required.
```

---

## Authorization Matrix

Summarize the default permissions assigned to each Role.

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

✓ Role Permission Module implemented

✓ Read API implemented

✓ Update API implemented

✓ Prisma Transaction implemented

✓ Audit Logging integrated

✓ Authentication enforced

✓ SUPER_ADMIN authorization enforced

✓ Permission lookup by permission_key

✓ Build successful

✓ Prisma validation successful

---

# Output Format

Return only

## Role Permission Summary

## Files Created

## Files Modified

## APIs Implemented

## Default Permission Matrix

## Database Changes

## Build Result

## Prisma Validation Result

## Remaining Work

Stop.

Wait for the next instruction.

Do not implement User Permission Overrides.