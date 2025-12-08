# Feature Specification: Beta Signup Form

**Feature Branch**: `001-beta-signup`
**Created**: 2025-12-07
**Status**: Draft
**Input**: User description: "Add a beta signup form on the landing page with email verification using Resend, unlock code verification, and admin notification."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Beta Signup Request (Priority: P1)

A prospective user visits the landing page and wants to join the beta program. They enter their email address and submit the form to request access. The system generates a unique unlock code, saves it locally, sends an email with the code via Resend, and notifies the admin at steven@spennington.dev.

**Why this priority**: This is the core value proposition - without the ability to request beta access, no users can join the program.

**Independent Test**: Can be fully tested by submitting an email address on the landing page and verifying the email is received with an unlock code.

**Acceptance Scenarios**:

1. **Given** a user is on the landing page, **When** they enter a valid email address and click submit, **Then** an unlock code is generated and stored locally, an email is sent to the user with the code, and an email notification is sent to the admin.

2. **Given** a user enters an invalid email format, **When** they click submit, **Then** an inline validation error is displayed and no email is sent.

3. **Given** a user submits their email, **When** the email is successfully queued, **Then** the user is redirected to the verification page.

---

### User Story 2 - Code Verification (Priority: P2)

After receiving the beta access email, the user navigates to the verification page where they enter their unlock code. If the code matches the locally stored code, they are granted access and redirected to the onboarding flow.

**Why this priority**: This completes the access flow - users who received codes must be able to redeem them.

**Independent Test**: Can be fully tested by entering a valid unlock code on the verification page and confirming navigation to onboarding.

**Acceptance Scenarios**:

1. **Given** a user is on the verification page with a valid code stored locally, **When** they enter the correct unlock code, **Then** they are redirected to the onboarding page.

2. **Given** a user is on the verification page, **When** they enter an incorrect code, **Then** an error message is displayed indicating the code is invalid.

3. **Given** a user is on the verification page, **When** they enter an empty code and submit, **Then** a validation error is displayed.

---

### User Story 3 - Landing Page Gating (Priority: P3)

The landing page no longer shows direct links to start using the application. Users must go through the beta signup process to access the app.

**Why this priority**: This enforces the beta-only access model but depends on the signup mechanism being in place first.

**Independent Test**: Can be verified by visiting the landing page and confirming no "Start Now" or direct access links are visible.

**Acceptance Scenarios**:

1. **Given** a user visits the landing page, **When** the page loads, **Then** there are no visible links to start the application immediately (no "Start Now" buttons).

2. **Given** a user visits the landing page, **When** they look for ways to access the app, **Then** the only path forward is through the beta signup form.

---

### Edge Cases

- What happens when a user tries to sign up with an email that has already been submitted? Allow re-submission and generate a new code (overwrites previous).
- What happens if the email service (Resend) fails to send? Show user-friendly error message and allow retry.
- What happens if a user clears their browser storage before entering the code? They must re-submit their email to get a new code.
- What happens if a user navigates directly to the verification page without having a code stored? Show helpful message directing them to sign up first.
- What happens if a user has already verified and tries to verify again? Redirect to onboarding or dashboard.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a beta signup form on the landing page with an email input field and submit button.
- **FR-002**: System MUST validate email format before submission (standard email validation pattern).
- **FR-003**: System MUST generate a unique 6-character alphanumeric unlock code upon form submission.
- **FR-004**: System MUST store the generated unlock code in browser local storage for later verification.
- **FR-005**: System MUST send an email to the submitted address containing the unlock code via Resend integration.
- **FR-006**: System MUST send a notification email to steven@spennington.dev when a new beta signup occurs, including the user's email address.
- **FR-007**: System MUST redirect users to a verification page after successful email submission.
- **FR-008**: System MUST display a verification page with instructions to check email and an input field for the unlock code.
- **FR-009**: System MUST validate the entered code against the locally stored code.
- **FR-010**: System MUST redirect to the onboarding flow when a valid code is entered.
- **FR-011**: System MUST display clear error messages for invalid codes.
- **FR-012**: System MUST remove all "Start Now" or direct access links from the landing page.
- **FR-013**: System MUST handle email service failures gracefully with user-friendly error messages.

### Key Entities

- **Beta Signup Request**: Represents a user's request to join the beta program. Contains email address and generated unlock code.
- **Unlock Code**: A 6-character alphanumeric code used to verify beta access. Stored locally until verified.

## Assumptions

- The unlock code will be stored in localStorage as a temporary solution; a backend verification system will be implemented later.
- The Resend API key will be configured as an environment variable.
- Email templates will be simple text-based initially (HTML templates can be added later).
- The unlock code does not expire (for this MVP version).
- Users who clear localStorage will need to re-request a code.
- No rate limiting is implemented in this version (trusted beta audience).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the beta signup process (email submission through code verification) in under 2 minutes.
- **SC-002**: 95% of users who submit valid emails receive their unlock code email within 30 seconds.
- **SC-003**: 90% of users who receive a code successfully complete verification on their first attempt.
- **SC-004**: Admin receives notification emails for 100% of beta signup requests.
- **SC-005**: Zero users are able to access the application without going through the beta signup flow.
