# Implementation Plan: Beta Signup Form

**Branch**: `001-beta-signup` | **Date**: 2025-12-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-beta-signup/spec.md`

## Summary

Implement a beta signup gating system that requires users to enter their email to receive an unlock code via Resend email service. The code is stored in localStorage for verification, and upon successful verification, users proceed to onboarding. The landing page will be modified to remove direct access links and display only the beta signup form.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15 (App Router) and React 19
**Primary Dependencies**: Next.js, React, Tailwind CSS, Resend (email API)
**Storage**: localStorage for unlock codes (temporary MVP approach)
**Testing**: Jest + React Testing Library
**Target Platform**: Web (PWA) - Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: FCP <1.5s, TTI <3s per constitution
**Constraints**: Offline-capable for main app (beta signup requires network for email)
**Scale/Scope**: Small beta audience (<100 users initially)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Reference: `.specify/memory/constitution.md`

| Principle | Compliance | Notes |
|-----------|------------|-------|
| I. Privacy First | ☑ PASS | Email sent via Resend is necessary for beta gating; no health data transmitted. Only email address leaves device for signup purpose. User's health data remains local. |
| II. Offline First | ☑ PASS with exception | Beta signup requires network (email sending). Once verified, app works offline. Documented as acceptable deviation for gating flow. |
| III. Accessibility Compliance | ☑ PASS | Form will have 44px touch targets, ARIA labels, keyboard navigation, visible focus states |
| IV. Type Safety | ☑ PASS | Strict TypeScript, explicit interfaces for all components and API responses |
| V. Data Integrity | ☐ N/A | No IndexedDB operations for this feature; localStorage only for beta code |
| VI. Testing Standards | ☑ PASS | Unit tests for code generation, validation; integration tests for signup flow |
| VII. Performance Requirements | ☑ PASS | Simple form components, no heavy loading; skeleton screens for email sending state |
| VIII. User Experience Consistency | ☑ PASS | Consistent validation patterns, clear error messages, loading states |

## Project Structure

### Documentation (this feature)

```text
specs/001-beta-signup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md           # API route contracts
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── page.tsx                    # Landing page (MODIFY: add beta form, remove direct links)
├── api/
│   └── beta-signup/
│       └── route.ts            # NEW: API route for Resend email sending
└── verify/
    └── page.tsx                # NEW: Verification page

components/
└── Beta/
    ├── BetaSignupForm.tsx      # NEW: Email input form component
    ├── CodeVerificationForm.tsx # NEW: Unlock code input component
    └── index.tsx               # NEW: Re-exports

lib/
└── beta/
    ├── generateCode.ts         # NEW: 6-char alphanumeric code generator
    ├── storage.ts              # NEW: localStorage helpers for code storage
    ├── validation.ts           # NEW: Email and code validation
    └── index.ts                # NEW: Re-exports

__tests__/
└── lib/
    └── beta/
        ├── generateCode.test.ts    # NEW: Unit tests
        ├── storage.test.ts         # NEW: Unit tests
        └── validation.test.ts      # NEW: Unit tests
```

**Structure Decision**: Follows existing Next.js App Router structure with new `/verify` route and `/api/beta-signup` API route. Components in `components/Beta/`, business logic in `lib/beta/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| External API (Resend) | Beta signup requires email delivery to distribute unlock codes | Manual code distribution would not scale and lacks verification |
| Network required for signup | Email must be sent to user | Cannot do fully offline beta signup without email |
