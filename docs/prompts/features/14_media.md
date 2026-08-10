# Media (Document Upload) Implementation

## Objective

Implement the **Media Management** module for the Production-Ready NVS CMS Backend.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

This feature implements secure document upload and management using Multer and local file storage.

Media represents uploaded documents only.

No image gallery.

No video management.

No cloud storage.

No versioning.

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

Implement a complete Media Management module.

Media belongs to

- one Organization
- one Media Type

Physical files are stored locally.

Database stores metadata only.

---

# Scope

Implement

- Media Module
- Media Controller
- Media Service
- DTOs
- Multer Configuration
- Local Storage
- Upload
- Download
- Replace File
- Delete File
- Pagination
- Search
- Filtering
- Sorting
- Soft Delete
- Restore
- Audit Logging

Implement only Media.

---

# Existing Code Review

Before implementation

Inspect

- Authentication Module
- Organizations Module
- Media Types Module
- Common DTOs
- Common Services
- Audit Logging
- Soft Delete

Reuse existing implementation.

Never duplicate code.

---

# Database

Use

```
nvs_media
```

Structure

```
id

organization_id

media_type_id

title

description

original_filename

stored_filename

file_path

mime_type

extension

file_size

checksum

uploaded_at

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

# File Storage

Store files locally.

Directory

```
/uploads
```

Organize uploads by year and month.

Example

```
uploads/

2026/

08/

<uuid>.pdf
```

Never expose internal file paths directly.

Store only metadata in PostgreSQL.

---

# File Naming

Generate a UUID for every stored filename.

Example

```
report.pdf

↓

550e8400-e29b-41d4-a716-446655440000.pdf
```

Preserve the original filename in the database.

---

# APIs

Implement

## Upload Document

```
POST /api/media/upload
```

Multipart Form Data

Fields

- title
- description
- mediaTypeId
- file

---

## Get Media

```
GET /api/media
```

Supports

- Pagination
- Search
- Filtering
- Sorting

---

## Get Media By ID

```
GET /api/media/:id
```

---

## Download Document

```
GET /api/media/:id/download
```

Return the original filename to the client.

---

## Replace Document

```
PUT /api/media/:id/file
```

Upload a new file.

Replace the old physical file.

Update metadata.

---

## Update Metadata

```
PUT /api/media/:id
```

Allow updates to

- title
- description
- mediaTypeId

Do not replace the file.

---

## Soft Delete

```
DELETE /api/media/:id
```

---

## Restore

```
PATCH /api/media/:id/restore
```

---

# File Validation

Validate

Allowed extensions

```
pdf

doc

docx

xls

xlsx

ppt

pptx

odt

ods

odp

txt
```

Allowed MIME types

Validate against the extension.

Reject invalid files.

---

# File Size

Maximum

```
20 MB
```

Make this configurable through

```
MAX_UPLOAD_SIZE
```

---

# Security

Never trust the uploaded filename.

Generate UUID-based filenames.

Reject executable files.

Reject double extensions.

Example

```
report.pdf.exe
```

Reject invalid MIME types.

Sanitize all filenames.

---

# Replace File

Workflow

```
Upload New File

↓

Validate

↓

Store New File

↓

Update Database

↓

Delete Old File

↓

Audit Log
```

If any step fails

Rollback where possible.

Do not leave orphaned files.

---

# Delete Workflow

Soft Delete

↓

Hide from queries

↓

Keep physical file

Hard deletion is not implemented.

---

# Search / Filter / Sort

Support

```
?search=

?page=

?limit=

?mediaTypeId=

?organizationId=

?sort=

?order=

?isDeleted=
```

Default

```
page=1

limit=20

sort=uploadedAt

order=desc
```

Maximum

```
limit=100
```

---

# Business Rules

Users

May upload documents only for their own Organization.

SUPER_ADMIN

May manage all documents.

Media Type must exist.

Organization must exist.

---

# Ownership Rules

SUPER_ADMIN

Full access.

Other users

Only access documents belonging to their Organization.

Never expose documents belonging to another Organization.

---

# Audit Logging

Generate Audit Logs for

- Upload
- Replace
- Metadata Update
- Download (optional)
- Delete
- Restore

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

Never hard delete records.

Never physically delete files during Soft Delete.

---

# Integration

Integrate with

- Authentication
- Organizations
- Media Types
- Multer
- DTO Validation
- Audit Logs
- Soft Delete
- Standard API Response
- Pagination
- Filtering
- Sorting

---

# Constraints

Do NOT implement

- Image Processing
- Thumbnail Generation
- Cloud Storage
- AWS S3
- Azure Blob
- Google Cloud Storage
- File Versioning
- Virus Scanning
- ZIP Extraction
- OCR

Implement only document management.

---

# Deliverables

Provide

## Files Created

Example

```
src/media/

media.module.ts

media.controller.ts

media.service.ts

dto/

multer.config.ts
```

---

## Files Modified

List every modified file.

---

## APIs Implemented

```
POST /api/media/upload

GET /api/media

GET /api/media/:id

GET /api/media/:id/download

PUT /api/media/:id

PUT /api/media/:id/file

DELETE /api/media/:id

PATCH /api/media/:id/restore
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

## Media Management Summary

Summarize

- Upload Strategy
- Storage Strategy
- File Validation
- Replace Strategy
- Ownership Rules

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

✓ Upload implemented

✓ Download implemented

✓ Replace implemented

✓ Metadata update implemented

✓ UUID file naming implemented

✓ Local storage implemented

✓ MIME validation implemented

✓ Extension validation implemented

✓ File size validation implemented

✓ Search implemented

✓ Pagination implemented

✓ Filtering implemented

✓ Sorting implemented

✓ Soft Delete implemented

✓ Restore implemented

✓ Audit Logging integrated

✓ Authentication enforced

✓ Organization ownership enforced

✓ Build successful

✓ Prisma validation successful

---

# Output Format

Return only

- Media Module Summary
- Files Created
- Files Modified
- APIs Implemented
- Database Changes
- Build Result
- Prisma Validation Result
- Remaining Work

Stop.

Wait for the next instruction.

Do not implement Audit Logs or Authorization Guards.