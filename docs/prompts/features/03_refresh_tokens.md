# Refresh Token Implementation

## Objective

Implement Refresh Token support for the **Production-Ready NVS CMS Backend**.

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

Implement only Refresh Token functionality while preserving the existing project architecture.

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

Extend the Authentication module with secure Refresh Token support.

Authentication has already been implemented.

This feature must only add

- Refresh Tokens
- Token Rotation
- Logout
- Token Revocation

Do not modify Login unless absolutely necessary.

---

# Scope

Implement only

- Refresh Token Service
- Refresh Token Validation
- Refresh Token Rotation
- Refresh Token Revocation
- Logout
- Refresh Token Repository (Prisma)
- Refresh Token Hashing
- Refresh Token Cleanup

Do not implement

- Authentication
- JWT Strategy
- Guards
- Password Reset
- MFA
- OAuth

---

# Existing Code Review

Before implementation

Inspect

- Authentication Module
- Login Implementation
- JWT Configuration
- User Model
- Refresh Token Model
- Prisma Schema

Reuse existing implementation wherever possible.

Do not duplicate code.

---

# Database

Use the existing

```
nvs_refresh_tokens
```

table.

Do not redesign the schema unless required.

Refresh Tokens should be stored hashed whenever practical.

---

# APIs

Implement

---

## Refresh Token

```
POST /api/auth/refresh
```

Authentication Required

```
No
```

Request

```json
{
  "refreshToken": "<REFRESH_TOKEN>"
}
```

Successful Response

```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "<NEW_ACCESS_TOKEN>",
    "refreshToken": "<NEW_REFRESH_TOKEN>"
  }
}
```

---

## Logout

```
POST /api/auth/logout
```

Authentication Required

```
Yes
```

Request

```json
{
  "refreshToken": "<REFRESH_TOKEN>"
}
```

Successful Response

```json
{
  "success": true,
  "message": "Logout successful."
}
```

---

# Refresh Token Flow

```
Validate Request

↓

Find Refresh Token

↓

Verify Exists

↓

Verify Not Revoked

↓

Verify Not Expired

↓

Load User

↓

Verify User Active

↓

Generate New Access Token

↓

Generate New Refresh Token

↓

Store New Refresh Token

↓

Revoke Previous Refresh Token

↓

Create Audit Log

↓

Return Response
```

---

# Logout Flow

```
Validate Request

↓

Find Refresh Token

↓

Revoke Refresh Token

↓

Create Audit Log

↓

Return Success
```

---

# Token Rotation

Implement Refresh Token Rotation.

Every successful refresh request must

- Generate a new Refresh Token.
- Revoke the previous Refresh Token.
- Generate a new Access Token.

Never reuse old Refresh Tokens.

---

# Refresh Token Validation

Validate

- Token Exists
- Token Not Revoked
- Token Not Expired
- User Exists
- User Active
- User Not Soft Deleted
- User Not Locked

Reject invalid Refresh Tokens immediately.

---

# Security

Refresh Tokens must

- Be securely generated.
- Be configurable through environment variables.
- Have configurable expiry.
- Be revoked on Logout.
- Be rotated on every Refresh.

Never return database identifiers.

---

# Audit Logging

Generate Audit Logs for

- Token Refresh
- Logout
- Refresh Token Revocation
- Invalid Refresh Attempt

---

# Integrations

Integrate with

- Authentication Module
- JWT Module
- Prisma Service
- Users Module
- Audit Logging

Do not modify unrelated modules.

---

# Constraints

Do NOT implement

- Password Reset
- MFA
- OAuth
- Social Login
- Email Verification
- OTP

Only implement Refresh Token functionality.

---

# Deliverables

Provide

## Files Created

Example

```
src/auth/dto/refresh-token.dto.ts
```

---

## Files Modified

List every modified file.

---

## APIs Implemented

- POST /api/auth/refresh
- POST /api/auth/logout

---

## Database Changes

List any required schema changes.

If none

```
No database schema changes required.
```

---

## Security Features

List implemented

- Refresh Token Rotation
- Refresh Token Revocation
- Refresh Token Validation
- Logout

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

✓ Refresh Token API implemented

✓ Logout implemented

✓ Token Rotation implemented

✓ Token Revocation implemented

✓ Secure Refresh Token storage implemented

✓ Audit Logging integrated

✓ Build successful

✓ Prisma validation successful

---

# Output Format

Return only

## Refresh Token Summary

## Files Created

## Files Modified

## APIs Implemented

## Security Features

## Database Changes

## Build Result

## Prisma Validation Result

## Remaining Work

Stop.

Wait for the next instruction.

Do not implement Permissions or Authorization.