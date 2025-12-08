# Research: Beta Signup Form

**Feature**: 001-beta-signup
**Date**: 2025-12-07

## Research Topics

### 1. Resend Email Integration

**Decision**: Use Resend SDK with Next.js API routes

**Rationale**:
- Resend provides a simple, developer-friendly API for transactional emails
- Native TypeScript support with full type definitions
- Generous free tier (3,000 emails/month) suitable for beta
- Simple integration with Next.js API routes
- No need for complex email templating initially

**Alternatives Considered**:
- SendGrid: More complex setup, overkill for beta
- AWS SES: Requires AWS account setup, more configuration
- Nodemailer with SMTP: Requires SMTP server, less reliable
- Mailgun: Similar to Resend but less TypeScript-friendly

**Implementation Pattern**:
```typescript
// app/api/beta-signup/route.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { email, code } = await request.json()

  await resend.emails.send({
    from: 'beta@yourdomain.com',
    to: email,
    subject: 'Your Pocket Symptom Tracker Beta Access Code',
    text: `Your unlock code is: ${code}`
  })
}
```

### 2. Code Generation Strategy

**Decision**: Use crypto.getRandomValues() for 6-character alphanumeric codes

**Rationale**:
- Cryptographically secure random generation
- Available in all modern browsers and Node.js
- 6 characters from [A-Z0-9] = 36^6 = 2.18 billion combinations
- Human-readable and easy to type

**Alternatives Considered**:
- UUID: Too long for manual entry
- Math.random(): Not cryptographically secure
- Nanoid: Adds dependency, crypto.getRandomValues is sufficient

**Implementation Pattern**:
```typescript
// lib/beta/generateCode.ts
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing chars (0, O, 1, I)

export function generateUnlockCode(): string {
  const array = new Uint8Array(6)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map(byte => CHARS[byte % CHARS.length])
    .join('')
}
```

### 3. localStorage Storage Pattern

**Decision**: Use dedicated localStorage keys with JSON structure

**Rationale**:
- Simple API available in all browsers
- Persists across browser sessions
- No need for IndexedDB complexity for single value
- Can store email + code together for re-submission detection

**Storage Keys**:
- `pst_beta_code`: The generated unlock code
- `pst_beta_email`: The email address used
- `pst_beta_verified`: Boolean indicating verification complete

**Implementation Pattern**:
```typescript
// lib/beta/storage.ts
const STORAGE_PREFIX = 'pst_beta_'

export interface BetaStorageData {
  code: string
  email: string
  verified: boolean
  createdAt: number
}

export function saveBetaCode(email: string, code: string): void {
  localStorage.setItem(`${STORAGE_PREFIX}data`, JSON.stringify({
    code,
    email,
    verified: false,
    createdAt: Date.now()
  }))
}

export function getBetaData(): BetaStorageData | null {
  const data = localStorage.getItem(`${STORAGE_PREFIX}data`)
  return data ? JSON.parse(data) : null
}
```

### 4. Email Validation Pattern

**Decision**: Use HTML5 input type="email" with additional regex validation

**Rationale**:
- HTML5 provides native browser validation
- Additional regex catches edge cases
- Consistent with existing form patterns in the app
- No need for complex validation libraries

**Implementation Pattern**:
```typescript
// lib/beta/validation.ts
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= 254
}

export function isValidCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase())
}
```

### 5. Admin Notification Pattern

**Decision**: Send second email in same API call

**Rationale**:
- Simple to implement
- No additional infrastructure needed
- Admin receives immediate notification
- Can be easily disabled if overwhelming

**Implementation Pattern**:
```typescript
// In API route, after user email
await resend.emails.send({
  from: 'beta@yourdomain.com',
  to: 'steven@spennington.dev',
  subject: 'New Beta Signup',
  text: `New beta signup from: ${email}`
})
```

### 6. Landing Page Modification Strategy

**Decision**: Replace dashboard with beta signup form for unverified users

**Rationale**:
- Single page handles both states (verified/unverified)
- Simpler routing than separate landing page
- Existing onboarding check can be extended

**Implementation Pattern**:
```typescript
// app/page.tsx
export default function Home() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)

  useEffect(() => {
    const betaData = getBetaData()
    setIsVerified(betaData?.verified ?? false)
  }, [])

  if (isVerified === null) return <LoadingScreen />
  if (!isVerified) return <BetaSignupPage />

  // Existing dashboard code for verified users
  return <Dashboard />
}
```

## Dependencies to Add

```json
{
  "dependencies": {
    "resend": "^4.0.0"
  }
}
```

## Environment Variables Required

```env
RESEND_API_KEY=re_xxxxxxxxx
```

## Security Considerations

1. **Rate Limiting**: Not implemented in MVP (trusted beta audience)
2. **Code Brute Force**: 36^6 combinations, no rate limit concern for small beta
3. **Email Privacy**: Only email address transmitted; no health data
4. **localStorage Security**: Codes visible in DevTools but acceptable for MVP

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| How to handle duplicate emails? | Allow re-submission, generate new code, overwrite previous |
| Code expiration? | No expiration for MVP |
| Rate limiting? | Not needed for small beta |
| Email template format? | Plain text initially, HTML later |
