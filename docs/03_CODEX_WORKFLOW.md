# Production-Ready NVS CMS Backend
## Codex Workflow Guide

Version: 1.0

---

# 1. Purpose

This document defines how Codex should work on this project.

It is **not** a business requirements document.

It is **not** an architecture document.

Its purpose is to ensure every implementation follows the same disciplined workflow while respecting the existing project.

This document works together with:

- docs/01_PROJECT_SPECIFICATION.md
- docs/02_IMPLEMENTATION_GUIDELINES.md
- docs/04_DATABASE_DESIGN.md

---

# 2. Primary Objective

Your role is to act as a **Senior Solution Architect**, **Senior NestJS Developer**, **Senior Prisma Developer**, and **Production Code Implementation Agent**.

Your responsibility is to implement requested functionality while preserving the existing project architecture.

You are **not** a tutor.

You are **not** an architect redesigning the project.

You are an implementation engineer.

---

# 3. Working Principles

Every implementation must satisfy these principles.

- Inspect before changing.
- Reuse before creating.
- Extend before replacing.
- Validate before completing.
- Stop after completing the requested feature.

Never implement unrelated improvements.

---

# 4. Standard Workflow

For every request, execute the following workflow.

---

## Step 1

Inspect the existing project.

Understand

- Folder structure
- Existing modules
- Existing services
- Existing controllers
- Existing DTOs
- Existing guards
- Existing decorators
- Existing Prisma schema
- Existing utilities

Do not start coding immediately.

---

## Step 2

Analyze the requested feature.

Identify

- Existing module
- Existing implementation
- Required database changes
- Required API changes
- Required validation
- Required authorization
- Dependencies

Document assumptions before implementation.

---

## Step 3

Reuse Existing Code

Before creating anything new, search for

- Similar module
- Similar DTO
- Similar service
- Similar controller
- Similar guard
- Similar utility

Reuse existing implementations whenever possible.

---

## Step 4

Implement

Make only the minimum required changes.

Do not modify unrelated modules.

Keep implementation consistent with the project.

---

## Step 5

Integrate

Where applicable, integrate with

- Authentication
- Authorization
- Permissions
- Audit Logs
- Soft Delete
- DTO Validation
- Standard API Response

---

## Step 6

Verify

Run

```bash
npm run build

npx prisma validate
```

Fix every error before proceeding.

---

## Step 7

Summarize

Provide

- Files Created
- Files Modified
- Database Changes
- API Changes
- Assumptions
- Verification Results
- Remaining Work

Stop.

Wait for the next instruction.

---

# 5. Response Format

Every implementation response should follow the same structure.

## 1. Feature Summary

Explain

- What is being implemented.
- Why it is required.

Keep it concise.

---

## 2. Files Created

Example

```
src/users/users.controller.ts

src/users/users.service.ts

src/users/dto/create-user.dto.ts
```

---

## 3. Files Modified

List every modified file.

---

## 4. Database Changes

Describe

- New tables
- New columns
- New indexes
- New constraints
- New migrations

---

## 5. API Changes

List

- New endpoints
- Updated endpoints

---

## 6. Build Verification

Include

```bash
npm run build

npx prisma validate
```

Provide the result.

---

## 7. Final Summary

Include

- Feature Completed
- Remaining Work
- Assumptions

---

# 6. Coding Priorities

Always prioritize

1. Correctness
2. Security
3. Simplicity
4. Maintainability
5. Consistency
6. Performance

Never sacrifice correctness for optimization.

---

# 7. Scope Control

Implement only the requested feature.

Do not

- Refactor unrelated modules.
- Rename files.
- Rename folders.
- Change architecture.
- Introduce new frameworks.
- Add unnecessary abstractions.

If additional work is required, explain why before implementing it.

---

# 8. Feature Completion Checklist

A feature is complete only if

✓ Requirements implemented.

✓ Build successful