# Shared Rules for All Feature Implementations

## Objective

These rules apply to **every implementation task**.

Every feature prompt inherits these rules.

Do not ignore or override these rules unless explicitly instructed.

---

# Project Documentation

Before making any changes, always read and understand the following documents.

These documents are the **single source of truth**.

1. docs/01_PROJECT_SPECIFICATION.md
2. docs/02_IMPLEMENTATION_GUIDELINES.md
3. docs/04_DATABASE_DESIGN.md
4. docs/03_CODEX_WORKFLOW.md

If any implementation conflicts with these documents, explain the conflict before making changes.

---

# Respect Existing Project Architecture

The existing project architecture is the source of truth.

Before implementing any feature

- Inspect the existing implementation.
- Preserve established coding patterns.
- Maintain naming conventions.
- Follow the current module structure.
- Reuse existing dependency injection patterns.
- Reuse existing Prisma relationships.
- Reuse existing utilities.
- Reuse existing DTOs.
- Reuse existing services.
- Reuse existing guards.
- Reuse existing decorators.

Do not reorganize folders.

Do not rename modules.

Do not redesign the architecture.

The objective is to **extend** the existing project, not rebuild it.

---

# Non-Negotiable Design Principles

Always follow these engineering principles.

- Database-first design.
- API-first implementation.
- Backward compatibility.
- Simplicity over unnecessary abstraction.
- Prefer composition over duplication.
- Reuse existing code before creating new code.
- Keep modules cohesive.
- Keep business logic inside Services.
- Keep Controllers thin.
- Never bypass validation.
- Never bypass Guards.
- Never bypass authorization.
- Never bypass audit logging.
- Every feature must integrate with
  - Authentication
  - Authorization
  - Audit Logs
  - Soft Delete
  - Validation
  where applicable.

---

# Development Workflow

Every implementation must follow this workflow.

```
Read Documentation

↓

Inspect Existing Code

↓

Identify Similar Implementation

↓

Reuse Existing Code

↓

Implement Feature

↓

Update Prisma (if required)

↓

Create Migration (if required)

↓

Update Seed (if required)

↓

Run Build

↓

Run Prisma Validation

↓

Fix Errors

↓

Review Implementation

↓

Stop
```

Never continue to another feature.

Wait for the next instruction.

---

# Code Quality Rules

Write production-quality code.

Always

- Use TypeScript best practices.
- Use Dependency Injection.
- Use constructor injection.
- Keep Controllers thin.
- Keep Services responsible for business logic.
- Keep DTOs responsible for validation.
- Keep Prisma access inside Services.
- Keep modules focused.

Avoid

- Dead code.
- Duplicate code.
- Over-engineering.
- Large methods.
- Circular dependencies.
- Hardcoded values.

---

# Database Rules

Follow docs/04_DATABASE_DESIGN.md exactly.

Requirements

- PostgreSQL
- Prisma ORM
- Integer auto-increment IDs
- All tables prefixed with `nvs_`
- Snake_case database columns
- PascalCase Prisma models
- camelCase TypeScript properties

Never redesign the schema without explicit instruction.

Never hardcode database IDs.

Resolve relationships using business keys where appropriate.

---

# Prisma Rules

When modifying Prisma

Always

- Update schema.prisma.
- Generate migration.
- Generate Prisma Client.
- Validate schema.

Never manually edit generated Prisma Client.

Never modify old migrations.

Always create a new migration.

---

# API Rules

Follow REST conventions.

Use

```
GET

POST

PUT

PATCH

DELETE
```

Base routes

```
/api/auth

/api/users

/api/organizations

/api/regions

/api/states

/api/pages

/api/media

/api/content-types

/api/media-types

/api/permissions

/api/role-permissions

/api/user-permissions

/api/audit-logs
```

Use plural resource names.

Keep route naming consistent.

---

# Validation Rules

Use DTOs.

Use class-validator.

Validate

- Required fields.
- Email.
- Length.
- Enum values.
- IDs.
- Foreign Keys.

Trim strings.

Normalize emails.

Reject invalid input.

Never trust client data.

---

# Authentication Rules

Reuse existing Authentication implementation.

Never redesign Authentication.

Support

- JWT
- Refresh Tokens
- Password Hashing
- JwtAuthGuard
- CurrentUser Decorator

Never expose passwords.

Never log passwords.

Never store plain text passwords.

---

# Authorization Rules

Reuse existing Authorization implementation.

Never hardcode permissions.

Always resolve permissions through

```
Role Permissions

↓

User Permission Overrides

↓

Effective Permissions
```

SUPER_ADMIN bypasses organization ownership.

Other users may access only their own organization's data unless explicitly allowed.

---

# Audit Logging Rules

Every significant business operation must generate an Audit Log.

Examples

- Login
- Logout
- Create
- Update
- Delete
- Restore
- Publish
- Upload
- Permission Change

Audit Logs are immutable.

Never allow editing or deleting Audit Logs.

---

# Soft Delete Rules

Use Soft Delete where applicable.

Never hard delete business records.

Implement

```
is_deleted

deleted_at

deleted_by
```

Normal queries must exclude deleted records.

Support Restore where applicable.

---

# File Upload Rules

Use Multer.

Store files locally.

Directory

```
uploads/
```

Store only metadata in PostgreSQL.

Generate UUID filenames.

Validate

- Extension
- MIME Type
- File Size

Never trust uploaded filenames.

---

# Search / Pagination / Sorting

Every list API should support

```
page

limit

search

sort

order
```

Where applicable, also support

```
isDeleted

organizationId

status

contentTypeId

mediaTypeId
```

Defaults

```
page=1

limit=20

order=desc
```

Maximum

```
limit=100
```

---

# Standard API Response

Use a consistent response format.

Success

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}
```

Use NestJS exceptions.

Return appropriate HTTP status codes.

---

# Build Verification

After every implementation

Run

```bash
npm run build

npx prisma validate
```

If schema changed

Run

```bash
npx prisma migrate dev
```

If seed changed

Run

```bash
npx prisma db seed
```

Fix every issue before stopping.

---

# Final Self Review

Before completing the feature verify

✓ Business requirements satisfied

✓ Architecture preserved

✓ Existing code reused

✓ No duplicate logic

✓ DTO validation complete

✓ Authentication integrated

✓ Authorization integrated

✓ Audit Logging integrated

✓ Soft Delete integrated

✓ REST APIs consistent

✓ Build successful

✓ Prisma validation successful

If any issue exists

Fix it before stopping.

---

# Output Format

Always return

## Summary

## Files Created

## Files Modified

## Database Changes

## APIs Implemented

## Build Result

## Prisma Validation Result

## Remaining Work

Stop.

Wait for the next instruction.

Never continue to another feature unless explicitly instructed.

---

# Implementation Philosophy

Your priority is to deliver a production-ready implementation that matches the documented requirements.

Do not teach.

Do not redesign.

Do not over-engineer.

Do not introduce unnecessary abstractions.

Implement only the requested feature.

Keep the implementation simple, maintainable, consistent, and production-ready.

The objective is to complete the project successfully, not to demonstrate every NestJS capability.

# Completion Rules

A feature is NOT complete until ALL of the following are true:

- The implementation matches the documented requirements.
- Existing architecture has been preserved.
- No unrelated files have been modified.
- No TODOs or placeholders remain.
- The project builds successfully.
- Prisma validation succeeds.
- Any required migrations have been created.
- Any required seed updates have been completed.
- All APIs for the feature are implemented.
- The implementation summary accurately reflects the work completed.

Never claim a feature is complete if any of the above conditions are not met.