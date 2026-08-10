# Feature Implementation Prompt Template

## Objective

Implement the requested feature for the **Production-Ready NVS CMS Backend**.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

Your objective is to implement the requested feature while preserving the existing architecture.

Do **not** redesign the project.

Do **not** refactor unrelated modules.

Do **not** over-engineer the solution.

---

# Project Documentation

Before making any changes, read and understand the following project documentation.

These documents are the **single source of truth**.

1. docs/01_PROJECT_SPECIFICATION.md
2. docs/02_IMPLEMENTATION_GUIDELINES.md
3. docs/04_DATABASE_DESIGN.md
4. docs/03_CODEX_WORKFLOW.md

If the implementation conflicts with the documentation, explain the conflict before making any changes.

---

# Goal

> Replace this section with the feature-specific objective.

Example

Implement the User Management module.

---

# Scope

Implement **only** the following functionality.

Replace with feature-specific scope.

Example

- Create
- Update
- Delete
- Restore
- Get By ID
- Get All

Do not implement unrelated functionality.

---

# Existing Code Review

Before writing any code

1. Inspect the existing implementation.
2. Identify similar modules.
3. Reuse existing architecture.
4. Reuse existing DTOs.
5. Reuse existing Services.
6. Reuse existing Guards.
7. Reuse existing Decorators.
8. Reuse existing Utilities.
9. Reuse existing Prisma Models.

Do not duplicate existing code.

---

# Database

Follow

docs/04_DATABASE_DESIGN.md

Only update Prisma Schema if required.

If schema changes are required

- Update Prisma Schema.
- Generate Migration.
- Update Seed Script if required.

Never introduce unnecessary database changes.

---

# APIs

Replace this section with feature-specific APIs.

Example

POST

GET

PUT

DELETE

PATCH

Only implement APIs required for this feature.

---

# Integrations

Integrate with existing infrastructure where applicable.

- Authentication
- Authorization
- Role Permissions
- User Permission Overrides
- Audit Logs
- Soft Delete
- DTO Validation
- Standard API Response
- Pagination
- Filtering
- Sorting

Do not bypass existing architecture.

---

# Business Rules

Implement all business rules defined in

docs/01_PROJECT_SPECIFICATION.md

Do not invent additional business rules.

If clarification is required, explain the assumption before implementation.

---

# Constraints

Do NOT

- Redesign architecture.
- Rename modules.
- Rename folders.
- Rename APIs.
- Refactor unrelated modules.
- Introduce new frameworks.
- Introduce unnecessary abstractions.
- Modify existing working functionality without justification.

Only implement what is required.

---

# Deliverables

Provide

## Files Created

List every new file.

---

## Files Modified

List every modified file.

---

## Database Changes

List

- Tables
- Columns
- Constraints
- Indexes
- Enums
- Relationships

---

## API Changes

List

- New APIs
- Updated APIs

---

## Assumptions

List every implementation assumption.

---

# Verification

Run

```bash
npm run build

npx prisma validate
```

If any errors occur

Fix them before stopping.

---

# Final Review

Before considering the feature complete

Verify implementation against

- docs/01_PROJECT_SPECIFICATION.md
- docs/02_IMPLEMENTATION_GUIDELINES.md
- docs/04_DATABASE_DESIGN.md
- docs/03_CODEX_WORKFLOW.md

Confirm

- Requirements satisfied.
- Architecture preserved.
- Database design respected.
- Authentication integrated.
- Authorization integrated.
- Role Permissions implemented.
- User Permission Overrides implemented.
- Audit Logs integrated.
- Soft Delete implemented.
- DTO Validation complete.
- Standard API responses implemented.
- Build successful.
- Prisma validation successful.

---

# Output Format

Return only

## Feature Summary

## Files Created

## Files Modified

## Database Changes

## API Changes

## Build Result

## Prisma Validation Result

## Remaining Work

Stop.

Wait for the next instruction.

Never continue to another feature unless explicitly instructed.