# API Contracts: Beta Signup Form

**Feature**: 001-beta-signup
**Date**: 2025-12-07

## Endpoints

### POST /api/beta-signup

Sends beta signup emails (user unlock code + admin notification).

#### Request

**Content-Type**: `application/json`

```typescript
interface BetaSignupRequest {
  email: string    // User's email address
  code: string     // 6-character unlock code (generated client-side)
}
```

**Example**:
```json
{
  "email": "user@example.com",
  "code": "ABC123"
}
```

#### Response

**Success (200 OK)**:
```typescript
interface BetaSignupResponse {
  success: true
  message: string  // "Unlock code sent to your email"
}
```

```json
{
  "success": true,
  "message": "Unlock code sent to your email"
}
```

**Validation Error (400 Bad Request)**:
```typescript
interface BetaSignupErrorResponse {
  success: false
  error: string    // Human-readable error message
}
```

```json
{
  "success": false,
  "error": "Invalid email format"
}
```

**Server Error (500 Internal Server Error)**:
```json
{
  "success": false,
  "error": "Failed to send email. Please try again."
}
```

#### Request Validation

| Field | Validation | Error Message |
|-------|------------|---------------|
| email | Required | "Email is required" |
| email | Valid format | "Invalid email format" |
| email | Max 254 chars | "Email too long" |
| code | Required | "Code is required" |
| code | 6 chars, alphanumeric | "Invalid code format" |

#### Behavior

1. Validate request body
2. Send unlock code email to user via Resend
3. Send notification email to admin (steven@spennington.dev)
4. Return success response

**Note**: Both emails are sent in parallel for performance. If admin email fails, user email success is still returned.

## Email Templates

### User Unlock Code Email

**From**: `Pocket Symptom Tracker <beta@[domain]>` (or Resend default)
**To**: `{user_email}`
**Subject**: `Your Pocket Symptom Tracker Beta Access Code`

**Body (Plain Text)**:
```
Welcome to Pocket Symptom Tracker Beta!

Your unlock code is: {CODE}

Enter this code at the verification page to access the app.

Questions? Reply to this email.
```

### Admin Notification Email

**From**: `Pocket Symptom Tracker <beta@[domain]>` (or Resend default)
**To**: `steven@spennington.dev`
**Subject**: `New Beta Signup: {user_email}`

**Body (Plain Text)**:
```
New beta signup request:

Email: {user_email}
Code: {CODE}
Time: {timestamp}
```

## Error Handling

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| Missing email | 400 | `{ success: false, error: "Email is required" }` |
| Invalid email format | 400 | `{ success: false, error: "Invalid email format" }` |
| Missing code | 400 | `{ success: false, error: "Code is required" }` |
| Invalid code format | 400 | `{ success: false, error: "Invalid code format" }` |
| Resend API error | 500 | `{ success: false, error: "Failed to send email. Please try again." }` |
| Missing API key | 500 | `{ success: false, error: "Email service not configured" }` |

## Environment Requirements

```env
RESEND_API_KEY=re_xxxxxxxxx
```

The API route MUST check for the presence of `RESEND_API_KEY` and return a 500 error if not configured.

## TypeScript Interfaces

```typescript
// lib/beta/types.ts

export interface BetaSignupRequest {
  email: string
  code: string
}

export interface BetaSignupResponse {
  success: boolean
  message?: string
  error?: string
}
```
