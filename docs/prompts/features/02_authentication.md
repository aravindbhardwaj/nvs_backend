# Authentication Implementation

## Objective

Implement the Authentication module for the **Production-Ready NVS CMS Backend**.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

Implement only the authentication foundation while preserving the existing project architecture.

Do not redesign the architecture.

---

# Project Documentation

Before making any changes, read and understand the following documents.

These documents are the single source of truth.

1. docs/01_PROJECT_SPECIFICATION.md
2. docs/02_IMPLEMENTATION_GUIDELINES.md
3. docs/04_DATABASE_DESIGN.md
4. docs/03_CODEX_WORKFLOW.md

---

# Goal

Implement a production-ready Authentication module.

This feature establishes the authentication foundation required for all secured APIs.

Refresh Tokens are **not** part of this feature.

---

# Scope

Implement only

- Authentication Module
- Login API
- JWT Access Token
- Password Hashing
- JWT Strategy
- JwtAuthGuard
- CurrentUser Decorator
- Password Validation
- Account Status Validation
- Account Lock Validation
- Authentication Service
- Authentication Controller

Do not implement

- Refresh Tokens
- Logout
- Role Permissions
- User Permission Overrides
- Business Modules

---

# Existing Code Review

Before implementation

Inspect

- Existing Auth Module
- Existing User Module
- Existing Prisma Models
- Existing Guards
- Existing Decorators
- Existing Configuration
- Existing Environment Variables

Reuse existing implementation wherever possible.

Do not duplicate code.

---

# APIs

Implement only

---

## Login

```
POST /api/auth/login
```

Authentication Required

```
No
```

Request

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Successful Response

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "<JWT_ACCESS_TOKEN>",
    "user": {
      "id": 1,
      "name": "Super Admin",
      "email": "admin@nvs.gov.in",
      "role": "SUPER_ADMIN",
      "organizationId": 1
    }
  }
}
```

Error Responses

- Invalid Credentials
- Account Locked
- User Inactive
- User Deleted

---

# Authentication Flow

Every login request must execute

```
Validate Request

↓

Find User

↓

Verify User Exists

↓

Verify Active Status

↓

Verify Soft Delete Status

↓

Verify Account Lock

↓

Compare Password

↓

Generate JWT Access Token

↓

Update Last Login

↓

Create Audit Log

↓

Return Response
```

---

# JWT

Implement

JWT Access Token only.

Payload

```
userId

organizationId

role
```

Never include

- Password
- Email
- Permissions
- Organization Details

Use environment variables for

- Secret
- Expiry

---

# Password Handling

Passwords must

- Be hashed using bcrypt
- Never be returned
- Never be logged
- Never be stored in plain text

Password comparison must always use bcrypt.

---

# Account Validation

During authentication verify

- User Exists
- User Active
- User Not Soft Deleted
- User Not Locked

Reject authentication immediately if validation fails.

---

# Failed Login Tracking

Track

```
failed_login_attempts

locked_until
```

Increment failed attempts.

Lock account after configured threshold.

Update database accordingly.

---

# Audit Logging

Generate Audit Log for

- Successful Login
- Failed Login
- Account Locked

Do not implement Audit Log APIs.

Only integrate with the existing Audit Log service if available.

---

# Integrations

Integrate with

- Users Module
- Prisma Service
- JWT Module
- Passport Module
- Config Module
- Audit Logging
- Validation Pipe

Do not integrate Refresh Tokens.

---

# Constraints

Do NOT implement

- Refresh Token
- Logout
- Password Reset
- Email Verification
- MFA
- OAuth
- Social Login
- OTP
- SSO

Implement only authentication.

---

# Deliverables

Provide

## Files Created

Example

```
src/auth/auth.module.ts

src/auth/auth.controller.ts

src/auth/auth.service.ts

src/auth/dto/login.dto.ts

src/auth/strategies/jwt.strategy.ts

src/auth/guards/jwt-auth.guard.ts

src/auth/decorators/current-user.decorator.ts
```

---

## Files Modified

List every modified file.

---

## APIs Implemented

List

- Login

---

## Database Changes

List any required schema changes.

If none

State

```
No database schema changes required.
```

---

## Authentication Components

List implemented

- JWT Strategy
- Guard
- Decorator
- Login Service

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

✓ Login implemented

✓ JWT Access Token generated

✓ Password hashing working

✓ JwtAuthGuard implemented

✓ JWT Strategy implemented

✓ CurrentUser Decorator implemented

✓ Account validation implemented

✓ Failed login tracking implemented

✓ Audit logging integrated

✓ Build successful

✓ Prisma validation successful

---

# Output Format

Return only

## Authentication Summary

## Files Created

## Files Modified

## APIs Implemented

## Authentication Components

## Database Changes

## Build Result

## Prisma Validation Result

## Remaining Work

Stop.

Wait for the next instruction.

Do not implement Refresh Tokens.