# Backend Feature: Dynamic Header & Footer Menu Management

## Objective

Implement Dynamic Menu Management in the existing NVS backend.

The system has the following organization types:

SUPER_ADMIN
HEADQUARTER
NLI
REGIONAL_OFFICES
JNV

Public websites are available for:

HEADQUARTER
REGIONAL_OFFICES
NLI
JNV

Only SUPER_ADMIN should be able to manage menu configuration.

The system must support:

- Dynamic Header Menu
- Dynamic Footer Menu
- Organization-type-specific menu structures
- Parent/child menu hierarchy
- Multi-level submenus
- English and Hindi menu labels
- Content Type mapping
- Media Type mapping
- External URL mapping
- Same page / new page opening behavior
- Display ordering
- Active/inactive status
- Dynamic website menu retrieval

IMPORTANT:

Keep the existing architecture, authentication, authorization,
organization hierarchy, Page module, Media module, Content Type Master,
Media Type Master, response structure and validation conventions.

Do not redesign unrelated functionality.

Use snake_case for database columns and API fields.


============================================================
1. EXISTING ORGANIZATION HIERARCHY
============================================================

Preserve:

SUPER_ADMIN
├── HEADQUARTER
├── NLI
└── REGIONAL_OFFICES
      └── JNV

Menu configuration is based on:

organization_type_id

NOT individual organization_id.

One organization-type menu configuration should be reusable by all
websites belonging to that organization type.


============================================================
2. SUPER ADMIN ONLY MANAGEMENT
============================================================

Only SUPER_ADMIN can:

- Create menu items
- Update menu items
- Create submenus
- Change menu hierarchy
- Change display order
- Map Content Types
- Map Media Types
- Configure external URLs
- Configure link opening behavior
- Activate/deactivate menu items
- Manage Header menus
- Manage Footer menus

Reuse existing authentication and authorization.

Do not create a new authorization framework.


============================================================
3. MENU LOCATION
============================================================

Use one Menu module/table for:

HEADER
FOOTER

Add:

menu_location

Use numeric enum:

1 = HEADER
2 = FOOTER

Do NOT persist:

"HEADER"
"FOOTER"

Use application constants/enums internally.

Conceptually:

MENU_LOCATION = {
    HEADER: 1,
    FOOTER: 2
}


============================================================
4. LINK TARGET
============================================================

Add a field:

link_target

This determines whether the destination should open in the same
browser page/tab or a new page/tab.

Use numeric enum:

1 = SAME_PAGE
2 = NEW_PAGE

Do NOT persist string values such as:

"SAME_PAGE"
"NEW_PAGE"
"_self"
"_blank"

Use constants internally:

LINK_TARGET = {
    SAME_PAGE: 1,
    NEW_PAGE: 2
}

Default:

link_target = 1

unless existing project conventions require a different default.

Frontend interpretation:

link_target = 1
→ open normally in the same page/tab

link_target = 2
→ open in a new page/tab


============================================================
5. EXTERNAL URL
============================================================

Add optional:

external_url

This allows SUPER_ADMIN to configure a menu item that points directly
to an external website or another URL instead of loading Content or
Media.

Example:

{
    "title_english": "CBSE Website",
    "title_hindi": "सीबीएसई वेबसाइट",
    "external_url": "https://www.cbse.gov.in/",
    "link_target": 2
}

Meaning:

Open:

https://www.cbse.gov.in/

in a new page/tab.

external_url must be nullable.


============================================================
6. MENU DATA MODEL
============================================================

Inspect existing architecture before finalizing migration.

Suggested model:

menus
-----
id

organization_type_id
menu_location
parent_menu_id

title_english
title_hindi

content_type_id
media_type_id
external_url

link_target

display_order
is_active

created_by
updated_by

created_at
updated_at

Use snake_case.

Do not create a separate footer_menus table.


============================================================
7. MENU DESTINATION TYPES
============================================================

A menu item may have one of these functional behaviors:

1. PARENT / CONTAINER
2. CONTENT
3. MEDIA
4. EXTERNAL URL

Do not necessarily add another menu_type column unless the existing
architecture needs it.

The destination can be inferred from the fields.


------------------------------------------------------------
PARENT
------------------------------------------------------------

content_type_id = NULL
media_type_id = NULL
external_url = NULL

The menu exists only to contain child menu items.


------------------------------------------------------------
CONTENT
------------------------------------------------------------

content_type_id = value
media_type_id = NULL
external_url = NULL

The website loads Page content using:

current organization_id
+
content_type_id


------------------------------------------------------------
MEDIA
------------------------------------------------------------

content_type_id = NULL
media_type_id = value
external_url = NULL

The website loads Media listing using:

current organization_id
+
media_type_id


------------------------------------------------------------
EXTERNAL URL
------------------------------------------------------------

content_type_id = NULL
media_type_id = NULL
external_url = valid URL

The website navigates directly to:

external_url


============================================================
8. DESTINATION MUTUAL EXCLUSIVITY
============================================================

Only ONE actionable destination should normally be configured.

Valid:

content_type_id = 10
media_type_id = NULL
external_url = NULL

Valid:

content_type_id = NULL
media_type_id = 5
external_url = NULL

Valid:

content_type_id = NULL
media_type_id = NULL
external_url = "https://example.com"

Valid parent:

content_type_id = NULL
media_type_id = NULL
external_url = NULL

Invalid:

content_type_id = 10
media_type_id = 5

Invalid:

content_type_id = 10
external_url = "https://example.com"

Invalid:

media_type_id = 5
external_url = "https://example.com"

Reject ambiguous mappings.


============================================================
9. EXTERNAL URL VALIDATION
============================================================

When external_url is provided:

- Validate it using the existing URL validation convention.
- Reject malformed URLs.
- Allow supported protocols according to existing security conventions.
- Prefer http/https.
- Do not accept unsafe schemes such as javascript:.

Valid example:

https://www.cbse.gov.in/

Invalid example:

javascript:alert(1)

Do not modify or silently rewrite the supplied URL unless the current
backend has a URL normalization convention.


============================================================
10. LINK TARGET BEHAVIOR
============================================================

link_target applies to actionable menu destinations.

For example:

Content menu:

{
    "content_type_id": 10,
    "link_target": 1
}

→ open generated Page route in same page/tab.


Media menu:

{
    "media_type_id": 5,
    "link_target": 1
}

→ open Media listing in same page/tab.


External URL:

{
    "external_url": "https://www.cbse.gov.in/",
    "link_target": 2
}

→ open external website in new page/tab.

The backend only stores and returns this configuration.

The frontend is responsible for applying browser navigation behavior.


============================================================
11. MENU HIERARCHY
============================================================

Use:

parent_menu_id

Root menus:

parent_menu_id = NULL

Support arbitrary nested menu depth.

Example:

Academic
│
├── School Administration
│   └── Facilities in JNVs
│       ├── Students
│       └── Teachers
└── Training
    ├── Training Centres
    └── Training Manual


============================================================
12. PARENT VALIDATION
============================================================

When parent_menu_id is supplied:

- Parent must exist.
- Parent and child must have the same organization_type_id.
- Parent and child must have the same menu_location.
- Circular hierarchy must not be allowed.

Do not allow a HEADER item to have a FOOTER parent.

Do not allow a JNV menu to have a HEADQUARTER parent.


============================================================
13. BILINGUAL MENU LABELS
============================================================

Support:

title_english
title_hindi

Example:

{
    "title_english": "Vision & Mission",
    "title_hindi": "दृष्टि एवं मिशन"
}

Do not automatically translate values.


============================================================
14. CONTENT MAPPING
============================================================

Content-based menu example:

Vision & Mission
      ↓
content_type_id
      ↓
Content Type Master

When clicked:

current organization_id
+
content_type_id
      ↓
Pages API

Conceptually:

GET /api/pages
    ?organization_id=<current_organization_id>
    &content_type_id=<menu_content_type_id>


============================================================
15. MEDIA MAPPING
============================================================

Media-based menu example:

Circulars
      ↓
media_type_id
      ↓
Media Type Master

When clicked:

current organization_id
+
media_type_id
      ↓
Media API

Conceptually:

GET /api/media
    ?organization_id=<current_organization_id>
    &media_type_id=<menu_media_type_id>

Multiple Media records with the same media_type_id should appear
under the same menu section.

Do NOT create one menu per uploaded document.


============================================================
16. CONTENT TYPE VALIDATION
============================================================

Whenever content_type_id is supplied:

Verify it exists in Content Type Master.

If it does not exist:

Reject the request.

Do not store invalid foreign-key mappings.


============================================================
17. MEDIA TYPE VALIDATION
============================================================

Whenever media_type_id is supplied:

Verify it exists in Media Type Master.

If it does not exist:

Reject the request.


============================================================
18. MASTER SEEDING
============================================================

Content Type Master and Media Type Master can be seeded.

Before adding master records:

1. Inspect existing masters.
2. Reuse existing equivalent records.
3. Add only missing required values.
4. Use idempotent seeders.
5. Do not create duplicates.


============================================================
19. STABLE MASTER CODES
============================================================

Do not make seed scripts depend on arbitrary numeric IDs.

Use stable codes.

Example Content Types:

ABOUT_US
CONTACT_US
COMMISSIONER_JNV
VISION_MISSION
PRINCIPAL_DESK
TERMS_CONDITIONS
PRIVACY_POLICY
COPYRIGHT_POLICY
HYPERLINK_POLICY
DISCLAIMER

Example Media Types:

NOTICE
CIRCULAR
TENDER
TRAINING_MATERIAL

These are examples.

Inspect existing master records first.


============================================================
20. MENU SEED MAPPING
============================================================

Seed definitions should reference stable master codes.

Example:

media_type_code = CIRCULAR

Seeder:

Find Media Type where code = CIRCULAR
        ↓
Get actual id
        ↓
Store menus.media_type_id

Do not scatter numeric master IDs through seed configuration.


============================================================
21. HEADER MENU
============================================================

Header uses:

menu_location = 1

Use the existing HQ, RO, NLI and JNV website navigation structures as
the baseline for initial Header menu seed data.

Preserve hierarchy and ordering.

Do not hardcode organization-instance-specific legacy paths.


============================================================
22. FOOTER MENU
============================================================

Footer uses:

menu_location = 2

Use the same Menu table/service.

Do not create a Footer-specific table.


============================================================
23. HEADQUARTER FOOTER
============================================================

Seed:

1. Terms & Conditions
2. Privacy Policy
3. Copyright Policy
4. Hyperlink Policy
5. Disclaimer

Map to appropriate Content Type Master records.


============================================================
24. REGIONAL OFFICE FOOTER
============================================================

Seed:

1. Terms & Conditions
2. Privacy Policy
3. Copyright Policy
4. Hyperlink Policy
5. Disclaimer

Do not hardcode old HQ/RO website URLs.


============================================================
25. JNV FOOTER
============================================================

Seed:

1. Terms & Condition
2. Disclaimer
3. Copyright Policy
4. Privacy Policy
5. Hyperlink Policy


============================================================
26. NLI FOOTER
============================================================

Seed:

1. Terms & Conditions
2. Privacy Policy
3. Copyright Policy
4. Hyperlink Policy
5. Disclaimer


============================================================
27. SITEMAP IS NOT A MENU ITEM
============================================================

Sitemap is NOT part of:

HEADER Menu
FOOTER Menu

Do NOT:

- Store Sitemap in menus.
- Seed Sitemap.
- Map Sitemap to Content Type.
- Map Sitemap to Media Type.

Sitemap must remain separate dynamic functionality.


============================================================
28. DYNAMIC SITEMAP
============================================================

Sitemap uses the Dynamic Sitemap route/functionality.

Conceptually:

Website
    ↓
Dynamic Sitemap Route
    ↓
Current organization / organization type
    ↓
Active navigation/site structure
    ↓
Generate Sitemap dynamically

If Sitemap functionality already exists:

Reuse it.

Do not make Sitemap dependent on Footer Menu.


============================================================
29. CREATE MENU EXAMPLES
============================================================

PARENT:

{
    "organization_type_id": 4,
    "menu_location": 1,
    "parent_menu_id": null,

    "title_english": "About Us",
    "title_hindi": "हमारे बारे में",

    "content_type_id": null,
    "media_type_id": null,
    "external_url": null,

    "link_target": 1,

    "display_order": 2,
    "is_active": true
}


CONTENT:

{
    "organization_type_id": 4,
    "menu_location": 1,
    "parent_menu_id": 10,

    "title_english": "Vision & Mission",
    "title_hindi": "दृष्टि एवं मिशन",

    "content_type_id": 12,
    "media_type_id": null,
    "external_url": null,

    "link_target": 1,

    "display_order": 1,
    "is_active": true
}


MEDIA:

{
    "organization_type_id": 4,
    "menu_location": 1,
    "parent_menu_id": 20,

    "title_english": "Circulars",
    "title_hindi": "परिपत्र",

    "content_type_id": null,
    "media_type_id": 6,
    "external_url": null,

    "link_target": 1,

    "display_order": 2,
    "is_active": true
}


EXTERNAL LINK:

{
    "organization_type_id": 4,
    "menu_location": 1,
    "parent_menu_id": null,

    "title_english": "CBSE",
    "title_hindi": "सीबीएसई",

    "content_type_id": null,
    "media_type_id": null,

    "external_url": "https://www.cbse.gov.in/",
    "link_target": 2,

    "display_order": 10,
    "is_active": true
}


FOOTER CONTENT LINK:

{
    "organization_type_id": 4,
    "menu_location": 2,
    "parent_menu_id": null,

    "title_english": "Privacy Policy",
    "title_hindi": null,

    "content_type_id": 15,
    "media_type_id": null,
    "external_url": null,

    "link_target": 1,

    "display_order": 2,
    "is_active": true
}


============================================================
30. MENU MANAGEMENT APIs
============================================================

Follow existing API conventions.

Conceptually:

POST   /api/menus
GET    /api/menus
GET    /api/menus/:id
PUT    /api/menus/:id

PATCH  /api/menus/:id/activate
PATCH  /api/menus/:id/deactivate

Only add delete/restore if consistent with existing architecture.


============================================================
31. MENU ADMIN FILTERS
============================================================

Support:

organization_type_id
menu_location
parent_menu_id
is_active
search

Examples:

GET /api/menus?organization_type_id=4&menu_location=1

GET /api/menus?organization_type_id=4&menu_location=2


============================================================
32. WEBSITE NAVIGATION API
============================================================

Return ready-to-render navigation.

Conceptually:

GET /api/menus/navigation
    ?organization_type_id=<id>
    &menu_location=1

for Header.

GET /api/menus/navigation
    ?organization_type_id=<id>
    &menu_location=2

for Footer.


============================================================
33. WEBSITE RESPONSE
============================================================

Each actionable menu should return enough data for the frontend to
determine its behavior.

Example:

{
    "id": 20,

    "title_english": "Circulars",
    "title_hindi": "परिपत्र",

    "content_type_id": null,
    "media_type_id": 6,
    "external_url": null,

    "link_target": 1,

    "display_order": 2,

    "children": []
}

External example:

{
    "id": 25,

    "title_english": "CBSE",
    "title_hindi": "सीबीएसई",

    "content_type_id": null,
    "media_type_id": null,

    "external_url": "https://www.cbse.gov.in/",
    "link_target": 2,

    "display_order": 10,

    "children": []
}


============================================================
34. FRONTEND INTERPRETATION
============================================================

The backend does not need to perform browser navigation.

Frontend logic can conceptually be:

IF content_type_id exists:
    open Page route

ELSE IF media_type_id exists:
    open Media listing

ELSE IF external_url exists:
    open external_url

ELSE:
    treat as Parent menu


Then:

IF link_target = 1:
    open same page/tab

IF link_target = 2:
    open new page/tab


============================================================
35. DISPLAY ORDER
============================================================

Ordering is scoped by:

organization_type_id
+
menu_location
+
parent_menu_id

Header and Footer ordering must remain independent.


============================================================
36. ACTIVE / INACTIVE
============================================================

Use:

is_active

Inactive menu items must not appear in normal website navigation.

If a parent is inactive, its descendants should not appear in the
effective menu tree.


============================================================
37. AUTHENTICATION
============================================================

Keep existing authentication unchanged.

Menu management uses:

Authorization: Bearer <access_token>

Do not modify JWT/login/logout/refresh behavior.


============================================================
38. AUTHORIZATION
============================================================

Only SUPER_ADMIN can mutate Menu configuration.

Existing organization roles cannot manage dynamic menus unless current
permissions explicitly say otherwise.

Website navigation read behavior should follow existing public website
API conventions.


============================================================
39. VALIDATION
============================================================

Validate:

organization_type_id
menu_location
parent_menu_id

title_english
title_hindi

content_type_id
media_type_id
external_url

link_target

display_order
is_active


menu_location:

1 = valid
2 = valid

Other values:
reject.


link_target:

1 = valid
2 = valid

Other values:
reject.


If content_type_id is provided:
→ verify it exists.

If media_type_id is provided:
→ verify it exists.

If external_url is provided:
→ validate URL.

Only one of:

content_type_id
media_type_id
external_url

may be configured for an actionable menu.


============================================================
40. SECURITY FOR EXTERNAL LINKS
============================================================

Do not allow unsafe URLs.

At minimum reject dangerous URL schemes such as:

javascript:
data:

unless the existing application has an explicitly approved requirement
for them.

Prefer:

http://
https://

according to current security conventions.

Do not render raw HTML from external_url.


============================================================
41. TESTS
============================================================

Add/update tests for:

AUTHORIZATION

1. SUPER_ADMIN can manage Menu.
2. Other roles cannot mutate Menu.

MENU LOCATION

3. menu_location=1 works.
4. menu_location=2 works.
5. Invalid menu_location is rejected.

LINK TARGET

6. link_target=1 is accepted.
7. link_target=2 is accepted.
8. Invalid link_target is rejected.
9. Default link_target is SAME_PAGE if omitted where applicable.

CONTENT

10. Valid content_type_id is accepted.
11. Invalid content_type_id is rejected.

MEDIA

12. Valid media_type_id is accepted.
13. Invalid media_type_id is rejected.

EXTERNAL URL

14. Valid HTTPS URL is accepted.
15. Valid HTTP URL is handled according to current policy.
16. Malformed URL is rejected.
17. javascript: URL is rejected.
18. External URL can use link_target=2.
19. External URL can use link_target=1 if allowed by normal navigation.

MUTUAL EXCLUSIVITY

20. content_type_id + media_type_id is rejected.
21. content_type_id + external_url is rejected.
22. media_type_id + external_url is rejected.
23. Parent with all three NULL is accepted.

HIERARCHY

24. Root Menu works.
25. Child Menu works.
26. Multi-level Menu works.
27. Circular hierarchy is rejected.
28. Parent and child organization_type_id must match.
29. Parent and child menu_location must match.

HEADER / FOOTER

30. Header and Footer can be retrieved independently.
31. Header query does not return Footer records.
32. Footer query does not return Header records.

SITEMAP

33. Sitemap is not stored in Menu.
34. Sitemap is not returned from Footer Menu.
35. Dynamic Sitemap remains independent.

SEEDING

36. Content Type seed is idempotent.
37. Media Type seed is idempotent.
38. Menu seed correctly resolves master IDs by stable codes.


============================================================
42. ACCEPTANCE CRITERIA
============================================================

The feature is complete when:

1. One Dynamic Menu module supports Header and Footer.

2. SUPER_ADMIN alone manages menus.

3. Menus are organization-type based.

4. menu_location is numeric:

1 = HEADER
2 = FOOTER

5. link_target is numeric:

1 = SAME_PAGE
2 = NEW_PAGE

6. Menu supports:

content_type_id

7. Menu supports:

media_type_id

8. Menu supports:

external_url

9. Content Type IDs are validated.

10. Media Type IDs are validated.

11. External URLs are validated.

12. Unsafe external URL schemes are rejected.

13. Only one actionable destination is allowed per menu.

14. Parent menus can have no destination.

15. Same-page opening is supported.

16. New-page/tab opening is supported.

17. Header menus support nested hierarchy.

18. Footer menus use the same architecture.

19. Existing HQ Header structure can be seeded.

20. Existing RO Header structure can be seeded.

21. Existing NLI Header structure can be seeded.

22. Existing JNV Header structure can be seeded.

23. Required Footer structures are seeded.

24. Content/Media master seeds are idempotent.

25. Menu seeds resolve master records by stable code.

26. Sitemap is NOT part of Menu Management.

27. Sitemap remains Dynamic Sitemap route/functionality.

28. Legacy organization-instance-specific URLs are not hardcoded.

29. Existing authentication remains unchanged.

30. Existing authorization remains unchanged.

31. Existing Pages remain unchanged.

32. Existing Media remains unchanged.

33. API/database naming remains snake_case.

34. Swagger/OpenAPI is updated.

35. Postman is updated.

36. Automated tests are included.

37. No unrelated architecture is redesigned.


============================================================
43. CODEX EXECUTION INSTRUCTIONS
============================================================

Before modifying code, inspect:

1. Organization Type Master
2. SUPER_ADMIN authentication/authorization
3. Existing Content Type Master
4. Existing Media Type Master
5. Page implementation
6. Media implementation
7. Website/public APIs
8. Existing Menu implementation, if any
9. Existing Sitemap implementation
10. Migration conventions
11. Seeder conventions
12. Swagger/OpenAPI
13. Postman
14. Automated tests

Then provide a concise impact analysis.

Implement the smallest maintainable change.

Do not redesign unrelated modules.


============================================================
FINAL DATA MODEL
============================================================

                    ORGANIZATION_TYPE
                            ↓
                           MENU
                            │
                ┌───────────┴───────────┐
                │                       │
       menu_location = 1       menu_location = 2
             HEADER                  FOOTER
                │                       │
                └───────────┬───────────┘
                            │
                     parent_menu_id
                            │
          ┌─────────────────┼─────────────────┐
          ↓                 ↓                 ↓
 content_type_id      media_type_id      external_url
          ↓                 ↓                 ↓
 CONTENT_TYPE          MEDIA_TYPE        EXTERNAL SITE
    MASTER               MASTER
          ↓                 ↓
        PAGES              MEDIA


link_target:

1 = SAME_PAGE
2 = NEW_PAGE


SITEMAP:

Website
   ↓
Dynamic Sitemap Route / Functionality
   ↓
Generate Sitemap dynamically

Sitemap does NOT belong in the Menu table.


============================================================
FINAL GUIDING PRINCIPLE
============================================================

Build one centrally managed Dynamic Menu system for Header and Footer.

Only SUPER_ADMIN can configure it.

Every actionable menu item may point to exactly one of:

1. Content Type
2. Media Type
3. External URL

Parent/container menus may point to none.

Use:

menu_location = 1 → HEADER
menu_location = 2 → FOOTER

Use:

link_target = 1 → SAME PAGE
link_target = 2 → NEW PAGE/TAB

Validate Content and Media mappings against their existing master
tables.

Validate external URLs and reject unsafe URL schemes.

Keep Sitemap separate as Dynamic Sitemap functionality.

Preserve all existing authentication, authorization, Page, Media and
organization behavior.