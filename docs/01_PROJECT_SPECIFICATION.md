# Production-Ready NVS CMS Backend
## Project Specification

Version: 1.0

---

# 1. Project Overview

## 1.1 Purpose

The objective of this project is to develop a **Production-Ready Content Management System (CMS) Backend** for the Navodaya Vidyalaya Samiti (NVS).

The application will provide a centralized platform for managing content across multiple organizational levels while maintaining secure access, role-based authorization, structured content management, and document management.

The system is intended for production deployment and must follow modern backend engineering practices without introducing unnecessary enterprise complexity.

The application should prioritize:

- Simplicity
- Maintainability
- Scalability
- Security
- Performance
- Consistency
- Production readiness

The project is backend only.

No frontend development is part of this specification.

---

# 2. Project Objectives

The CMS should enable authorized users to:

- Authenticate securely.
- Manage organization-specific content.
- Upload and manage official documents.
- Maintain master data.
- Enforce organizational hierarchy.
- Control access using Roles and Permissions.
- Maintain complete audit history.
- Support future expansion without redesigning the architecture.

The project should provide a clean foundation for future modules while remaining intentionally simple.

---

# 3. Business Goals

The system should provide a centralized content management platform for all organizational levels.

Business objectives include:

- Centralized content management.
- Controlled document publishing.
- Organization-specific content ownership.
- Secure authentication.
- Granular authorization.
- Proper auditability.
- Consistent document classification.
- Easy future maintenance.

---

# 4. Project Scope

The project includes only backend development.

Included:

- REST APIs
- Authentication
- Authorization
- User Management
- Organization Management
- Pages
- Media Management
- Master Data
- Permissions
- User Permissions
- Audit Logs
- PostgreSQL Database
- Prisma ORM
- Local File Upload
- Seed Scripts

Not Included:

- Frontend
- Mobile Applications
- Email
- SMS
- Notifications
- Reporting Dashboards
- Analytics
- Docker
- Kubernetes
- Redis
- GraphQL
- Microservices
- CQRS
- Event Sourcing
- Event Bus
- Queues
- Kafka
- RabbitMQ

---

# 5. Technology Stack

The backend must use the following technologies.

| Layer | Technology |
|--------|------------|
| Runtime | Node.js |
| Framework | NestJS |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma ORM |
| Authentication | JWT |
| Authorization | Roles + Permissions |
| Password Hashing | bcrypt |
| File Upload | Multer |
| Validation | class-validator |
| Transformation | class-transformer |
| Configuration | dotenv |

No alternative technologies should be introduced without explicit approval.

---

# 6. System Overview

The CMS is designed around an organizational hierarchy.

Each organization manages only its own content.

The Super Admin has complete access to the system.

The CMS primarily manages two categories of information:

1. Structured Pages
2. Official Documents

Both are organization-specific.

---

# 7. Organization Hierarchy

The organization structure is fixed.

```
Super Admin
├── Headquarters
├── NLI
└── Regional Offices
      └── JNVs
```

---

## Organization Statistics

The application should support:

| Organization | Count |
|--------------|------:|
| Super Admin | 1 |
| Headquarters | 1 |
| NLI | 7 |
| Regional Offices | 10 |
| JNVs | 661 |

These values may increase in the future but should not require architectural changes.

---

# 8. Organization Rules

The following rules are mandatory.

## Headquarters

- Independent organization.
- Reports directly to Super Admin.

---

## NLI

- Independent organizations.
- Report directly to Super Admin.

---

## Regional Offices

- Independent organizations.
- Report directly to Super Admin.

Each Regional Office manages multiple JNVs.

---

## JNV

Each JNV:

- Belongs to exactly one Regional Office.
- Belongs to exactly one State.
- Can only manage its own content.

---

# 9. User Ownership Rules

Every user belongs to exactly one organization.

Users cannot belong to multiple organizations.

Users inherit organization access automatically.

Users cannot access content belonging to another organization unless explicitly permitted.

---

# 10. User Roles

The system supports exactly five roles.

| Role | Description |
|------|-------------|
| SUPER_ADMIN | Complete system administrator |
| HEADQUARTER | Headquarters user |
| NLI | National Level Institution user |
| REGIONAL | Regional Office user |
| JNV | Jawahar Navodaya Vidyalaya user |

Role definitions are fixed.

Roles are implemented as a Prisma Enum.

No dynamic role creation is allowed.

---

# 11. Role Responsibilities

## SUPER_ADMIN

Responsible for:

- System administration
- User Management
- Organization Management
- Master Data Management
- Permission Assignment
- Viewing Audit Logs
- Managing every Page
- Managing every Media item

---

## HEADQUARTER

Responsible for:

- Managing Headquarters pages
- Uploading Headquarters documents
- Viewing Headquarters content

Cannot manage users.

---

## NLI

Responsible for:

- Managing NLI pages
- Uploading NLI documents
- Viewing NLI content

Cannot manage users.

---

## REGIONAL

Responsible for:

- Managing Regional Office pages
- Uploading Regional Office documents
- Viewing Regional Office content

Cannot manage users.

---

## JNV

Responsible for:

- Managing JNV pages
- Uploading JNV documents
- Viewing JNV content

Cannot manage users.

---

# 12. Core Functional Areas

The CMS is divided into the following business domains.

- Authentication
- Authorization
- User Management
- Organization Management
- Page Management
- Media Management
- Content Type Management
- Media Type Management
- Permissions
- User Permissions
- Audit Logging

Each domain is implemented as an independent NestJS module.

Modules communicate through well-defined services and database relationships.

---

# 13. Content Management Philosophy

Every organization manages two primary content categories.

## Structured Pages

Examples include:

- About
- Mission
- Vision
- Objectives
- Welcome Message
- Notice
- Announcement

Each page belongs to:

- One Organization
- One Content Type

Each organization can maintain one page per content type.

---

## Media Library

Official document repository.

Supported examples include:

- Notices
- Circulars
- Tenders
- Office Memorandums
- Manuals
- Reports
- Policies
- Office Orders
- Recruitment Notices
- Guidelines

Each uploaded document belongs to:

- One Organization
- One Media Type

Only document metadata is stored in the database.

Actual files are stored locally.

---

# 14. Business Principles

The CMS should follow these principles.

- Organization ownership of content.
- Secure authentication.
- Permission-based authorization.
- Consistent master data.
- Strong validation.
- Complete auditability.
- Soft delete support.
- Reusable architecture.
- Simple maintainable implementation.
- Production-ready engineering practices.

# 15. Functional Requirements

The CMS shall provide secure, centralized, organization-based content management.

All functionality shall be accessible only through authenticated REST APIs, except the Login and Refresh Token endpoints.

Every operation shall be governed by Roles and Permissions.

Every transactional operation shall be recorded in the Audit Log.

Every transactional entity shall support Soft Delete unless explicitly stated otherwise.

---

# 16. Authentication

## Objective

Provide secure authentication for all users.

Authentication shall support:

- Login
- Access Tokens
- Refresh Tokens
- Logout
- Account Locking
- Password Hashing
- Rate Limiting

---

## Login

Users authenticate using:

- Email
- Password

The system shall

- Validate credentials.
- Verify user status.
- Verify account lock status.
- Generate JWT Access Token.
- Generate Refresh Token.
- Store Refresh Token.
- Record Login Audit Log.

---

## Access Token

The system shall generate JWT Access Tokens.

Access Token lifetime

```
30 Minutes
```

The Access Token shall contain

- User ID
- Organization ID
- Role

Sensitive information shall never be included.

---

## Refresh Token

The system shall support Refresh Tokens.

The Refresh Token shall

- be securely generated
- have configurable expiry
- be revocable
- support logout
- support rotation

A Refresh Token shall only be valid for one active session unless configured otherwise.

---

## Logout

Logout shall

- revoke Refresh Token
- invalidate future refresh requests
- record Audit Log

---

## Account Lock

To prevent brute-force attacks

The system shall

- track failed login attempts
- temporarily lock accounts after repeated failures
- automatically unlock after configurable duration

---

## Rate Limiting

Rate Limiting shall be enabled for

- Login API
- Refresh Token API

The objective is to reduce brute-force attacks.

---

# 17. Authorization

Authorization consists of three layers.

## Layer 1

Authentication

Verifies identity.

---

## Layer 2

Role

Defines default permissions.

Example

```
SUPER_ADMIN

↓

All Permissions

HEADQUARTER

↓

HQ Permissions

REGIONAL

↓

Regional Permissions
```

---

## Layer 3

User Permissions

User-specific permission overrides.

User Permissions may

- grant additional permissions
- revoke inherited permissions

Permission evaluation order

```
Authenticate User

↓

Load Role

↓

Load Role Permissions

↓

Load User Permission Overrides

↓

Authorize Request
```

---

# 18. User Management

Only SUPER_ADMIN can manage users.

The module shall support

- Create User
- View Users
- View User Details
- Update User
- Activate User
- Deactivate User
- Soft Delete User
- Restore User
- Assign Organization
- Assign Role
- Assign Permissions

---

## User Information

Each user shall contain

- Name
- Email
- Mobile
- Address
- Password
- Organization
- Role
- Status

Email must be unique.

Passwords shall always be hashed.

---

## User Status

Supported statuses

- Active
- Inactive
- Locked
- Deleted

---

# 19. Organization Management

Organizations represent administrative units.

Supported organization types

- Headquarters
- NLI
- Regional Office
- JNV

Only SUPER_ADMIN can manage organizations.

The module shall support

- Create
- Update
- View
- Soft Delete
- Restore

---

## Organization Hierarchy Validation

The following relationships are valid

```
Regional Office

↓

JNV
```

Invalid relationships shall be rejected.

---

# 20. Region Management

The application shall maintain a Region Master.

Purpose

Represents official Regional Office locations.

Each Regional Office belongs to one Region.

Regions are reference data.

Regions shall support

- Create
- Update
- View
- Soft Delete

Only SUPER_ADMIN manages Regions.

---

# 21. State Management

The application shall maintain a State Master.

Purpose

Represents Indian States and Union Territories.

Each JNV belongs to one State.

States are reference data.

States shall support

- Create
- Update
- View
- Soft Delete

Only SUPER_ADMIN manages States.

---

# 22. Content Type Management

The application shall maintain Content Types.

Purpose

Defines the available Page categories.

Examples

- About
- Mission
- Vision
- Objectives
- Welcome Message
- Notice
- Announcement

Only SUPER_ADMIN manages Content Types.

The module shall support

- Create
- Update
- View
- Soft Delete

---

# 23. Media Type Management

The application shall maintain Media Types.

Purpose

Defines document classifications.

Examples

- Notice
- Circular
- Tender
- Office Memorandum
- Manual
- Guideline
- Report
- Policy
- Office Order
- Recruitment
- Form
- Other

Only SUPER_ADMIN manages Media Types.

The module shall support

- Create
- Update
- View
- Soft Delete

---

# 24. Page Management

Pages represent structured CMS content.

Each Page belongs to

- One Organization
- One Content Type

The module shall support

- Create
- Update
- View
- Soft Delete
- Restore

Each Page shall contain

- Title
- Description
- Content
- Content Type
- Status
- Display Order

One Organization may own only one Page for each Content Type.

---

# 25. Media Management

The Media module manages uploaded documents.

The system shall support

- Upload Document
- View Documents
- Download Metadata
- Soft Delete Document

Supported document types

- PDF
- DOC
- DOCX
- XLS
- XLSX
- PPT
- PPTX

Unsupported file types shall be rejected.

Each Media record belongs to

- One Organization
- One Media Type

Files shall be stored locally.

Only metadata shall be stored in PostgreSQL.

---

# 26. Permissions

Permissions define operations that users may perform.

Permissions are application metadata.

Permissions shall

- be seeded
- remain immutable
- never be created through APIs
- never be edited through APIs
- never be deleted through APIs

Only read operations are permitted.

---

# 27. User Permissions

User Permissions override Role Permissions.

Only SUPER_ADMIN may

- Assign Permission
- Remove Permission
- View Permission Assignments

Permission definitions remain unchanged.

---

# 28. Audit Logs

Audit Logs record significant system activity.

The system shall automatically record

- Login
- Logout
- User Creation
- User Update
- User Deactivation
- Permission Assignment
- Organization Changes
- Page Changes
- Media Upload
- Media Delete

Audit Logs are read-only.

No Create API.

No Update API.

No Delete API.

---

# 29. Soft Delete

Transactional entities shall support Soft Delete.

Soft Delete shall

- preserve historical records
- preserve foreign-key integrity
- maintain audit history

Soft-deleted records shall not appear in normal queries.

Restoration shall be supported where appropriate.

---

# 30. File Storage

Uploaded files shall be stored locally.

Storage location

```
resources/media_uploads
```

The database shall store only

- metadata
- file path
- file information

Binary files shall never be stored inside PostgreSQL.

Unique filenames shall be generated automatically.

Original filenames shall be preserved for display purposes.

# 31. REST API Specification

The application exposes RESTful APIs only.

Every endpoint must follow REST principles.

All endpoints must be version-ready.

Current base URL

```
/api
```

Future versioning should support

```
/api/v1
```

without requiring major refactoring.

---

# 32. API Standards

All APIs shall

- Require authentication unless explicitly public.
- Validate incoming requests.
- Authorize every operation.
- Return consistent responses.
- Return meaningful HTTP status codes.
- Record audit logs where applicable.

The API must remain predictable and consistent across all modules.

---

# 33. Standard Response Format

Every successful response shall follow a common structure.

Example

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

---

## Collection Response

List endpoints shall return

```json
{
  "success": true,
  "message": "Data fetched successfully.",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 245,
    "totalPages": 13
  }
}
```

---

## Error Response

Every error shall follow the same structure.

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed.",
  "errors": []
}
```

Never expose stack traces or internal implementation details.

---

# 34. Authentication APIs

## Login

```
POST /api/auth/login
```

Public endpoint.

Input

```
email

password
```

Output

```
Access Token

Refresh Token

User Details
```

---

## Refresh Token

```
POST /api/auth/refresh
```

Input

```
Refresh Token
```

Output

```
New Access Token

New Refresh Token
```

---

## Logout

```
POST /api/auth/logout
```

Revokes Refresh Token.

Records Audit Log.

---

# 35. Users APIs

Base URL

```
/api/users
```

Supported Operations

```
POST

GET

GET BY ID

PUT

DELETE (Soft Delete)

PATCH Activate

PATCH Deactivate

PATCH Assign Permissions

PATCH Restore
```

Only SUPER_ADMIN has access.

---

# 36. Organizations APIs

Base URL

```
/api/organizations
```

Supported Operations

```
POST

GET

GET BY ID

PUT

DELETE

PATCH Restore
```

Only SUPER_ADMIN has access.

---

# 37. Regions APIs

Base URL

```
/api/regions
```

Supported Operations

```
POST

GET

GET BY ID

PUT

DELETE

PATCH Restore
```

Only SUPER_ADMIN has access.

---

# 38. States APIs

Base URL

```
/api/states
```

Supported Operations

```
POST

GET

GET BY ID

PUT

DELETE

PATCH Restore
```

Only SUPER_ADMIN has access.

---

# 39. Content Types APIs

Base URL

```
/api/content-types
```

Supported Operations

```
POST

GET

GET BY ID

PUT

DELETE

PATCH Restore
```

Only SUPER_ADMIN has access.

---

# 40. Media Types APIs

Base URL

```
/api/media-types
```

Supported Operations

```
POST

GET

GET BY ID

PUT

DELETE

PATCH Restore
```

Only SUPER_ADMIN has access.

---

# 41. Pages APIs

Base URL

```
/api/pages
```

Supported Operations

```
POST

GET

GET BY ID

PUT

DELETE

PATCH Restore
```

Permissions

Organizations can manage only their own Pages.

SUPER_ADMIN can manage all Pages.

---

# 42. Media APIs

Base URL

```
/api/media
```

Supported Operations

```
POST Upload

GET

GET BY ID

DELETE

PATCH Restore
```

Supported Upload Types

- PDF
- DOC
- DOCX
- XLS
- XLSX
- PPT
- PPTX

Reject unsupported file types.

---

# 43. Permissions APIs

Base URL

```
/api/permissions
```

Permissions are immutable.

Supported Operations

```
GET

GET BY ID
```

No Create API.

No Update API.

No Delete API.

Only SUPER_ADMIN can view.

---

# 44. User Permissions APIs

Base URL

```
/api/user-permissions
```

Supported Operations

```
POST Assign

GET

PUT Update Assignment

DELETE Remove Assignment
```

Only SUPER_ADMIN.

---

# 45. Audit Logs APIs

Base URL

```
/api/audit-logs
```

Supported Operations

```
GET

GET BY ID
```

Read-only.

No Create.

No Update.

No Delete.

---

# 46. Filtering

Collection endpoints should support filtering.

Examples

```
?page=1

?limit=20

?search=notice

?status=ACTIVE

?organizationId=5

?contentTypeId=2

?mediaTypeId=3
```

Filtering should be implemented only where meaningful.

---

# 47. Sorting

List APIs should support sorting.

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

# 48. Pagination

Every collection endpoint shall support pagination.

Default

```
page = 1

limit = 20
```

Maximum limit

```
100
```

---

# 49. Business Rules

The following business rules are mandatory.

## Authentication

- Only active users may log in.
- Locked users cannot authenticate.
- Deleted users cannot authenticate.

---

## Authorization

Every protected API shall verify

- Authentication
- Role
- Permission

---

## Organizations

Users can access only their assigned organization.

SUPER_ADMIN bypasses organization restrictions.

---

## Pages

Only one Page per

```
Organization

+

Content Type
```

Duplicate pages shall not be allowed.

---

## Media

Every uploaded document

must belong to

- One Organization
- One Media Type

Media must reference an existing Media Type.

---

## Permissions

Permissions are immutable.

Only assignments change.

---

## Audit Logs

Every important action shall generate an Audit Log.

Audit Logs cannot be modified.

---

## Soft Delete

Soft Deleted entities

- cannot be modified
- cannot authenticate
- are excluded from normal queries

---

# 50. Acceptance Criteria

The project is considered functionally complete when

✓ Authentication works.

✓ Refresh Tokens work.

✓ Account Lock works.

✓ Rate Limiting works.

✓ Users CRUD works.

✓ Organizations CRUD works.

✓ Regions CRUD works.

✓ States CRUD works.

✓ Content Types CRUD works.

✓ Media Types CRUD works.

✓ Pages CRUD works.

✓ Media Upload works.

✓ Permissions work.

✓ User Permission Overrides work.

✓ Audit Logs work.

✓ Soft Delete works.

✓ Authorization works.

✓ Pagination works.

✓ Filtering works.

✓ Validation works.

✓ Build succeeds.

✓ Prisma validates successfully.

✓ The application starts without errors.

✓ The implementation follows the project architecture without unnecessary modifications.

# 51. Non-Functional Requirements

The following non-functional requirements define the quality attributes of the system.

These requirements apply to every module of the application.

---

# 51.1 Performance

The application should provide responsive performance for normal operational workloads.

The system should:

- Return API responses within acceptable response times under normal load.
- Optimize database queries using proper indexes.
- Minimize unnecessary database round trips.
- Use efficient Prisma queries.
- Avoid unnecessary joins and duplicate queries.
- Implement pagination for all collection endpoints.
- Return only required fields wherever practical.

Performance optimization should not increase implementation complexity unnecessarily.

---

# 51.2 Scalability

The application should support future growth without requiring architectural redesign.

The system should support future expansion for:

- Additional organizations.
- Additional organization types.
- Additional roles.
- Additional permissions.
- Additional content types.
- Additional media types.
- Additional modules.

The modular architecture should allow new features to be added with minimal impact on existing functionality.

---

# 51.3 Maintainability

The codebase should remain easy to understand and maintain.

The application should:

- Follow consistent coding standards.
- Use modular architecture.
- Avoid duplicate business logic.
- Reuse existing services and utilities.
- Keep controllers lightweight.
- Place business logic in services.
- Use meaningful naming conventions.
- Keep functions focused on a single responsibility.

---

# 51.4 Reliability

The application should remain stable during normal operation.

The system should:

- Validate all incoming requests.
- Handle exceptions gracefully.
- Return meaningful error messages.
- Prevent invalid data from being stored.
- Maintain referential integrity.

Unexpected failures should never expose sensitive implementation details.

---

# 51.5 Security

Security is mandatory across all modules.

The application must implement:

- JWT Authentication.
- Refresh Tokens.
- Password hashing using bcrypt.
- Authorization Guards.
- Permission validation.
- Account locking.
- Rate limiting.
- DTO validation.
- Secure file upload validation.
- Soft Delete.
- Audit Logging.

The application must never:

- Store plain-text passwords.
- Return password hashes.
- Expose internal stack traces.
- Trust client-provided roles or permissions.
- Bypass validation or authorization.

---

# 51.6 Availability

The backend should be designed for continuous operation.

The application should:

- Start successfully after deployment.
- Recover cleanly after restart.
- Continue operating when non-critical services fail.
- Handle invalid requests without affecting other users.

---

# 51.7 Data Integrity

The database must maintain consistent and valid data.

The system should enforce:

- Primary Keys.
- Foreign Keys.
- Unique Constraints.
- Required Fields.
- Referential Integrity.

Business rules must be enforced at both the application and database levels where appropriate.

---

# 51.8 Auditability

Every significant system operation should be traceable.

The application should record audit entries for:

- Authentication events.
- User management.
- Organization changes.
- Permission assignments.
- Page updates.
- Media uploads.
- Media deletion.

Audit records must be immutable.

---

# 51.9 File Management

Uploaded documents should be managed securely.

The application should:

- Generate unique storage filenames.
- Preserve original filenames.
- Validate file type.
- Validate file size.
- Store only metadata in PostgreSQL.
- Store physical files under the configured upload directory.

The application should reject unsupported or invalid uploads.

---

# 51.10 API Consistency

All APIs must behave consistently.

The application should:

- Follow REST conventions.
- Return consistent response structures.
- Use appropriate HTTP status codes.
- Use DTO validation.
- Support pagination where applicable.
- Support filtering where applicable.
- Support sorting where applicable.

---

# 51.11 Coding Standards

The project should maintain consistent development standards.

The implementation should:

- Follow the existing project architecture.
- Use TypeScript best practices.
- Follow NestJS conventions.
- Follow Prisma best practices.
- Keep modules cohesive.
- Avoid unnecessary abstractions.
- Produce production-ready code.

---

# 51.12 Deployment Assumptions

The initial deployment assumes:

- Single backend instance.
- PostgreSQL database.
- Local file storage.
- Environment configuration using `.env`.
- REST API consumers only.

Future deployment strategies may introduce containerization or distributed services without requiring major application redesign.

---

# 52. Assumptions

The following assumptions apply to this project.

- All users authenticate using email and password.
- Each user belongs to exactly one organization.
- Each JNV belongs to exactly one Regional Office.
- Regions and States are maintained as master data.
- Permissions are predefined and seeded.
- Roles are fixed and implemented as enums.
- Media files are stored locally.
- Audit logging is always enabled.
- Soft Delete is used for transactional entities.
- PostgreSQL is the only supported database.
- Prisma ORM is the only supported ORM.

---

# 53. Out of Scope

The following items are intentionally excluded from this release.

- Frontend applications.
- Mobile applications.
- Docker.
- Kubernetes.
- Redis.
- GraphQL.
- Microservices.
- CQRS.
- Event Sourcing.
- Kafka.
- RabbitMQ.
- Event Bus.
- Queues.
- Email.
- SMS.
- Push Notifications.
- Real-time messaging.
- Reporting dashboards.
- Analytics.
- Multi-tenancy.
- Dynamic role creation.
- Dynamic permission creation.
- Workflow engines.
- Business process management.
- External document storage.
- Cloud object storage.
- Search engines.
- OCR.
- AI integrations.

These capabilities may be considered in future phases.

---

# 54. Success Criteria

The project will be considered successful when:

- The application builds successfully.
- The Prisma schema validates successfully.
- The database migrations execute successfully.
- Seed scripts complete successfully.
- Authentication is fully functional.
- Authorization is fully functional.
- Refresh Tokens function correctly.
- Account locking functions correctly.
- Rate limiting functions correctly.
- Users can manage only the data they are authorized to access.
- CRUD operations work for all applicable modules.
- Pages and Media are organization-specific.
- Audit Logs are generated automatically.
- Soft Delete works consistently.
- API responses are consistent.
- Validation prevents invalid data.
- The architecture remains clean, modular, and maintainable.
- The project satisfies the business requirements defined in this specification.

---

# End of Document


This document defines **what** the system must do.

Implementation details, coding standards, architectural rules, and Codex-specific instructions are intentionally documented separately in:

- `docs/02_IMPLEMENTATION_GUIDELINES.md`
- `docs/03_CODEX_WORKFLOW.md`
- `docs/04_DATABASE_DESIGN.md`