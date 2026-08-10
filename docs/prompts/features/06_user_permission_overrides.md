# User Permission Overrides Implementation

## Objective

Implement the **User Permission Overrides** module for the Production-Ready NVS CMS Backend.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

This feature allows SUPER_ADMIN to override the default Role Permissions for individual users.

Permission definitions already exist.

Role Permissions already exist.

This feature must only implement User Permission Overrides.

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

Implement User Permission Overrides.

Role Permissions define the default authorization.

User Permission Overrides allow SUPER_ADMIN to grant or deny specific permissions for an individual user.

These overrides always take precedence over Role Permissions.

Do not implement Authorization Guards.

Do not evaluate permissions during request processing.

That is implemented later.

---

# Scope

Implement only

- User Permission Override Module
- User Permission Override Service
- User Permission Override Controller
- DTOs
- Prisma Integration

Implement

- Get User Permissions
- Replace User Permissions
- Remove User Permission Overrides

Do NOT implement

- Permission Evaluation
- Authorization Guards
- Role Management
- Permission CRUD

---

# Existing Code Review

Before implementation

Inspect

- Users Module
- Permission Module
- Role Permission Module
- Prisma Schema
- Existing DTOs
- Existing Controllers
- Existing Services

Reuse existing implementation.

Never duplicate code.

---

# Database

Use the existing table

```
nvs_user_permissions
```

Structure

```
id

user_id

permission_id

allowed

created_at

created_by
```

Composite Unique

```
user_id

+

permission_id
```

Do not redesign the schema.

---

# APIs

Implement

---

## Get User Permission Overrides

```
GET /api/user-permissions/:userId
```

Authentication

Required

Authorization

SUPER_ADMIN

Returns all permission overrides assigned to the specified user.

---

## Replace User Permission Overrides

```
PUT /api/user-permissions/:userId
```

Authentication

Required

Authorization

SUPER_ADMIN

Example Request

```json
{
    "permissions": [
        {
            "permissionId": 5,
            "allowed": true
        },
        {
            "permissionId": 8,
            "allowed": false
        }
    ]
}
```

Behavior

Replace all existing overrides for the user.

Execute as a single Prisma transaction.

---

## Remove User Permission Overrides

```
DELETE /api/user-permissions/:userId
```

Authentication

Required

Authorization

SUPER_ADMIN

Behavior

Remove all overrides for the specified user.

The user immediately falls back to Role Permissions.

---

# Business Rules

Only SUPER_ADMIN may manage User Permission Overrides.

Users cannot modify their own permissions.

Role Permissions remain unchanged.

Permission definitions remain immutable.

User Permission Overrides always take precedence over Role Permissions.

Deleting overrides restores the user's default Role Permissions.

---

# Transaction Strategy

Every update must execute inside a Prisma transaction.

Sequence

```
Validate User

↓

Validate Permission IDs

↓

Delete Existing Overrides

↓

Insert New Overrides

↓

Create Audit Log

↓

Commit
```

Rollback on any failure.

---

# Audit Logging

Generate Audit Logs for

- User Permission Assignment
- User Permission Update
- User Permission Removal

Record

- User
- Previous Overrides
- New Overrides
- Changed By
- Timestamp

---

# Integrations

Integrate with

- Authentication
- Permission Module
- Role Permission Module
- Users Module
- Audit Logs
- Prisma
- DTO Validation
- Standard API Response

Do not implement Authorization Guards.

---

# Constraints

Do NOT

- Modify Permission Definitions.
- Modify Role Permissions.
- Implement Authorization.
- Implement Permission Evaluation.
- Implement Guard Logic.

Implement only User Permission Overrides.

---

# Deliverables

Provide

## Files Created

Example

```
src/user-permissions/

user-permissions.module.ts

user-permissions.controller.ts

user-permissions.service.ts

dto/
```

---

## Files Modified

List every modified file.

---

## APIs Implemented

```
GET /api/user-permissions/:userId

PUT /api/user-permissions/:userId

DELETE /api/user-permissions/:userId
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

## Permission Override Summary

Summarize

- Override Strategy
- Transaction Strategy
- Audit Integration

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

✓ User Permission Override Module implemented

✓ Read API implemented

✓ Replace API implemented

✓ Delete API implemented

✓ Prisma Transaction implemented

✓ Audit Logging integrated

✓ Authentication enforced

✓ SUPER_ADMIN authorization enforced

✓ Build successful

✓ Prisma validation successful

---

# Output Format

Return only

## User Permission Override Summary

## Files Created

## Files Modified

## APIs Implemented

## Transaction Summary

## Database Changes

## Build Result

## Prisma Validation Result

## Remaining Work

Stop.

Wait for the next instruction.

Do not implement Authorization Guards or Permission Evaluation.