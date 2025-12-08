# Data Model: Beta Signup Form

**Feature**: 001-beta-signup
**Date**: 2025-12-07

## Overview

This feature uses localStorage for data persistence (not IndexedDB) as a temporary MVP approach. The data model is intentionally simple.

## Entities

### BetaStorageData

Stored in localStorage under key `pst_beta_data`.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| code | string | 6-character alphanumeric unlock code | Required, uppercase, [A-Z0-9]{6} |
| email | string | User's email address | Required, valid email format, max 254 chars |
| verified | boolean | Whether code has been successfully verified | Required, default false |
| createdAt | number | Unix timestamp when code was generated | Required, must be ≤ Date.now() |

**Example**:
```json
{
  "code": "ABC123",
  "email": "user@example.com",
  "verified": false,
  "createdAt": 1733587200000
}
```

### API Request: BetaSignupRequest

Sent to `/api/beta-signup` endpoint.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| email | string | User's email address | Required, valid email format |
| code | string | Generated unlock code | Required, 6 chars |

### API Response: BetaSignupResponse

Returned from `/api/beta-signup` endpoint.

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Whether emails were sent successfully |
| message | string | Human-readable status message |
| error | string? | Error message if success is false |

## State Transitions

```
┌─────────────┐    submit email    ┌──────────────┐
│  No Data    │ ─────────────────► │  Code Stored │
│ (unverified)│                    │  (unverified)│
└─────────────┘                    └──────────────┘
                                          │
                                          │ correct code
                                          ▼
                                   ┌──────────────┐
                                   │   Verified   │
                                   │  (verified)  │
                                   └──────────────┘
                                          │
                                          │ proceed
                                          ▼
                                   ┌──────────────┐
                                   │  Onboarding  │
                                   └──────────────┘
```

## Storage Keys

| Key | Purpose |
|-----|---------|
| `pst_beta_data` | Main beta signup data (JSON) |

## Validation Rules

### Email Validation
- Must match regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Maximum length: 254 characters
- Cannot be empty or whitespace only

### Code Validation
- Exactly 6 characters
- Characters from set: A-Z, 0-9 (excluding 0, O, 1, I for readability)
- Case-insensitive comparison (stored uppercase)

## Data Lifecycle

1. **Creation**: When user submits email, code is generated and stored
2. **Verification**: When user enters correct code, `verified` is set to true
3. **Persistence**: Data remains in localStorage indefinitely (no expiration in MVP)
4. **Deletion**: User can clear browser storage; no in-app deletion mechanism

## Future Considerations

For backend implementation:
- Migrate to server-side code storage
- Add code expiration (e.g., 24 hours)
- Rate limiting on signup attempts
- Email verification status in database
- Admin dashboard for beta user management
