# Tasks: Beta Signup Form

**Input**: Design documents from `/specs/001-beta-signup/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit tests included per constitution requirement (Principle VI: Testing Standards)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/` for pages, `components/` for UI, `lib/` for business logic
- **Tests**: `__tests__/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create project structure for beta signup feature

- [x] T001 Install Resend package: `npm install resend`
- [x] T002 [P] Add RESEND_API_KEY to .env.example with placeholder value
- [x] T003 [P] Create lib/beta/ directory structure
- [x] T004 [P] Create components/Beta/ directory structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, utilities, and validation shared by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create TypeScript interfaces in lib/beta/types.ts (BetaStorageData, BetaSignupRequest, BetaSignupResponse)
- [x] T006 [P] Implement generateUnlockCode() function in lib/beta/generateCode.ts
- [x] T007 [P] Implement email validation (isValidEmail) in lib/beta/validation.ts
- [x] T008 [P] Implement code validation (isValidCode) in lib/beta/validation.ts
- [x] T009 [P] Implement localStorage helpers (saveBetaCode, getBetaData, markVerified, isBetaVerified) in lib/beta/storage.ts
- [x] T010 Create re-exports in lib/beta/index.ts
- [x] T011 [P] Create unit test for generateUnlockCode() in __tests__/lib/beta/generateCode.test.ts
- [x] T012 [P] Create unit test for validation functions in __tests__/lib/beta/validation.test.ts
- [x] T013 [P] Create unit test for storage helpers in __tests__/lib/beta/storage.test.ts

**Checkpoint**: Foundation ready - run `npm test` to verify all unit tests pass

---

## Phase 3: User Story 1 - Beta Signup Request (Priority: P1) 🎯 MVP

**Goal**: Users can enter their email on landing page and receive an unlock code via email

**Independent Test**: Submit email on landing page, check email for unlock code, verify admin notification received

### Implementation for User Story 1

- [x] T014 [P] [US1] Create BetaSignupForm component in components/Beta/BetaSignupForm.tsx with email input, submit button, loading state, error display
- [x] T015 [P] [US1] Create API route handler in app/api/beta-signup/route.ts with Resend integration for user and admin emails
- [x] T016 [US1] Create components/Beta/index.tsx with re-exports
- [x] T017 [US1] Create beta signup landing page layout component in components/Beta/BetaLandingPage.tsx (wraps BetaSignupForm with branding)
- [x] T018 [US1] Add error handling for Resend API failures in app/api/beta-signup/route.ts
- [x] T019 [US1] Add loading skeleton/spinner for email submission state in BetaSignupForm.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - email form works, emails are sent

---

## Phase 4: User Story 2 - Code Verification (Priority: P2)

**Goal**: Users can enter their unlock code and gain access to the application

**Independent Test**: Navigate to /verify, enter valid code, confirm redirect to /onboarding

### Implementation for User Story 2

- [x] T020 [P] [US2] Create CodeVerificationForm component in components/Beta/CodeVerificationForm.tsx with code input, submit button, error display
- [x] T021 [US2] Create verification page in app/verify/page.tsx with instructions and CodeVerificationForm
- [x] T022 [US2] Implement code verification logic - compare input to stored code, mark verified on success
- [x] T023 [US2] Add redirect to /onboarding after successful verification in app/verify/page.tsx
- [x] T024 [US2] Handle edge case: user navigates to /verify without stored code - show message to sign up first
- [x] T025 [US2] Handle edge case: user already verified - redirect to /onboarding or dashboard

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - full signup flow functional

---

## Phase 5: User Story 3 - Landing Page Gating (Priority: P3)

**Goal**: Landing page only shows beta signup form, no direct access to app features

**Independent Test**: Visit landing page, confirm no "Start Now" links visible, only beta signup form shown

### Implementation for User Story 3

- [x] T026 [US3] Modify app/page.tsx to check beta verification status on load
- [x] T027 [US3] Conditionally render BetaLandingPage for unverified users in app/page.tsx
- [x] T028 [US3] Keep existing dashboard for verified users in app/page.tsx
- [x] T029 [US3] Remove or hide all direct "Start Now" action card links for unverified users
- [x] T030 [US3] Add redirect from app pages to beta signup for unverified users (optional gate check)

**Checkpoint**: All user stories should now be independently functional - complete beta gating in place

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T031 [P] Add ARIA labels and accessibility attributes to BetaSignupForm.tsx
- [x] T032 [P] Add ARIA labels and accessibility attributes to CodeVerificationForm.tsx
- [x] T033 [P] Ensure 44px minimum touch targets on all form elements
- [x] T034 Add keyboard navigation support (Enter to submit, Tab order)
- [x] T035 [P] Add visible focus states for form inputs per constitution requirement
- [x] T036 Run `npm run build` to verify no TypeScript or build errors
- [x] T037 Run `npm test` to verify all tests pass
- [ ] T038 Manual test: Complete full flow from landing → signup → verify → onboarding
- [ ] T039 Manual test: Verify admin receives notification email at steven@spennington.dev

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - implements email signup
- **User Story 2 (Phase 4)**: Depends on Foundational - can run parallel to US1
- **User Story 3 (Phase 5)**: Depends on US1 and US2 being complete - integrates both flows
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Parallel to US1, shares storage.ts
- **User Story 3 (P3)**: Depends on US1 and US2 - integrates both into landing page

### Within Each User Story

- Foundational types/utils before components
- Components before pages
- Core implementation before edge cases
- Story complete before moving to next priority

### Parallel Opportunities

- T002, T003, T004 can run in parallel (Setup phase)
- T006, T007, T008, T009 can run in parallel (all independent utilities)
- T011, T012, T013 can run in parallel (independent test files)
- T014, T015 can run in parallel (component vs API route)
- T020 can start while US1 is being completed (independent component)
- T031, T032, T033, T035 can run in parallel (accessibility enhancements)

---

## Parallel Example: Foundational Phase

```bash
# Launch all utility implementations together:
Task: "Implement generateUnlockCode() in lib/beta/generateCode.ts"
Task: "Implement email validation in lib/beta/validation.ts"
Task: "Implement code validation in lib/beta/validation.ts"
Task: "Implement localStorage helpers in lib/beta/storage.ts"

# Launch all tests together after utilities complete:
Task: "Unit test for generateCode in __tests__/lib/beta/generateCode.test.ts"
Task: "Unit test for validation in __tests__/lib/beta/validation.test.ts"
Task: "Unit test for storage in __tests__/lib/beta/storage.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test email signup works end-to-end
5. Deploy/demo if ready - users can sign up but not yet verify

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test email signup → Emails work! (MVP!)
3. Add User Story 2 → Test verification → Full flow works!
4. Add User Story 3 → Test gating → Landing page protected!
5. Add Polish → Accessibility and final testing complete

### Single Developer Strategy

Execute in strict phase order:
1. Phase 1: Setup (15 min)
2. Phase 2: Foundational (1 hour)
3. Phase 3: User Story 1 (1.5 hours)
4. Phase 4: User Story 2 (1 hour)
5. Phase 5: User Story 3 (45 min)
6. Phase 6: Polish (45 min)

**Estimated Total**: 5-6 hours

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Resend API key must be configured in .env.local for email functionality
- localStorage key: `pst_beta_data` per data-model.md
