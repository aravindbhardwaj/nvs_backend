# User Management Implementation

## Objective

Implement the **User Management** module for the Production-Ready NVS CMS Backend.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

This feature implements complete User Management while preserving the existing project architecture.

Users belong to exactly one Organization.

Users authenticate using the Authentication module already implemented.

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

Implement the complete User Management module.

Users represent authenticated users of the CMS.

Every user belongs to exactly one Organization.

Every user has exactly one Role.

Role Permissions and User Permission Overrides already exist.

Use the existing implementation.

Do not redesign authentication.

---

# Scope

Implement

- User Module
- User Controller
- User Service
- DTOs
- Password Hashing
- Validation
- Pagination
- Filtering
- Sorting
- Activate User
- Deactivate User
- Soft Delete
- Restore
- Assign Organization
- Change Role
- Audit Logging

Implement only User Management.

---

# Existing Code Review

Before implementation

Inspect

- Authentication Module
- Organization Module
- Permission Modules
- Existing DTOs
- Existing Utilities
- Existing Guards
- Existing Prisma Models

Reuse existing implementation.

Never duplicate code.

---

# Database

Use

```
nvs_users
```

Structure

```
id

name

email

password

mobile

address

role

organization_id

status

failed_login_attempts

locked_until

last_login_at

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

## Create User

```
POST /api/users
```

Authentication

Required

Authorization

SUPER_ADMIN

---

## Get Users

```
GET /api/users
```

Support

- Pagination
- Search
- Sorting
- Filtering

---

## Get User By ID

```
GET /api/users/:id
```

---

## Update User

```
PUT /api/users/:id
```

---

## Activate User

```
PATCH /api/users/:id/activate
```

---

## Deactivate User

```
PATCH /api/users/:id/deactivate
```

---

## Soft Delete User

```
DELETE /api/users/:id
```

---

## Restore User

```
PATCH /api/users/:id/restore
```

---

# Validation

Validate

- Name required
- Email required
- Email unique
- Valid email format
- Password required during creation
- Password minimum length
- Organization exists
- Role valid
- Mobile optional
- Address optional

Trim whitespace.

Normalize email to lowercase.

Hash passwords before storage.

Never return passwords.

---

# Business Rules

Only SUPER_ADMIN may manage users.

Every user

- belongs to exactly one Organization.
- has exactly one Role.

Email must remain unique.

Passwords must be hashed.

Inactive users cannot log in.

Soft Deleted users cannot log in.

Locked users cannot log in.

Changing Role does not modify Role Permissions.

Changing Organization does not modify User Permission Overrides.

---

# Password Rules

Passwords

- Hash using bcrypt.
- Never return.
- Never log.
- Never store in plain text.

Changing password is outside the scope of this feature.

---

# Search / Filter / Sort

Support

```
?search=

?page=

?limit=

?sort=

?order=

?organizationId=

?role=

?status=

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
- Activate
- Deactivate
- Soft Delete
- Restore
- Role Change
- Organization Change

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

Never hard delete users.

---

# Integration

Integrate with

- Authentication
- Organizations
- Role Permissions
- User Permission Overrides
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

- Implement Password Reset
- Implement Refresh Tokens
- Implement Authorization Guards
- Modify Authentication Module
- Modify Organization Module
- Modify Permission Definitions

Implement only User Management.

---

# Deliverables

Provide

## Files Created

Example

```
src/users/

users.module.ts

users.controller.ts

users.service.ts

dto/
```

---

## Files Modified

List every modified file.

---

## APIs Implemented

```
POST /api/users

GET /api/users

GET /api/users/:id

PUT /api/users/:id

PATCH /api/users/:id/activate

PATCH /api/users/:id/deactivate

DELETE /api/users/:id

PATCH /api/users/:id/restore
```

---

## Database Changes

List

- Schema Changes
- Migration Changes

If none

```
No schema changes required.
```

---

## User Management Summary

Summarize

- Password Hashing
- Organization Assignment
- Role Assignment
- Account Status Management
- Soft Delete Strategy

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

✓ Password hashing implemented

✓ Email uniqueness enforced

✓ Organization validation implemented

✓ Role validation implemented

✓ Pagination implemented

✓ Filtering implemented

✓ Sorting implemented

✓ Activate implemented

✓ Deactivate implemented

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

## User Module Summary

## Files Created

## Files Modified

## APIs Implemented

## User Management Features

## Database Changes

## Build Result

## Prisma Validation Result

## Remaining Work

Stop.

Wait for the next instruction.

Do not implement Content Types.