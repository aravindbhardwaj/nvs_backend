# Extend Existing Content & Media Management for Super Admin

## Objective

Extend the existing **SUPER_ADMIN** role so that, in addition to User Management, the Super Admin can manage **content, documents, and media across the existing organizational hierarchy**.

The current hierarchy is:

```txt
SUPER_ADMIN
├── HEADQUARTER
├── NLI
└── REGIONAL_OFFICES
      └── JNV
```

This hierarchy must be preserved.

Do not redesign the role structure, introduce generic entities, or create a parallel content-management architecture.

The primary goal is:

> **Extend access, not functionality.**

`SUPER_ADMIN` should be able to perform the same existing Content & Media Management actions across the hierarchy, including uploading content/documents/media on behalf of users within `HEADQUARTER`, `NLI`, `REGIONAL_OFFICES`, and their associated `JNV`s.

---

## Important Scope Constraint

Before making any changes, inspect the existing project and identify:

* Existing user model
* Existing role model
* Existing hierarchy between roles
* Existing `REGIONAL_OFFICES` → `JNV` relationship
* Existing content/document/media models
* Existing upload flow
* Existing APIs
* Existing validation
* Existing storage implementation
* Existing content statuses
* Existing supported content actions
* Existing frontend components
* Existing authorization and role-based restrictions

Reuse the current implementation.

Do not redesign:

```txt
Architecture
Database models
Role hierarchy
Permissions
Content lifecycle
Validation
Upload process
Storage
Business rules
Frontend flow
```

unless a minimal change is strictly required to enable `SUPER_ADMIN` access.

---

# Existing Hierarchy

Use the existing hierarchy exactly as implemented:

```txt
SUPER_ADMIN
│
├── HEADQUARTER
│
├── NLI
│
└── REGIONAL_OFFICES
       │
       └── JNV
```

`JNV` belongs under `REGIONAL_OFFICES`.

Do not treat `JNV` as an unrelated top-level organizational branch if the current system already associates JNVs with Regional Offices.

Do not introduce concepts such as:

```txt
Institution
Center
Partner
Organization
School Entity
Generic Entity
Entity Type
Generic Ownership
```

for this requirement.

Use the existing user, role, and hierarchy relationships.

---

# Functional Requirement

Currently, content/media/documents are managed according to existing roles, permissions, hierarchy, validation, and business processes.

Extend this functionality so that `SUPER_ADMIN` can manage content throughout the hierarchy.

Conceptually:

```txt
SUPER_ADMIN
    │
    ├── Manage HEADQUARTER content
    │
    ├── Manage NLI content
    │
    └── Manage REGIONAL_OFFICES content
             │
             └── Manage JNV content
```

`SUPER_ADMIN` should be able to perform the same content-management actions already supported by the application.

For example, if the current system supports:

```txt
View
Upload
Create
Edit
Modify
Activate
Deactivate
Preview
Download
```

then `SUPER_ADMIN` should be able to perform those existing actions across the hierarchy.

The exact supported actions must be determined from the current implementation.

Do not introduce new actions.

---

# Do Not Add Out-of-Scope Features

Do not introduce new functionality such as:

```txt
Change ownership
Reassign content
New delete functionality
Permanent delete
Review remarks/comments
New approval workflow
New archive/restore flow
New version management
New publish/unpublish flow
New visibility model
New lifecycle statuses
New audit infrastructure
New storage architecture
```

unless those capabilities already exist in the application.

If an action exists today, Super Admin may be given access to it.

If it does not exist today, it is outside this requirement.

---

# Key New Capability: Upload on Behalf of Hierarchy Users

The primary new capability is:

> `SUPER_ADMIN` can upload/add content, documents, or media on behalf of users within the existing hierarchy.

This includes:

```txt
HEADQUARTER
NLI
REGIONAL_OFFICES
JNV
```

Reuse the existing upload process.

The Super Admin upload flow should follow the hierarchy.

Example:

```txt
SUPER_ADMIN
     ↓
Select Role / Level
     ↓
Select Target User
     ↓
Existing Content / Media Form
     ↓
Existing Validation
     ↓
Existing Upload API / Service
     ↓
Existing Storage
     ↓
Content associated using existing relationships
```

Do not create separate content models for Super Admin uploads.

---

# Hierarchy-Aware Selection

The Super Admin UI should respect the organizational hierarchy when selecting the target.

## HEADQUARTER

```txt
Role:
HEADQUARTER

User:
[ Search / Select Headquarters User ]
```

## NLI

```txt
Role:
NLI

User:
[ Search / Select NLI User ]
```

## REGIONAL_OFFICES

```txt
Role:
REGIONAL_OFFICES

Regional Office:
[ Search / Select Regional Office ]
```

Use the actual existing user/office selection mechanism from the application.

## JNV

Because `JNV` belongs under `REGIONAL_OFFICES`, selection should preserve that relationship.

Conceptually:

```txt
Role:
JNV

Regional Office:
[ Select Regional Office ]

JNV:
[ Search / Select JNV ]
```

or use the equivalent existing relationship already implemented in the system.

Do not invent a new Regional Office → JNV relationship if it already exists.

Reuse the current mapping.

---

# JNV Upload Flow

For the JNV use case:

```txt
SUPER_ADMIN
    ↓
Select JNV
    ↓
Select / Resolve Regional Office
    ↓
Select Target JNV
    ↓
Existing Document Upload Form
    ↓
Existing Validation
    ↓
Upload
```

If the current system already derives the Regional Office from the selected JNV, do not require the user to manually select it again.

Prefer the simplest flow supported by the existing architecture.

For example:

```txt
Select Role: JNV
        ↓
Search JNV
        ↓
System already knows its Regional Office
        ↓
Existing Upload Form
```

---

# Preserve Regional Office → JNV Relationship

Do not flatten the hierarchy into:

```txt
HEADQUARTER
NLI
REGIONAL_OFFICES
JNV
```

as four unrelated target types.

The system should continue to recognize:

```txt
REGIONAL_OFFICES
      ↓
     JNV
```

where applicable.

Any existing filtering, authorization, data relationships, or UI behavior based on this hierarchy must remain intact.

---

# Backend Requirements

First identify the existing APIs responsible for:

```txt
Content listing
Content creation
Document upload
Media upload
Content update
Activate/deactivate
Preview/download
Existing content actions
User listing
Regional Office listing
JNV listing
Regional Office → JNV mapping
```

Prefer extending existing APIs rather than creating duplicate Super Admin APIs.

For example, if the current upload API is:

```http
POST /api/content/upload
```

reuse or minimally extend it.

If the API currently associates content with the logged-in user, allow an authorized `SUPER_ADMIN` to specify the target user using the existing user/content relationship.

Example only:

```json
{
  "userId": "<target-user-id>"
}
```

Do not add generic fields such as:

```json
{
  "entityType": "...",
  "entityId": "..."
}
```

unless this structure already exists.

---

# Authorization

Backend authorization is mandatory.

For `SUPER_ADMIN`:

```txt
SUPER_ADMIN
    ↓
Can manage content across:
    ├── HEADQUARTER
    ├── NLI
    └── REGIONAL_OFFICES
           └── JNV
```

For other roles, preserve existing access rules exactly as they are today.

Conceptually:

```ts
if (currentUser.role === 'SUPER_ADMIN') {
    allow existing content operations across the hierarchy;
} else {
    preserve existing authorization rules;
}
```

Use the current authorization implementation.

Do not introduce a new RBAC framework unless the project already requires one.

---

# Existing Role Behaviour Must Remain Unchanged

Existing behavior for:

```txt
HEADQUARTER
NLI
REGIONAL_OFFICES
JNV
```

must remain unchanged.

Do not broaden their access as part of this requirement.

For example:

```txt
REGIONAL_OFFICES
      ↓
Existing access to its JNVs
```

should continue to behave according to the current system.

Similarly:

```txt
JNV
   ↓
Existing content permissions
```

must remain unchanged.

Only `SUPER_ADMIN` is gaining broader content-management access.

---

# Validation

Do not create a separate Super Admin validation flow.

Reuse existing validation for:

```txt
Required fields
Document type
Content type
Category
File type
File size
Upload limits
Metadata
Role-specific validation
Regional Office / JNV relationships
Existing business rules
```

For example, if a JNV document currently requires certain metadata or validation, Super Admin uploading on behalf of that JNV must follow the same rules.

---

# Database

Do not redesign the database.

Inspect and reuse existing:

```txt
User model/table
Role field
Regional Office relationship
JNV relationship
Content tables
Document tables
Media tables
User-content relationship
Existing metadata/status fields
```

Do not introduce:

```txt
Generic entity tables
Polymorphic owner tables
New hierarchy model
Separate Super Admin content tables
Separate JNV content tables
```

unless the current implementation already uses something equivalent.

---

# Storage

Continue using the current upload/storage process.

Super Admin uploads must use the same storage mechanism as existing content uploads.

Do not introduce:

```txt
New storage provider
New upload service
New bucket hierarchy
New storage abstraction
```

for this requirement.

---

# Super Admin UI

Add Content & Media Management to the existing Super Admin interface.

Example:

```txt
SUPER_ADMIN

├── User Management
└── Content & Media Management
```

Reuse existing screens/components wherever possible.

---

# Content Listing

`SUPER_ADMIN` should be able to view content across the hierarchy.

The listing may include only the additional context required to identify where content belongs.

Example:

```txt
Title
Content / Document Type
Role
Regional Office
User / JNV
Status
Uploaded Date
Existing Actions
```

Only show `Regional Office` where relevant.

For example:

```txt
HEADQUARTER → Regional Office column can be empty/not applicable
NLI         → Regional Office column can be empty/not applicable
REGIONAL_OFFICES → show office
JNV         → show parent Regional Office where useful
```

Follow the existing UI patterns.

---

# Filters

Keep filtering minimal and hierarchy-aware.

Example:

```txt
Role:
[ All | HEADQUARTER | NLI | REGIONAL_OFFICES | JNV ]
```

When `JNV` is selected, optionally allow:

```txt
Regional Office:
[ All Regional Offices ▼ ]

JNV:
[ Search / Select JNV ]
```

When `REGIONAL_OFFICES` is selected:

```txt
Regional Office:
[ Search / Select ]
```

When `HEADQUARTER` or `NLI` is selected, do not show irrelevant Regional Office/JNV filters.

Reuse existing selectors and APIs.

---

# Upload Screen

Reuse the existing Content/Document/Media upload form.

For `SUPER_ADMIN`, add only the hierarchy-aware target selection.

Conceptual example:

```txt
Upload Content

Target Role:
[ HEADQUARTER | NLI | REGIONAL_OFFICES | JNV ]

Target:
[ Search / Select ]

-----------------------------

Existing Upload Form

Existing fields
Existing validations
Existing upload controls

[ Upload ]
```

For `JNV`, use the existing Regional Office → JNV relationship.

Do not create a separate JNV-specific content-management module.

---

# Edit / Manage Existing Content

When `SUPER_ADMIN` accesses content belonging to any level of the hierarchy, allow the Super Admin to perform the actions already supported by the application.

Example only:

```txt
View
Edit
Modify
Activate
Deactivate
Preview
Download
```

Only expose actions that already exist.

---

# API Changes

Keep API changes minimal.

First inspect the existing endpoints.

Possible extensions may include filtering existing content APIs by:

```txt
role
userId
regionalOfficeId
jnvId
```

but only use fields that already exist in the current data model.

For example:

```http
GET /api/content?role=JNV&regionalOfficeId=<id>
```

or:

```http
GET /api/content?userId=<target-user-id>
```

Use the actual current routing and DTO conventions.

Do not create an entirely new `/api/admin/content/*` API surface unless that pattern already exists.

---

# Security

A non-Super-Admin user must not be able to manipulate target user, Regional Office, or JNV IDs to gain additional access.

Conceptually:

```txt
Non-SUPER_ADMIN
+
Unauthorized target user / JNV / Regional Office
        ↓
Existing authorization rules
        ↓
DENY
```

while:

```txt
SUPER_ADMIN
+
Valid hierarchy target
        ↓
Existing validation
        ↓
ALLOW
```

Enforce this on the backend.

---

# Testing

Add tests specifically for expanded `SUPER_ADMIN` access.

At minimum verify:

```txt
SUPER_ADMIN can view HEADQUARTER content.

SUPER_ADMIN can view NLI content.

SUPER_ADMIN can view REGIONAL_OFFICES content.

SUPER_ADMIN can view JNV content.

SUPER_ADMIN can upload content for HEADQUARTER.

SUPER_ADMIN can upload content for NLI.

SUPER_ADMIN can upload content for REGIONAL_OFFICES.

SUPER_ADMIN can upload documents/content/media for JNV.

JNV selection respects the existing Regional Office → JNV relationship.

SUPER_ADMIN can perform existing supported actions across the hierarchy.

Existing validation still applies.

Existing upload/storage behavior remains unchanged.

Existing HEADQUARTER behavior remains unchanged.

Existing NLI behavior remains unchanged.

Existing REGIONAL_OFFICES behavior remains unchanged.

Existing JNV behavior remains unchanged.

Non-SUPER_ADMIN users cannot gain broader access by manipulating target identifiers.
```

Only add tests for actions and relationships that currently exist.

---

# Acceptance Criteria

The feature is complete when:

1. `SUPER_ADMIN` can access Content & Media Management.

2. The existing hierarchy is preserved:

```txt
SUPER_ADMIN
├── HEADQUARTER
├── NLI
└── REGIONAL_OFFICES
      └── JNV
```

3. `SUPER_ADMIN` can view content across all levels below Super Admin.

4. `SUPER_ADMIN` can upload content/documents/media on behalf of `HEADQUARTER`.

5. `SUPER_ADMIN` can upload content/documents/media on behalf of `NLI`.

6. `SUPER_ADMIN` can upload content/documents/media on behalf of `REGIONAL_OFFICES`.

7. `SUPER_ADMIN` can upload content/documents/media for `JNV`.

8. JNV continues to use its existing relationship with `REGIONAL_OFFICES`.

9. Existing upload forms and processes are reused.

10. Existing validations are reused.

11. Existing database models and relationships are reused.

12. Existing APIs/services are reused or minimally extended.

13. Existing storage implementation is reused.

14. `SUPER_ADMIN` can perform the existing supported content actions across the hierarchy.

15. No new content-management actions are introduced unless already supported.

16. No generic entity architecture is introduced.

17. No new ownership/reassignment feature is introduced.

18. No new delete behavior is introduced unless already present.

19. No new review/comment workflow is introduced unless already present.

20. Existing content lifecycle and business rules remain unchanged.

21. Existing behavior for `HEADQUARTER`, `NLI`, `REGIONAL_OFFICES`, and `JNV` remains unchanged.

22. Backend authorization protects the expanded Super Admin functionality.

23. No unrelated refactoring or architectural redesign is performed.

---

# Instructions for Cursor / Claude Code

Before changing any code, inspect the repository and provide a short implementation analysis covering:

```txt
1. Existing role implementation:
   - SUPER_ADMIN
   - HEADQUARTER
   - NLI
   - REGIONAL_OFFICES
   - JNV

2. Existing hierarchy implementation:
   SUPER_ADMIN
   ├── HEADQUARTER
   ├── NLI
   └── REGIONAL_OFFICES
         └── JNV

3. Existing REGIONAL_OFFICES → JNV mapping

4. Existing user/content relationships

5. Existing content/media/document models

6. Existing upload flow

7. Existing APIs

8. Existing supported content actions

9. Existing validation

10. Existing authorization checks

11. Existing frontend components

12. Minimum changes required to extend SUPER_ADMIN access
```

Do **not** start by creating new models, generic entity abstractions, APIs, workflows, or permissions.

After understanding the current architecture, implement the **smallest possible set of changes**.

## Guiding Principle

> **Extend access, not functionality.**

`SUPER_ADMIN` should gain broader access to the existing Content & Media Management functionality across:

```txt
HEADQUARTER
NLI
REGIONAL_OFFICES
      └── JNV
```

Preserve the existing hierarchy, architecture, database relationships, validation, APIs, storage, content lifecycle, and business processes.
