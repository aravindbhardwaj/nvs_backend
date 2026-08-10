# Database Seed Script Implementation

## Objective

Implement the complete database seed process for the Production-Ready NVS CMS Backend.

Your role is to act as a Senior Solution Architect, Senior NestJS Developer, Senior Prisma Developer, and Production Code Implementation Agent.

This feature initializes the database with all required master data and sample records required for development, testing, and demonstrations.

The seed process must be deterministic and idempotent.

Running the seed multiple times must never create duplicate records.

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

Implement the complete Prisma seed process.

The seed must populate every required master table.

Use Prisma upsert() wherever possible.

The seed should support repeated execution without creating duplicate data.

---

# Scope

Implement

- Prisma Seed Script
- Seed Utilities
- Seed Constants
- Seed Data Organization
- Idempotent Seed Logic
- Seed Documentation

Implement only the database seed.

Do not implement business logic.

Do not redesign the schema.

---

# Existing Code Review

Before implementation

Inspect

- Existing seed.ts
- Existing Prisma schema
- Existing migrations
- Existing enums
- Existing master modules

Reuse existing implementation where possible.

Do not duplicate seed logic.

---

# Seed Order

Seed data must be inserted in dependency order.

```
Regions

↓

States

↓

Organizations

↓

Permissions

↓

Role Permissions

↓

Users

↓

Content Types

↓

Media Types

↓

Sample Pages

↓

Sample Media Metadata (optional)
```

Never violate foreign key dependencies.

---

# Seed Data

## Regions

Seed all required Regional Office regions.

Each Region must contain

- region_name
- region_code

Use unique region codes.

---

## States

Seed all Indian States and Union Territories.

Each State must contain

- state_name
- state_code

---

## Organizations

Seed

- 1 Headquarters
- 7 NLIs
- 10 Regional Offices

Create representative JNVs.

If the complete JNV dataset is available, seed all JNVs.

Otherwise create representative data sufficient for development.

Maintain hierarchy

```
Headquarters

↓

Regional Office

↓

JNV
```

NLI has no parent.

---

## Permissions

Seed every application permission.

Examples

```
USER_CREATE

USER_VIEW

USER_UPDATE

USER_DELETE

USER_RESTORE

ORGANIZATION_CREATE

ORGANIZATION_VIEW

ORGANIZATION_UPDATE

ORGANIZATION_DELETE

PAGE_CREATE

PAGE_VIEW

PAGE_UPDATE

PAGE_DELETE

MEDIA_UPLOAD

MEDIA_VIEW

MEDIA_DELETE

AUDIT_LOG_VIEW
```

Permission definitions are immutable.

---

## Role Permissions

Seed default Role Permissions.

SUPER_ADMIN

All permissions.

HEADQUARTER

Business permissions only.

NLI

Business permissions only.

REGIONAL

Business permissions only.

JNV

Business permissions only.

Resolve permissions using

```
permission_key
```

Never hardcode database IDs.

---

## Users

Seed

One SUPER_ADMIN

One HEADQUARTER User

One NLI User

One REGIONAL User

One JNV User

Passwords must be bcrypt hashed.

Never store plain text passwords.

---

## Content Types

Seed

- About Us
- Mission
- Vision
- Objectives
- Welcome Message
- Notice
- Announcement
- Circular
- News

---

## Media Types

Seed

- Notice
- Circular
- Tender
- Office Memorandum
- Office Order
- Notification
- Policy
- Guideline
- Manual
- Report
- Recruitment
- Training Material
- Form
- Other

---

## Sample Pages

Seed representative Pages for demonstration.

Example

Headquarters

- About Us
- Mission

Regional Office

- Welcome Message

JNV

- About School

Only create one Page per

Organization + Content Type

---

## Sample Media Metadata

Optional

Create sample Media metadata.

Do not require physical files.

The application must continue working without uploaded documents.

---

# Seed Principles

Use

```
upsert()
```

where appropriate.

Avoid duplicate records.

Never assume auto-generated IDs.

Always resolve related entities using unique business keys.

---

# Environment

Support

```
npx prisma db seed
```

The seed must work on an empty database.

It must also work on a previously seeded database.

---

# Constraints

Do NOT

- Hardcode database IDs.
- Duplicate records.
- Insert invalid foreign keys.
- Modify migrations.
- Modify schema.

Implement only the seed.

---

# Deliverables

Provide

## Files Created

Example

```
prisma/

seed.ts

seed/

constants.ts

permissions.ts

organizations.ts
```

---

## Files Modified

List every modified file.

---

## Seed Summary

Summarize

- Regions
- States
- Organizations
- Users
- Permissions
- Role Permissions
- Content Types
- Media Types
- Sample Pages

---

# Verification

Run

```bash
npm run build

npx prisma validate

npx prisma db seed
```

Run the seed twice.

Verify

- No duplicate records
- No foreign key violations
- No unique constraint violations

Fix every issue before stopping.

---

# Final Review

Verify

✓ Seed deterministic

✓ Seed idempotent

✓ All master data created

✓ Sample users created

✓ Sample pages created

✓ Passwords hashed

✓ Build successful

✓ Prisma validation successful

✓ Seed executes successfully multiple times

---

# Output Format

Return only

## Seed Summary

## Files Created

## Files Modified

## Records Seeded

## Build Result

## Prisma Validation Result

## Seed Verification Result

## Remaining Work

Stop.

Wait for the next instruction.

Do not perform Final Project Validation.