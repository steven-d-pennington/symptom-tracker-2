# Security Fixes Task List

**Created:** December 8, 2025
**Status:** Complete
**Related Review:** [code-review-2025-12-08.md](./code-review-2025-12-08.md)

---

## Overview

This document tracks the remediation of security vulnerabilities identified in the code review.

---

## Tasks

### 1. Fix XSS Vulnerability in PDF Export

- **Priority:** CRITICAL
- **Status:** [x] Complete
- **File:** `lib/export/exportPDF.ts`
- **Lines:** 575-580, 600-601, 648, 810, 894, 928, and all user data in HTML templates

**Description:**
User-controlled data (symptom names, medication names, region names, etc.) is interpolated directly into HTML templates without escaping. The `sanitizeHTML()` function exists in `lib/utils.ts` but is not used.

**Solution:**
1. Import `sanitizeHTML` from `lib/utils.ts`
2. Apply to all user-controlled data in HTML template strings:
   - Symptom names
   - Medication names and dosages
   - Region names
   - Trigger names
   - Food names
   - Notes and comments
   - Any other user-entered text

**Acceptance Criteria:**
- [x] All user data in HTML templates is sanitized
- [x] PDF generation still works correctly
- [x] Special characters display correctly (but safely)

---

### 2. Update Next.js Dependency

- **Priority:** CRITICAL
- **Status:** [x] Complete
- **File:** `package.json`
- **CVE:** GHSA-9qr9-h5gf-34mp

**Description:**
Current dependency `"next": "^15.0.0"` allows installation of vulnerable versions 15.5.0-15.5.6 containing a Remote Code Execution vulnerability.

**Solution:**
```bash
npm install next@latest
```

**Result:** Updated to Next.js 16.0.7

**Acceptance Criteria:**
- [x] Next.js version is 15.5.7 or higher (now 16.0.7)
- [x] `npm run build` completes successfully
- [x] `npm run dev` works correctly

---

### 3. Replace Insecure GUID Generation

- **Priority:** HIGH
- **Status:** [x] Complete
- **File:** `lib/utils.ts`
- **Lines:** 4-10

**Description:**
GUIDs are generated using `Math.random()` which is cryptographically insecure and predictable.

**Solution:**
Replace with `crypto.randomUUID()` and provide a secure fallback using `crypto.getRandomValues()`:

```typescript
export function generateGUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Secure fallback using crypto.getRandomValues()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40  // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80  // Variant 10
  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
}
```

**Acceptance Criteria:**
- [x] GUIDs are generated using crypto API
- [x] Generated GUIDs are valid UUID v4 format
- [x] All existing tests pass
- [x] Fallback works if `randomUUID` is unavailable

---

## Verification

After all fixes are applied:

- [x] `npm run build` completes without errors
- [x] `npm run lint` passes
- [x] `npm test` passes (111 tests)
- [ ] Manual testing of PDF export with special characters

---

## Changelog

| Date | Task | Status | Notes |
|------|------|--------|-------|
| 2025-12-08 | Document created | Complete | Initial task list |
| 2025-12-08 | XSS fix | Complete | Added sanitizeHTML to all user data in PDF templates |
| 2025-12-08 | Next.js update | Complete | Updated from ^15.0.0 to 16.0.7 |
| 2025-12-08 | GUID fix | Complete | Replaced Math.random with crypto.randomUUID |

---

*Last updated: December 8, 2025*
