# Audit Logs Integration

## Objective

Integrate comprehensive audit logging across the entire Production-Ready NVS CMS Backend.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

This is an **integration phase**, not a standalone CRUD implementation.

The `nvs_audit_logs` table already exists.

The objective is to ensure every relevant business operation writes consistent, meaningful audit records.

Do not redesign the existing Audit Log architecture.

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

Ensure Audit Logging is fully integrated.

Audit Logs must be generated automatically.

No business module should manually create audit records.

Audit logging should be centralized using a reusable Audit Log Service.

---

# Scope

Review and integrate Audit Logging into

- Authentication
- Refresh Tokens
- Users
- Organizations
- Regions
- States
- Content Types
- Media Types
- Pages
- Media
- Role Permissions
- User Permission Overrides

Implement only missing Audit Log integrations.

Do not redesign existing modules.

---

# Existing Code Review

Inspect

- Audit Module
- Audit Service
- Common Utilities
- Existing business modules

Identify missing Audit Log calls.

Reuse existing implementation.

Never duplicate logging logic.

---

# Audit Events

Ensure logging exists for

## Authentication

- Login Success
- Login Failure
- Logout
- Refresh Token
- Account Lock

---

## Users

- Create
- Update
- Activate
- Deactivate
- Soft Delete
- Restore
- Role Change
- Organization Change

---

## Organizations

- Create
- Update
- Delete
- Restore

---

## Regions

- Create
- Update
- Delete
- Restore

---

## States

- Create
- Update
- Delete
- Restore

---

## Content Types

- Create
- Update
- Delete
- Restore

---

## Media Types

- Create
- Update
- Delete
- Restore

---

## Pages

- Create
- Update
- Publish
- Unpublish
- Delete
- Restore

---

## Media

- Upload
- Replace File
- Update Metadata
- Delete
- Restore
- Download (optional)

---

## Permissions

- Role Permission Update
- User Permission Override

---

# Audit Record

Every audit record should capture

- User ID
- Module
- Entity
- Entity ID
- Action
- Previous Values
- New Values
- IP Address
- User Agent
- Timestamp

Store Previous and New values as JSONB.

---

# APIs

Implement read-only APIs.

## Get Audit Logs

GET /api/audit-logs

Supports

- Pagination
- Search
- Date Range
- Module
- User
- Action

---

## Get Audit Log

GET /api/audit-logs/:id

Authorization

SUPER_ADMIN

Only.

No Create / Update / Delete APIs.

Audit Logs are immutable.

---

# Business Rules

Audit Logs

- cannot be updated
- cannot be deleted
- cannot be restored

Append-only.

---

# Integration

Integrate with

- Standard Response
- Authentication
- Pagination
- Search
- Filtering

---

# Constraints

Do NOT

- Modify existing business logic
- Duplicate logging
- Allow editing audit logs

---

# Verification

Run

npm run build

npx prisma validate

Verify every module generates audit logs.

---

# Final Review

Verify

✓ All modules generate Audit Logs

✓ Read APIs implemented

✓ Audit Logs immutable

✓ Build successful

✓ Prisma validation successful

---

# Output

Return

- Audit Integration Summary
- Modules Reviewed
- Missing Integrations Fixed
- APIs Implemented
- Build Result
- Prisma Validation Result

Stop.

Wait for the next instruction.