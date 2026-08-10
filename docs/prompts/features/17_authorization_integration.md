# Authorization Integration & Security Verification

## Objective

Perform the complete Authorization integration for the Production-Ready NVS CMS Backend.

Your role is to act as a Senior Solution Architect, Senior NestJS Developer, Senior Prisma Developer, and Production Code Implementation Agent.

This is an integration phase.

Authentication has already been implemented.

Permissions already exist.

Role Permissions already exist.

User Permission Overrides already exist.

Your objective is to integrate all of them into a single authorization pipeline.

Do not redesign the existing architecture.

---

# Project Documentation

Before making any changes, read

1. docs/01_PROJECT_SPECIFICATION.md
2. docs/02_IMPLEMENTATION_GUIDELINES.md
3. docs/04_DATABASE_DESIGN.md
4. docs/03_CODEX_WORKFLOW.md

Treat these documents as the single source of truth.

---

# Goal

Implement complete authorization.

Every protected endpoint must verify

- Authentication
- Role
- Effective Permissions
- Organization Ownership

Authorization must be centralized.

Business modules must not contain duplicated authorization logic.

---

# Scope

Review every controller.

Protect every secured endpoint.

Implement or complete

- JwtAuthGuard
- RolesGuard (if required)
- PermissionsGuard
- CurrentUser Decorator
- Permission Decorator
- Organization Ownership Validation
- Effective Permission Resolver

Do not redesign Authentication.

Do not redesign business modules.

Only integrate Authorization.

---

# Existing Code Review

Inspect

- Authentication
- Guards
- Decorators
- Permission Module
- Role Permissions
- User Permission Overrides
- Controllers
- Services

Reuse existing implementation.

Never duplicate authorization logic.

---

# Authorization Flow

Every protected request must execute

```
Incoming Request

↓

JwtAuthGuard

↓

Validate Access Token

↓

Load User

↓

Verify User Active

↓

Verify User Not Deleted

↓

Verify Account Not Locked

↓

Load Role

↓

Load Role Permissions

↓

Load User Permission Overrides

↓

Calculate Effective Permissions

↓

Verify Required Permission

↓

Verify Organization Ownership

↓

Controller
```

Never bypass this flow.

---

# Effective Permission Resolution

Permission evaluation order

```
Role Permissions

↓

Apply User Permission Overrides

↓

Final Effective Permissions
```

Rules

If a User Permission Override exists

It overrides the Role Permission.

Example

Role

```
PAGE_UPDATE = Allowed
```

User Override

```
PAGE_UPDATE = Denied
```

Final

```
Denied
```

---

# Organization Ownership

For organization-owned resources

Users may only access

- Users
- Pages
- Media

belonging to their own Organization.

SUPER_ADMIN bypasses ownership validation.

Never expose another organization's data.

---

# Controller Integration

Review every controller.

Verify guards.

Authentication required for

- Users
- Organizations
- Regions
- States
- Content Types
- Media Types
- Pages
- Media
- Permissions
- Role Permissions
- User Permission Overrides
- Audit Logs

Public routes

```
POST /api/auth/login

POST /api/auth/refresh
```

Everything else must be protected.

---

# Permission Decorator

Implement a reusable decorator.

Example

```
@RequirePermission('USER_CREATE')
```

Avoid hardcoded permission checks inside controllers.

---

# Permission Guard

Implement

PermissionsGuard

Responsibilities

- Read decorator metadata
- Resolve Effective Permissions
- Grant / Deny access

Return

403 Forbidden

when authorization fails.

---

# Organization Validation

Implement reusable ownership validation.

Avoid duplicating

```
organizationId == currentUser.organizationId
```

inside services.

Create reusable authorization utilities if required.

---

# API Review

Review every endpoint.

Verify

Authentication

Authorization

Ownership

Permission

Soft Delete

Audit Logging

---

# Security Verification

Ensure

- JWT required
- Refresh Token flow unchanged
- Passwords never exposed
- Soft Deleted users denied
- Locked users denied
- Inactive users denied
- Cross Organization access denied
- Missing Permission denied

---

# Audit Logging

Verify authorization failures generate appropriate audit events where applicable.

Examples

- Unauthorized access
- Forbidden operation

Avoid excessive logging for repetitive failures.

---

# Constraints

Do NOT

- Modify Authentication
- Modify Database Schema
- Modify Business Logic
- Hardcode Permissions
- Duplicate Authorization Logic

Only integrate Authorization.

---

# Deliverables

Provide

## Controllers Reviewed

List every controller.

---

## Guards Integrated

List

- JwtAuthGuard
- PermissionsGuard
- RolesGuard (if used)

---

## Decorators

List implemented decorators.

---

## Authorization Rules

Summarize

- Effective Permission Resolution
- Organization Ownership
- Permission Evaluation

---

## Database Changes

If none

State

```
No database schema changes required.
```

---

# Verification

Run

```bash
npm run build

npx prisma validate
```

Verify

- Protected endpoints require JWT
- Permissions enforced
- Organization ownership enforced
- User Overrides respected
- SUPER_ADMIN bypass works
- Authentication unaffected

Fix every issue before stopping.

---

# Final Review

Verify

✓ Every endpoint protected

✓ Effective Permission Resolution implemented

✓ Organization Ownership enforced

✓ Authorization centralized

✓ Authentication unchanged

✓ Build successful

✓ Prisma validation successful

---

# Output Format

Return only

## Authorization Integration Summary

## Controllers Reviewed

## Guards Integrated

## Decorators Implemented

## Authorization Rules

## Build Result

## Prisma Validation Result

## Remaining Work

Stop.

Wait for the next instruction.

Do not implement Seed Script.