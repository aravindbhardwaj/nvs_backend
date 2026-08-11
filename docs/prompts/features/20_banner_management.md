Implement a complete "Banner Image Management" feature in the existing application.

IMPORTANT:
Before writing code, inspect the existing project structure, authentication system, user roles, database models, API conventions, file-storage implementation, frontend components, UI patterns, validation approach, and coding standards.

Do not introduce a new architecture if an existing pattern can be reused.

GOAL

Create a Banner Management feature where authorized/respective users can upload and manage their own banner images.

Users must only be able to manage banners that they own or that belong to the entity/account they are authorized to manage.

The feature should support:

- Upload banner image
- View uploaded banners
- Preview banner
- Edit banner metadata
- Replace banner image
- Activate/deactivate banner
- Delete banner
- Control display order
- Set optional start/end display dates
- Secure ownership-based access

--------------------------------------------------
1. DATABASE / DATA MODEL
--------------------------------------------------

Create or extend the appropriate banner table/model following the project's existing conventions.

Suggested fields:

id
user_id / owner_id
title
description
image_url / image_path
alt_text
display_order
is_active
start_date
end_date
created_at
updated_at
created_by
updated_by

Use the project's existing ID strategy (UUID, bigint, etc.).

If the application is multi-tenant, also associate the banner with the appropriate tenant/account/organization/entity.

Do not blindly use user_id if the existing application already has a better ownership model.

Add indexes where appropriate, especially for:

owner/user
is_active
display_order

Create migrations using the project's existing migration system.

--------------------------------------------------
2. AUTHORIZATION
--------------------------------------------------

Banner management must respect the existing authentication and authorization model.

Rules:

- Users must be authenticated to manage banners.
- A normal user can only view/manage banners they own or are authorized to manage.
- A user must never be able to modify another user's banner by changing an ID in an API request.
- Administrators may manage all banners only if this is consistent with the application's existing role/permission system.
- Perform authorization on the backend, not only in the frontend.

Reuse existing middleware/guards/policies wherever possible.

--------------------------------------------------
3. IMAGE UPLOAD
--------------------------------------------------

Implement secure banner image upload.

Support common image formats:

JPG/JPEG
PNG
WEBP

Prefer configurable validation.

Validate:

- MIME type
- extension where applicable
- maximum file size
- empty/corrupt upload where practical

Use the application's existing file-storage solution.

If storage abstraction already exists, reuse it.

Do not store large image binaries directly in the database unless that is already the application's architecture.

Generate safe/unique filenames instead of trusting the original filename.

Return/store the resulting image path or URL.

Recommended banner dimensions should be shown in the UI.

If the existing project supports image processing, optionally optimize/compress the uploaded image while preserving reasonable quality.

--------------------------------------------------
4. BACKEND APIs
--------------------------------------------------

Follow the application's existing API conventions.

Implement equivalent endpoints/services for:

POST   /banners
GET    /banners
GET    /banners/:id
PUT/PATCH /banners/:id
DELETE  /banners/:id

Add an endpoint/action for activation/deactivation if that fits the existing API architecture.

List API should support:

pagination
sorting
active/inactive filtering
search by title where appropriate

Do not expose banners belonging to unauthorized users.

Example create payload conceptually:

multipart/form-data

image: <file>
title: string
description: string
alt_text: string
display_order: number
is_active: boolean
start_date: optional datetime
end_date: optional datetime

Validate that end_date is not earlier than start_date.

--------------------------------------------------
5. FRONTEND — BANNER MANAGEMENT
--------------------------------------------------

Add a Banner Management screen using the application's existing design system.

Suggested page:

Banner Management
------------------------------------------------

[ + Upload Banner ]

Search: [________________]     Status: [All ▼]

------------------------------------------------
Preview | Title | Status | Order | Dates | Actions
------------------------------------------------
image   | ...   | Active | 1     | ...   | Edit Delete
------------------------------------------------

Users should be able to:

- See their uploaded banners
- Preview images
- Upload a new banner
- Edit banner details
- Replace an existing image
- Enable/disable a banner
- Delete a banner
- Change display order

If the existing UI supports drag-and-drop ordering, use it.
Otherwise provide a simple numeric display-order field.

--------------------------------------------------
6. UPLOAD FORM
--------------------------------------------------

Create a clean upload/edit form.

Fields:

Banner Image *
Title
Description
Alt Text
Display Order
Active
Start Date
End Date

Include:

- Image preview before upload
- File validation messages
- Upload progress if supported by existing infrastructure
- Loading state
- Save/Cancel controls
- Success notification
- Error notification

Clearly display allowed file formats and maximum file size.

--------------------------------------------------
7. DELETE BEHAVIOR
--------------------------------------------------

Require confirmation before deletion.

Example:

"Are you sure you want to delete this banner?"

If the image is stored in application-controlled storage, safely remove the underlying file when appropriate.

Avoid deleting shared/external files accidentally.

--------------------------------------------------
8. PUBLIC/CONSUMER BANNER API
--------------------------------------------------

If banners are consumed by another frontend/mobile application, expose an appropriate read endpoint/service returning only currently displayable banners.

A banner is displayable when:

is_active = true

AND

start_date is null OR start_date <= current time

AND

end_date is null OR end_date >= current time

Return banners ordered by display_order.

Do not expose unnecessary internal fields.

--------------------------------------------------
9. SECURITY
--------------------------------------------------

Protect against:

- Unauthorized record access / IDOR
- Unsupported file uploads
- Oversized uploads
- Unsafe filenames
- Path traversal
- Malicious MIME-type spoofing where practical
- SQL injection
- XSS through title/description/alt text
- Unauthorized deletion/update

Do not trust user_id/owner_id supplied by the frontend.

Determine ownership from the authenticated session/token/context.

--------------------------------------------------
10. TESTING
--------------------------------------------------

Add tests consistent with the existing project.

Cover at minimum:

- Valid banner upload
- Invalid file type
- Oversized image
- Unauthenticated upload
- User can retrieve their banners
- User cannot retrieve another user's private management record
- User cannot edit another user's banner
- User cannot delete another user's banner
- Update metadata
- Replace image
- Activate/deactivate banner
- Delete banner
- Start/end date validation
- Correct display ordering
- Public endpoint only returns currently active/displayable banners

--------------------------------------------------
11. IMPLEMENTATION REQUIREMENTS
--------------------------------------------------

Before implementation:

1. Inspect the repository.
2. Identify frontend/backend frameworks.
3. Identify authentication/authorization.
4. Identify database and ORM/query layer.
5. Identify current file-upload/storage mechanism.
6. Identify existing UI components that can be reused.
7. Identify existing CRUD modules that should be used as the implementation pattern.

Then implement the feature end-to-end.

Do not:
- rewrite unrelated modules
- introduce unnecessary dependencies
- bypass existing authorization
- hardcode environment-specific URLs or paths

At completion provide:

1. Files created
2. Files modified
3. Database migration/schema changes
4. API endpoints added
5. Permissions/roles involved
6. Storage approach
7. Frontend screens/components added
8. Tests added
9. Environment/config changes
10. Manual testing steps