Implement a complete "Gallery Management" feature in the existing application.

IMPORTANT:
First inspect the repository and understand its current architecture, authentication, roles/permissions, database models, APIs, file storage, UI components, validation, and coding conventions.

Reuse existing patterns instead of introducing a parallel implementation.

GOAL

Create an image Gallery feature where respective/authorized users can upload and manage their own gallery images.

Users should be able to:

- Upload one or multiple gallery images
- View their gallery
- Preview images
- Edit image information
- Delete images
- Activate/deactivate images
- Reorder images
- Optionally organize images into albums/categories
- Manage only images they own or are authorized to manage

--------------------------------------------------
1. DATABASE / DATA MODEL
--------------------------------------------------

Create/extend the appropriate gallery model.

Suggested fields:

id
user_id / owner_id
album_id or category_id (optional)
title
description
image_url / image_path
thumbnail_url / thumbnail_path
alt_text
display_order
is_active
created_at
updated_at
created_by
updated_by

Use existing project conventions for IDs, timestamps and auditing.

If the application is multi-tenant, associate gallery images with the appropriate tenant/account/organization/entity rather than relying only on user_id.

Optional album/category model:

id
owner_id
name
description
cover_image
display_order
is_active
created_at
updated_at

Only add albums/categories if they fit the existing product architecture. Do not over-engineer the feature.

--------------------------------------------------
2. AUTHORIZATION
--------------------------------------------------

Integrate with the existing authentication/authorization system.

Rules:

- Only authenticated users can manage gallery images.
- Users can only manage images belonging to themselves or entities they are authorized to manage.
- Ownership must be verified server-side.
- Never trust owner_id/user_id received from the client.
- Admin access should follow existing role/permission rules.

Prevent IDOR vulnerabilities such as:

DELETE /gallery/{another_users_image_id}

or

PATCH /gallery/{another_users_image_id}

--------------------------------------------------
3. IMAGE UPLOAD
--------------------------------------------------

Support:

JPG/JPEG
PNG
WEBP

Allow:

- Single image upload
- Multiple image upload

Apply configurable limits for:

- Maximum file size per image
- Maximum number of images per request
- Supported MIME types

Use existing project storage infrastructure.

Generate safe unique filenames.

If image-processing infrastructure already exists, generate optimized gallery images and thumbnails.

Do not unnecessarily add an image-processing dependency if the project already has another solution.

--------------------------------------------------
4. BACKEND APIs
--------------------------------------------------

Follow existing API naming and response conventions.

Implement equivalent operations for:

POST   /gallery
GET    /gallery
GET    /gallery/:id
PUT/PATCH /gallery/:id
DELETE  /gallery/:id

Also support, where appropriate:

POST /gallery/bulk-upload
DELETE /gallery/bulk
PATCH /gallery/reorder

The exact route structure should follow the application's existing API conventions.

Gallery listing should support:

pagination
search
sorting
active/inactive filtering
album/category filtering if implemented

Only return records the authenticated user is allowed to manage.

--------------------------------------------------
5. MULTIPLE IMAGE UPLOAD
--------------------------------------------------

Create a multiple-image upload workflow.

The user should be able to select or drag-and-drop multiple images.

Before uploading, display previews such as:

-------------------------------------------
Upload Gallery Images
-------------------------------------------

[ Drop images here or Browse ]

┌─────────┐ ┌─────────┐ ┌─────────┐
│ Preview │ │ Preview │ │ Preview │
│   X     │ │   X     │ │   X     │
└─────────┘ └─────────┘ └─────────┘

3 images selected

[ Cancel ]                    [ Upload ]

Allow users to remove individual images from the pending upload before submission.

Display validation errors clearly.

--------------------------------------------------
6. GALLERY MANAGEMENT UI
--------------------------------------------------

Create a Gallery Management page consistent with the application's existing design.

Prefer a visual grid for images.

Example:

Gallery

[ + Upload Images ]       Search [____________]

[ All ] [ Active ] [ Inactive ]

------------------------------------------------

┌────────────┐  ┌────────────┐  ┌────────────┐
│            │  │            │  │            │
│   IMAGE    │  │   IMAGE    │  │   IMAGE    │
│            │  │            │  │            │
├────────────┤  ├────────────┤  ├────────────┤
│ Image One  │  │ Image Two  │  │ Image Three│
│ Active     │  │ Active     │  │ Inactive   │
│ Edit Delete│  │ Edit Delete│  │ Edit Delete│
└────────────┘  └────────────┘  └────────────┘

Use existing cards, dialogs, dropdowns, pagination and notification components where available.

--------------------------------------------------
7. IMAGE EDITING
--------------------------------------------------

Users should be able to edit:

Title
Description
Alt Text
Album/Category (if supported)
Display Order
Active/Inactive status

Optionally allow replacing the image if that matches existing product behavior.

Show the existing image when editing.

--------------------------------------------------
8. IMAGE PREVIEW
--------------------------------------------------

Clicking an image should provide a larger preview.

Use the project's existing modal/lightbox component if available.

Display useful metadata where appropriate:

Title
Description
Uploaded date

Do not introduce a new UI library solely for a lightbox if the existing design system can handle it.

--------------------------------------------------
9. REORDERING
--------------------------------------------------

Support gallery ordering.

Preferred behavior:

Drag image cards to reorder them.

Persist the new display_order to the backend.

If drag-and-drop would introduce unnecessary complexity or dependencies, provide a simple numeric display-order control instead.

The public gallery should always respect display_order.

--------------------------------------------------
10. DELETE
--------------------------------------------------

Require confirmation:

"Are you sure you want to delete this image?"

Support individual deletion.

Bulk deletion may be implemented if it fits naturally with the existing UI.

When deleting a database record, safely remove its associated storage object if the application owns that object.

Avoid orphan files where practical.

--------------------------------------------------
11. PUBLIC GALLERY
--------------------------------------------------

If gallery images need to be displayed publicly or in another application, expose an appropriate read API.

Only return:

is_active = true

images.

Sort using:

display_order ASC

then an appropriate deterministic secondary ordering such as created_at DESC.

Support pagination to prevent returning an unlimited number of images.

If albums/categories exist, allow filtering by album/category.

--------------------------------------------------
12. PERFORMANCE
--------------------------------------------------

Gallery pages may contain many images.

Optimize accordingly:

- Use pagination or incremental loading.
- Use thumbnails where supported.
- Lazy-load images in the frontend.
- Avoid returning original high-resolution images for small grid thumbnails when optimized versions exist.
- Avoid loading the entire gallery into memory unnecessarily.

--------------------------------------------------
13. SECURITY
--------------------------------------------------

Protect against:

- Unauthorized gallery access
- IDOR
- Invalid file uploads
- MIME-type spoofing where practical
- Oversized images
- Excessive files in one request
- Unsafe filenames
- Path traversal
- SQL injection
- XSS in image metadata
- Unauthorized bulk operations

Every update/delete operation must validate ownership or authorization server-side.

--------------------------------------------------
14. ERROR HANDLING
--------------------------------------------------

Provide useful errors for cases such as:

Unsupported image format
Image exceeds size limit
Too many images selected
Upload failed
Image not found
Unauthorized operation
Storage failure
Database failure

For bulk uploads, define clear behavior for partial failures.

Prefer atomic behavior when practical, or return per-file success/failure information if uploads cannot reasonably be atomic.

--------------------------------------------------
15. TESTING
--------------------------------------------------

Add tests following the project's existing test architecture.

Cover:

- Single image upload
- Multiple image upload
- Invalid MIME type
- Oversized image
- Maximum image-count validation
- Unauthenticated upload
- Retrieve user's gallery
- Pagination
- Search/filter
- Edit metadata
- Activate/deactivate
- Delete image
- User cannot edit another user's image
- User cannot delete another user's image
- Bulk upload authorization
- Bulk delete authorization
- Reordering
- Public gallery only exposes active images

--------------------------------------------------
16. IMPLEMENTATION PROCESS
--------------------------------------------------

Before changing code:

1. Inspect the complete relevant repository structure.
2. Identify frontend and backend technologies.
3. Locate authentication/authorization logic.
4. Identify database/ORM conventions.
5. Find existing upload/storage utilities.
6. Find an existing CRUD feature to use as a reference.
7. Find reusable UI components.
8. Determine how tenant/user ownership currently works.

Then implement Gallery Management end-to-end.

Do not modify unrelated functionality.

Do not hardcode:
- user IDs
- tenant IDs
- storage URLs
- filesystem locations
- environment-specific values

At completion provide:

1. Implementation summary
2. Files created
3. Files modified
4. Database migrations
5. API endpoints
6. Authorization rules
7. Storage implementation
8. Frontend components/pages
9. Tests
10. Configuration/environment changes
11. Manual testing instructions

Ensure the implementation is production-ready and consistent with the existing codebase.