# Production-Ready NVS CMS Backend
## Implementation Guidelines

Version: 1.0

---

# 1. Purpose

This document defines the implementation standards, architectural decisions, coding conventions, engineering principles, and quality standards for the NVS CMS Backend.

It complements:

- docs/01_PROJECT_SPECIFICATION.md
- docs/03_CODEX_WORKFLOW.md
- docs/04_DATABASE_DESIGN.md

This document intentionally avoids repeating business requirements.

Its purpose is to ensure every implementation follows a consistent, production-ready engineering approach.

---

# 2. Architecture Philosophy

The application must follow a **Modular Monolithic Architecture**.

The architecture should remain

- Simple
- Maintainable
- Secure
- Modular
- Production Ready

The project should avoid unnecessary enterprise complexity while remaining scalable for future enhancements.

---

# 3. Technology Stack

The implementation shall use only the approved technologies.

| Layer | Technology |
|--------|------------|
| Runtime | Node.js |
| Framework | NestJS |
| Language | TypeScript |
| ORM | Prisma ORM |
| Database | PostgreSQL |
| Authentication | JWT |
| Authorization | Roles + Permissions |
| File Upload | Multer |
| Validation | class-validator |
| Configuration | dotenv |

No additional frameworks should be introduced without approval.

---

# 4. Architecture Constraints

The project must remain a modular monolith.

Do not convert the application into

- Microservices
- Event-driven architecture
- CQRS
- Event Sourcing
- GraphQL
- Domain Driven Design
- Hexagonal Architecture
- Clean Architecture with unnecessary abstraction

The architecture should remain simple while maintaining good engineering practices.

---

# 5. Non-Negotiable Design Principles

These principles are mandatory throughout the project.

They override implementation preferences.

---

## 5.1 Database-First Design

The database is the foundation of the application.

Before implementing any module

- Design entities.
- Define relationships.
- Define foreign keys.
- Define constraints.
- Define indexes.
- Define Prisma models.

Business logic should follow the database design.

---

## 5.2 API-First Development

Implement REST APIs before considering frontend integration.

Every endpoint must

- Follow REST principles.
- Return consistent responses.
- Use correct HTTP methods.
- Validate requests.
- Authorize access.

---

## 5.3 Backward Compatibility

Never introduce breaking changes unless explicitly instructed.

Whenever possible

- Extend existing implementations.
- Preserve API contracts.
- Preserve DTOs.
- Preserve service interfaces.

---

## 5.4 Composition Over Duplication

Always reuse existing implementations.

Prefer

- Shared Services
- Common Utilities
- Existing Guards
- Existing Decorators
- Existing DTOs

Never duplicate business logic.

---

## 5.5 Cross-Cutting Concerns

Every transactional module must integrate with

- Authentication
- Authorization
- Permission Validation
- DTO Validation
- Exception Handling
- Audit Logging
- Soft Delete

These concerns must be implemented consistently.

---

## 5.6 Validation First

Never trust client input.

Every request must pass through

- ValidationPipe
- DTO Validation
- Authentication Guards
- Authorization Guards
- Permission Checks

Validation should occur before business logic execution.

---

## 5.7 Consistent API Responses

All endpoints should return a common response structure.

Successful response

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

Error response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "",
  "errors": []
}
```

---

## 5.8 Production Ready by Default

Every implementation should be considered production-ready from the first commit.

Avoid

- Temporary code
- Placeholder logic
- Demo implementations
- Mock behavior

---

## 5.9 Simplicity Over Complexity

When multiple implementations are possible

Always choose the solution that is

- Easiest to understand
- Easiest to maintain
- Production ready
- Consistent with the project

---

# 6. Respect Existing Project Architecture

The existing project architecture is the single source of truth.

Before implementing any feature

- Inspect the existing implementation.
- Preserve existing folder structure.
- Preserve module boundaries.
- Preserve naming conventions.
- Preserve dependency injection patterns.
- Preserve Prisma relationships.
- Reuse DTOs.
- Reuse Services.
- Reuse Guards.
- Reuse Utilities.
- Reuse Decorators.

Never

- Rename modules.
- Reorganize folders.
- Replace working implementations.
- Introduce unnecessary abstractions.
- Refactor unrelated functionality.

The objective is to extend the existing project, not redesign it.

---

# 7. Scope Control

Every implementation request should modify only the code required to complete that feature.

Never

- Rewrite unrelated modules.
- Refactor working functionality.
- Introduce architectural changes.
- Change coding standards.
- Rename existing APIs.
- Change existing response structures.

If a change affects multiple modules, document the dependency before implementation.

---

# 8. Project Structure

The project shall follow a modular structure.

```
src/

auth/

users/

organizations/

pages/

media/

permissions/

audit-logs/

masters/

common/

prisma/

resources/

main.ts

app.module.ts
```

Each module should remain self-contained.

Avoid deeply nested folder structures.

---

# 9. Dependency Injection

Follow standard NestJS dependency injection.

- Constructor injection only.
- Avoid manual instantiation.
- Register providers correctly.
- Reuse injectable services.

Do not introduce service locators or static service access.

---

# 10. Separation of Responsibilities

Controllers

- Handle HTTP requests.
- Validate input.
- Delegate business logic.

Services

- Implement business logic.
- Coordinate repositories and utilities.

Prisma

- Handle database access only.

Guards

- Authentication
- Authorization

Decorators

- User extraction
- Metadata

Utilities

- Shared helper functions only.

Never place business logic in controllers.

---

# 11. Module Design Principles

Every module should

- Have a single responsibility.
- Expose only required services.
- Hide implementation details.
- Follow existing project conventions.
- Integrate with authentication and authorization.

Avoid circular dependencies.

---

# 12. Configuration Management

Configuration must be environment-based.

Use

```
.env
```

Do not hardcode

- Secrets
- JWT Keys
- Database URLs
- Upload Paths
- Expiry Times

All configurable values must be read from environment variables.

# 13. Naming Conventions

Consistent naming conventions are mandatory throughout the project.

---

## 13.1 Database Tables

All database tables must use

- snake_case
- plural names
- `nvs_` prefix

Examples

```
nvs_users

nvs_organizations

nvs_pages

nvs_media

nvs_content_types

nvs_media_types

nvs_permissions

nvs_user_permissions

nvs_regions

nvs_states

nvs_refresh_tokens

nvs_audit_logs
```

---

## 13.2 Database Columns

Use snake_case.

Examples

```
organization_id

content_type_id

media_type_id

created_at

updated_at

deleted_at

created_by

updated_by

deleted_by
```

---

## 13.3 Prisma Models

Use PascalCase.

Examples

```
User

Organization

Page

Media

Permission
```

---

## 13.4 TypeScript

Use camelCase.

Examples

```
organizationId

contentTypeId

mediaTypeId

createdAt
```

---

## 13.5 DTOs

Naming

```
CreateUserDto

UpdateUserDto

LoginDto

RefreshTokenDto
```

---

## 13.6 Services

```
UsersService

AuthService

PagesService
```

---

## 13.7 Controllers

```
UsersController

PagesController

MediaController
```

---

## 13.8 Guards

```
JwtAuthGuard

RolesGuard

PermissionsGuard
```

---

## 13.9 Decorators

```
CurrentUser

Roles

Permissions
```

---

# 14. Database Standards

The database design defined in

```
docs/04_DATABASE_DESIGN.md
```

is the single source of truth.

Implementation must not deviate from it.

---

## Primary Keys

Every table must contain

```
id
```

Rules

- Integer
- Auto Increment
- Primary Key

UUID primary keys are not permitted.

---

## Foreign Keys

Always use integer foreign keys.

Examples

```
organization_id

created_by

updated_by

role_id

permission_id
```

---

## Audit Columns

Transactional tables must contain

```
created_at

updated_at

created_by

updated_by

deleted_at

deleted_by

is_deleted
```

---

## Constraints

Use database constraints wherever applicable.

Examples

```
UNIQUE(email)

UNIQUE(permission_key)

UNIQUE(content_type_name)

UNIQUE(media_type_name)

UNIQUE(organization_code)
```

---

## Indexes

Create indexes for frequently queried columns.

Recommended indexes

```
organization_id

role

created_at

is_deleted

content_type_id

media_type_id
```

---

# 15. Prisma Standards

Prisma is the only ORM.

Never bypass Prisma using raw SQL unless absolutely necessary.

---

## Relationships

Always define explicit relationships.

Example

```
User

↓

Organization

↓

Region
```

Avoid implicit relations.

---

## Enums

Use Prisma Enums whenever values are fixed.

Required Enums

```
Role

OrganizationType

PageStatus
```

Avoid unnecessary lookup tables for fixed values.

---

## Migrations

Always generate migrations.

Never manually modify migration history.

Migration names should clearly describe the change.

Examples

```
create_users

add_permissions

create_pages
```

---

## Seed Strategy

Seed scripts should be deterministic.

Running seed multiple times should not create duplicate data.

Use

```
upsert
```

where appropriate.

---

# 16. DTO Standards

Every request body must use DTO validation.

Do not accept raw request objects.

---

## Validation

Use

- class-validator
- class-transformer

Every DTO should validate

- Required fields
- Email
- Length
- Enum values
- Numeric values
- Boolean values

Validation should fail before reaching the service layer.

---

## DTO Separation

Every module should contain

```
create.dto

update.dto

response.dto (optional)

filter.dto (optional)
```

Never reuse Create DTOs for Update operations.

---

# 17. Controller Standards

Controllers should remain lightweight.

Controllers should

- Receive request
- Validate DTO
- Call Service
- Return Response

Controllers should not

- Access Prisma
- Contain business logic
- Perform calculations
- Contain authorization logic

---

# 18. Service Standards

Services contain business logic.

Services may

- Access Prisma
- Validate business rules
- Coordinate modules
- Handle transactions

Services should not

- Know HTTP details
- Return Express objects

---

# 19. Guard Standards

Every protected endpoint should pass through

```
JwtAuthGuard

↓

RolesGuard

↓

PermissionsGuard
```

Never duplicate authorization logic inside controllers.

---

# 20. Exception Handling

Use standard NestJS exceptions.

Allowed exceptions

```
BadRequestException

UnauthorizedException

ForbiddenException

NotFoundException

ConflictException

InternalServerErrorException
```

Never throw generic Error objects.

Never expose stack traces.

---

# 21. Logging & Audit Standards

Business logging and audit logging are different concerns.

Do not replace Audit Logs with application logging.

Audit Logs should record

- Who
- What
- When
- Where
- Before
- After

Avoid storing sensitive values.

---

# 22. Security Standards

Security applies across every module.

Mandatory

- JWT Authentication
- Refresh Tokens
- Password Hashing
- DTO Validation
- Authorization
- Rate Limiting
- Account Lock
- File Validation
- Soft Delete
- Audit Logs

Never

- Store passwords
- Return password hashes
- Trust client roles
- Skip permission validation

---

# 23. Soft Delete Strategy

Soft Delete is mandatory.

Implementation

```
is_deleted

deleted_at

deleted_by
```

Queries should automatically ignore deleted records.

Restore should clear

```
deleted_at

deleted_by

is_deleted
```

Hard Delete should be reserved only for exceptional maintenance operations.

---

# 24. File Upload Standards

Use Multer.

Store files under

```
resources/media_uploads
```

Rules

- Generate unique filenames.
- Preserve original filename.
- Validate MIME type.
- Validate extension.
- Validate file size.
- Store metadata only in PostgreSQL.

Reject unsupported uploads before storage.

---

# 25. Code Quality Standards

Every implementation should

- Compile successfully.
- Follow project conventions.
- Avoid duplication.
- Use meaningful names.
- Keep methods short.
- Keep classes cohesive.
- Keep modules independent.

Avoid speculative abstractions.

Only introduce new abstractions when they clearly improve maintainability.

---

# 26. Documentation Standards

Every public module should contain

- Clear naming
- Self-explanatory methods
- Minimal but meaningful comments

Do not over-comment obvious code.

Prefer expressive code over excessive documentation.

# 27. Authentication Implementation Standards

Authentication must be implemented using JWT Access Tokens and Refresh Tokens.

The authentication module is responsible only for identity verification.

Authorization is handled separately.

---

## Authentication Flow

Every login request must follow this sequence.

```
Validate Request

↓

Find User

↓

Verify Active Status

↓

Verify Soft Delete Status

↓

Verify Account Lock Status

↓

Compare Password

↓

Generate Access Token

↓

Generate Refresh Token

↓

Persist Refresh Token

↓

Record Audit Log

↓

Return Response
```

If any validation fails, authentication must stop immediately.

---

## Password Management

Passwords must

- Never be stored in plain text.
- Always be hashed using bcrypt.
- Never be returned in any API response.
- Never appear in logs.
- Never appear in Audit Logs.

Password comparison must always use bcrypt.

---

## JWT Standards

Access Token

Purpose

- Authentication
- API Authorization

Lifetime

```
30 Minutes
```

Payload should contain only

```
userId

organizationId

role
```

Do not include

- Password
- Email
- Permissions
- Organization Details

---

## Refresh Token Standards

Refresh Tokens should

- Be randomly generated.
- Have configurable expiry.
- Be revocable.
- Support rotation.
- Support logout.

Whenever practical, store hashed Refresh Tokens.

---

## Account Lock Strategy

The application must prevent brute-force attacks.

Track

```
failed_login_attempts

locked_until
```

After the configured number of failed attempts

- Lock account.
- Record Audit Log.
- Reject authentication.

Unlock automatically after configured duration.

---

## Logout

Logout must

- Revoke Refresh Token.
- Record Audit Log.
- Return success response.

Access Tokens naturally expire.

---

# 28. Authorization Standards

Authorization determines whether an authenticated user may perform an operation.

Authorization consists of

```
Authentication

↓

Role

↓

Role Permissions

↓

User Permission Overrides

↓

Authorization Decision
```

---

## Authorization Sequence

Every protected endpoint should execute

```
JwtAuthGuard

↓

RolesGuard

↓

PermissionsGuard
```

Business logic must never perform authorization checks.

---

## Role Resolution

Role determines default permissions.

Role definitions are immutable.

Roles are implemented as Prisma Enums.

---

## Permission Resolution

Permissions are loaded from

```
Role

+

User Overrides
```

User overrides always take precedence.

Permission evaluation should occur before controller execution.

---

## Permission Strategy

Permission definitions

- Seeded once.
- Immutable.
- Read-only.

Only permission assignments change.

---

# 29. Transaction Strategy

Every business transaction should remain atomic.

Examples

```
Create User

↓

Assign Organization

↓

Assign Role

↓

Assign Permissions

↓

Audit Log
```

If any operation fails

Rollback the transaction.

Use Prisma transactions where multiple database operations must succeed together.

---

# 30. Audit Log Strategy

Audit Logs must be generated automatically.

Never require manual creation.

Every audit entry should contain

```
User

Action

Module

Entity

Entity Id

Previous Values

New Values

IP Address

User Agent

Timestamp
```

Do not store passwords or Refresh Tokens.

---

## Auditable Events

Record Audit Logs for

- Login
- Logout
- Create
- Update
- Delete
- Restore
- Permission Assignment
- File Upload
- File Delete

Audit Logs are append-only.

Never update existing Audit Log entries.

---

# 31. Response Formatting Strategy

Every controller should return the same response format.

Success

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

Collection

```json
{
  "success": true,
  "message": "",
  "data": [],
  "pagination": {}
}
```

Failure

```json
{
  "success": false,
  "statusCode": 400,
  "message": "",
  "errors": []
}
```

Never return inconsistent response structures.

---

# 32. Pagination Strategy

Every collection endpoint should support pagination.

Default

```
page=1

limit=20
```

Maximum

```
100
```

Pagination metadata

```
page

limit

total

totalPages
```

---

# 33. Filtering Strategy

Filtering should use query parameters.

Examples

```
?search=

?status=

?organizationId=

?contentTypeId=

?mediaTypeId=
```

Avoid creating custom filtering endpoints.

---

# 34. Sorting Strategy

Support

```
sort

order
```

Example

```
?sort=createdAt

?order=desc
```

Default

```
createdAt DESC
```

---

# 35. Query Optimization

Prisma queries should

- Select only required fields.
- Avoid N+1 queries.
- Use relations efficiently.
- Use indexes.
- Avoid unnecessary joins.

Do not optimize prematurely.

Prefer readability over micro-optimizations.

---

# 36. Error Handling Strategy

Every exception should be meaningful.

Return

- Appropriate HTTP Status
- Clear Message
- Validation Details

Never expose

- Stack traces
- Database errors
- Internal implementation details

---

# 37. File Upload Strategy

Every upload must be validated before storage.

Validate

- File Extension
- MIME Type
- Maximum File Size
- Duplicate Filename (display only)

Store

```
Generated Filename

Original Filename

Metadata
```

Physical files

```
resources/media_uploads
```

---

# 38. Performance Guidelines

Performance improvements should remain simple.

Prefer

- Proper indexes.
- Efficient queries.
- Pagination.
- DTO validation.
- Lazy loading only when appropriate.

Avoid

- Premature optimization.
- Complex caching.
- Over-engineering.

---

# 39. Security Guidelines

Every endpoint should

- Require Authentication.
- Validate Authorization.
- Validate Permissions.
- Validate DTOs.
- Sanitize Input.
- Record Audit Logs where applicable.

Never trust client-provided values.

Always derive authenticated user information from JWT.

---

# 40. Integration Guidelines

Every new module should integrate consistently with the existing infrastructure.

Where applicable, every module must support

- Authentication
- Authorization
- Permissions
- Audit Logs
- Soft Delete
- DTO Validation
- Standard Responses
- Pagination
- Filtering
- Sorting

No module should implement these concerns differently from the rest of the application.

# 41. Build & Verification Standards

Every implementation must be verified before it is considered complete.

No feature should be marked complete without successfully passing the required verification process.

Verification is mandatory for every feature implementation.

---

# 42. Build Verification

After every implementation, execute the following commands.

```bash
npm run build

npx prisma validate
```

Both commands must complete successfully.

Do not continue until all build and validation errors are resolved.

---

# 43. Prisma Validation

Prisma validation is mandatory.

The Prisma schema must

- Compile successfully.
- Validate successfully.
- Contain no relationship errors.
- Contain no migration conflicts.
- Contain no duplicate models.
- Contain no invalid references.

Never ignore Prisma validation errors.

---

# 44. Application Startup Verification

After a successful build, verify that the application starts correctly.

Confirm

- NestJS application starts successfully.
- Environment variables load correctly.
- Database connection is successful.
- Prisma Client initializes successfully.
- No runtime exceptions occur during startup.

The application should start without manual intervention.

---

# 45. Manual Verification Checklist

Automated testing is intentionally excluded from this project.

Manual verification must be performed using Postman.

---

## Authentication

Verify

- Login
- Invalid Login
- Refresh Token
- Logout
- Expired Access Token
- Revoked Refresh Token
- Account Lock
- Rate Limiting

---

## User Management

Verify

- Create User
- Update User
- Soft Delete User
- Restore User
- Activate User
- Deactivate User
- Assign Role
- Assign Organization
- Assign Permissions

---

## Organization Management

Verify

- Create Organization
- Update Organization
- Soft Delete Organization
- Restore Organization

Verify parent-child relationships.

---

## Region & State Masters

Verify

- Create
- Update
- Soft Delete
- Restore

Verify referential integrity with Organizations.

---

## Content Types

Verify

- Create
- Update
- Soft Delete
- Restore

Verify uniqueness.

---

## Media Types

Verify

- Create
- Update
- Soft Delete
- Restore

Verify uniqueness.

---

## Pages

Verify

- Create
- Update
- Soft Delete
- Restore

Verify

- Organization ownership.
- Content Type uniqueness.
- Permission enforcement.

---

## Media

Verify

- Upload
- Retrieve
- Soft Delete
- Restore

Verify

- File validation.
- Metadata persistence.
- Organization ownership.
- Media Type validation.

---

## Permissions

Verify

- Read permissions.
- Permission assignment.
- Permission removal.

Permission definitions must remain immutable.

---

## Audit Logs

Verify that Audit Logs are automatically generated for

- Login
- Logout
- User Management
- Organization Changes
- Page Changes
- Media Upload
- Media Delete
- Permission Assignment

Audit Logs must be read-only.

---

# 46. Production Readiness Checklist

Before considering any feature production-ready, confirm

- Project builds successfully.
- Prisma validates successfully.
- Application starts successfully.
- DTO validation is complete.
- Authentication is implemented.
- Authorization is enforced.
- Permissions are enforced.
- Audit Logs are generated.
- Soft Delete is implemented.
- Standard API responses are returned.
- Pagination works.
- Filtering works.
- Sorting works.
- Error handling is consistent.
- No hardcoded secrets exist.
- Environment variables are used correctly.

---

# 47. Definition of Done

A feature is complete only when all of the following conditions are satisfied.

## Functional

- Requirements fully implemented.
- Business rules enforced.
- API endpoints operational.

---

## Technical

- Build successful.
- Prisma validation successful.
- No TypeScript errors.
- No runtime startup errors.

---

## Security

- Authentication enforced.
- Authorization enforced.
- Permission validation enforced.
- Sensitive data protected.

---

## Data Integrity

- Relationships valid.
- Constraints respected.
- Soft Delete functioning.
- Audit Logs recorded.

---

## Quality

- Code follows project conventions.
- No duplicate logic.
- No unnecessary abstractions.
- No placeholder implementations.

---

# 48. Common Implementation Mistakes

Avoid the following mistakes.

## Architecture

Do not

- Redesign the architecture.
- Reorganize project folders.
- Rename existing modules.
- Introduce unnecessary abstraction.

---

## Database

Do not

- Use UUID primary keys.
- Store passwords.
- Store binary files.
- Bypass Prisma.
- Duplicate tables.

---

## Controllers

Do not

- Implement business logic.
- Query Prisma directly.
- Perform authorization checks manually.

---

## Services

Do not

- Return HTTP responses.
- Depend on controller logic.

---

## Authentication

Do not

- Store plain Refresh Tokens when hashing is practical.
- Return passwords.
- Trust client-provided roles.

---

## Authorization

Do not

- Skip permission checks.
- Duplicate authorization logic.
- Hardcode permissions.

---

## File Upload

Do not

- Trust file extensions alone.
- Store uploads in the project root.
- Allow unsupported MIME types.

---

# 49. Engineering Review Checklist

Before submitting implementation for review, verify

Architecture

✓ Existing architecture preserved.

✓ Existing patterns reused.

✓ No unnecessary modules created.

---

Database

✓ Schema updated correctly.

✓ Relationships correct.

✓ Constraints correct.

✓ Migrations generated.

---

Security

✓ Authentication enforced.

✓ Authorization enforced.

✓ Permissions enforced.

✓ Sensitive data protected.

---

Quality

✓ DTO validation complete.

✓ Error handling complete.

✓ Audit Logs generated.

✓ Soft Delete supported.

---

Verification

✓ Build successful.

✓ Prisma validation successful.

✓ Manual verification completed.

---

# 50. Final Engineering Principles

Every implementation must follow these principles.

- Extend, don't redesign.
- Reuse before creating.
- Keep modules cohesive.
- Keep controllers thin.
- Keep business logic in services.
- Keep Prisma responsible only for persistence.
- Prefer clarity over cleverness.
- Prefer maintainability over abstraction.
- Prefer consistency over optimization.
- Build for production, not for demonstration.

---

# End of Document

This document defines **how the system should be implemented**.

Business requirements are defined in:

- docs/01_PROJECT_SPECIFICATION.md

Database standards are defined in:

- docs/04_DATABASE_DESIGN.md

Codex operational workflow is defined in:

- docs/03_CODEX_WORKFLOW.md

Every implementation must comply with all four documents.