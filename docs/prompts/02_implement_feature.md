Implement only the <FEATURE> module.

Before writing any code:

1. Read the project documentation:
   - docs/01_PROJECT_SPECIFICATION.md
   - docs/02_IMPLEMENTATION_GUIDELINES.md
   - docs/04_DATABASE_DESIGN.md
   - docs/03_CODEX_WORKFLOW.md

2. Inspect the existing implementation.

3. Identify similar modules and reusable code.

Reuse existing:

- Modules
- Services
- DTOs
- Guards
- Decorators
- Utilities
- Prisma models

Do not redesign the architecture.

Do not modify unrelated modules.

Implement only what is required for <FEATURE>.

Integrate where applicable:

- Authentication
- Authorization
- Role Permissions
- User Permission Overrides
- Audit Logs
- Soft Delete
- DTO Validation
- Standard API Response

If database changes are required:

- Update Prisma schema
- Create migration
- Update seed if required

After implementation:

Run

npm run build

npx prisma validate

Fix every error before stopping.

Provide only:

- Files Created
- Files Modified
- Database Changes
- API Changes
- Build Result
- Prisma Validation Result
- Remaining Work

Stop.