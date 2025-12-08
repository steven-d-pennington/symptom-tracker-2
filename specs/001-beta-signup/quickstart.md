# Quickstart: Beta Signup Form

**Feature**: 001-beta-signup
**Date**: 2025-12-07

## Prerequisites

- Node.js 18+
- npm 9+
- Resend account with API key

## Setup

### 1. Install Dependencies

```bash
npm install resend
```

### 2. Configure Environment

Create or update `.env.local`:

```env
RESEND_API_KEY=re_your_api_key_here
```

Get your API key from [Resend Dashboard](https://resend.com/api-keys).

### 3. Verify Resend Domain (Optional)

For production, verify your sending domain in Resend dashboard. For development, use Resend's sandbox domain.

## Development

### Start Development Server

```bash
npm run dev
```

### Test the Flow

1. Open http://localhost:3000
2. You should see the beta signup form (not the dashboard)
3. Enter an email address and submit
4. Check your email for the unlock code
5. Navigate to /verify and enter the code
6. You should be redirected to /onboarding

### Verify Emails Sent

Check Resend dashboard for sent emails:
- User should receive unlock code email
- Admin (steven@spennington.dev) should receive notification

## Testing

### Run Unit Tests

```bash
npm test -- --testPathPattern="beta"
```

### Manual Testing Checklist

- [ ] Landing page shows beta form, not dashboard
- [ ] Invalid email shows validation error
- [ ] Valid email triggers email send
- [ ] User receives email with correct code
- [ ] Admin receives notification email
- [ ] /verify page loads correctly
- [ ] Wrong code shows error
- [ ] Correct code redirects to onboarding
- [ ] Verified user can access dashboard
- [ ] Clearing localStorage resets to beta form

## Troubleshooting

### Email Not Sending

1. Check RESEND_API_KEY is set in .env.local
2. Check Resend dashboard for API errors
3. Verify domain is set up in Resend (for production)

### Code Not Matching

1. Check localStorage in DevTools (key: `pst_beta_data`)
2. Verify code is being stored correctly
3. Check for case sensitivity issues (codes are uppercase)

### Redirect Not Working

1. Check browser console for errors
2. Verify localStorage `verified` flag is set to true
3. Clear localStorage and retry flow

## File Structure

After implementation, you should have:

```
app/
├── page.tsx                    # Modified with beta gating
├── api/
│   └── beta-signup/
│       └── route.ts            # Email sending endpoint
└── verify/
    └── page.tsx                # Code verification page

components/
└── Beta/
    ├── BetaSignupForm.tsx
    ├── CodeVerificationForm.tsx
    └── index.tsx

lib/
└── beta/
    ├── generateCode.ts
    ├── storage.ts
    ├── validation.ts
    ├── types.ts
    └── index.ts

__tests__/
└── lib/
    └── beta/
        ├── generateCode.test.ts
        ├── storage.test.ts
        └── validation.test.ts
```

## Next Steps

After implementation:

1. Run `npm test` to verify all tests pass
2. Run `npm run build` to verify build succeeds
3. Test on mobile viewport (320px-414px)
4. Test keyboard navigation
5. Deploy and test with real emails
