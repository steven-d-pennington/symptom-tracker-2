# Code Review: Pocket Symptom Tracker

**Date:** December 8, 2025
**Reviewer:** Claude Code
**Branch:** `claude/code-review-security-audit-011iAQNLdzdqHqPfCozpMqUU`
**Commit:** 2dc78f5

---

## Executive Summary

This comprehensive code review covers security vulnerabilities, test coverage, and best practices for the Pocket Symptom Tracker PWA. The codebase demonstrates solid foundational architecture with strong TypeScript usage and error handling, but has **critical security issues** that require immediate attention.

### Overall Score: 7.3/10

| Category | Score | Priority |
|----------|-------|----------|
| Security | 5/10 | CRITICAL |
| Test Coverage | 5/10 | HIGH |
| TypeScript Usage | 10/10 | - |
| Error Handling | 9/10 | - |
| Code Organization | 7/10 | MEDIUM |
| Performance | 6.5/10 | MEDIUM |
| Accessibility | 6/10 | MEDIUM |
| ESLint/Prettier | 4/10 | LOW |

---

## 1. Security Vulnerabilities

### 1.1 CRITICAL: XSS in PDF Report Generation

**Severity:** CRITICAL
**File:** `lib/export/exportPDF.ts`
**Lines:** 575-580, 600-601, 648, 810, 894, 928

**Issue:** User-controlled data is interpolated directly into HTML templates without escaping:

```typescript
// Line 575 - VULNERABLE
<td>${s.symptom.name}</td>

// Line 600-601 - VULNERABLE
<td>${m.medication.name} (${m.medication.dosage})</td>
```

The HTML is written via `document.write()` (line 969) to a print window.

**Proof of Concept:** Create a symptom named `<img src=x onerror="alert('XSS')">` and generate a PDF report.

**Fix:** Use the existing `sanitizeHTML()` function from `lib/utils.ts`:
```typescript
import { sanitizeHTML } from '../utils'
// Then:
<td>${sanitizeHTML(s.symptom.name)}</td>
```

---

### 1.2 CRITICAL: Vulnerable Next.js Dependency

**Severity:** CRITICAL
**CVE:** GHSA-9qr9-h5gf-34mp
**CVSS:** 10.0

**Issue:** `package.json` declares `"next": "^15.0.0"` which allows installation of versions 15.5.0-15.5.6 containing a Remote Code Execution vulnerability.

**Fix:** Update to Next.js 15.5.7+:
```bash
npm install next@latest
```

---

### 1.3 HIGH: Insecure GUID Generation

**Severity:** HIGH
**File:** `lib/utils.ts`
**Lines:** 4-10

**Issue:** GUIDs are generated using `Math.random()` which is cryptographically insecure:

```typescript
export function generateGUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0  // INSECURE
    // ...
  })
}
```

**Impact:** GUIDs are used as primary identifiers for all database records. Predictable GUIDs could allow enumeration attacks if the database were exposed.

**Fix:**
```typescript
export function generateGUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback using crypto.getRandomValues()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
}
```

---

### 1.4 MEDIUM: dangerouslySetInnerHTML Usage

**Severity:** MEDIUM
**File:** `app/layout.tsx`
**Line:** 49

**Issue:** Uses `dangerouslySetInnerHTML` for theme initialization script.

**Assessment:** Current usage is safe (hardcoded script), but represents a code smell.

**Recommendation:** Consider using Next.js Script component or inline script tag.

---

### 1.5 LOW: Console Logging in Production

**Severity:** LOW
**Files:** 73 files with 122+ console statements

**Impact:** Minor information disclosure through debug logs.

**Recommendation:** Gate console logs behind debug flag or use structured logging.

---

### 1.6 Security Strengths

- Strong AES-256-GCM encryption for photos with per-photo keys
- No hardcoded secrets or API keys in source
- EXIF metadata properly stripped from photos
- CSV export properly escaped
- React auto-escaping protects JSX rendering
- TypeScript strict mode prevents many vulnerabilities

---

## 2. Test Coverage Analysis

### 2.1 Current State

| Metric | Value |
|--------|-------|
| Test Files | 4 |
| Total Test Cases | ~125 |
| Lines of Test Code | 1,678 |
| Implementation LOC | 32,643 |
| Test-to-Code Ratio | 5.1% |
| Estimated Coverage | <20% |
| Configured Threshold | 50% |

### 2.2 Test Files

```
__tests__/
├── integration/
│   └── flareLifecycle.test.ts (667 lines) ✅
└── lib/
    ├── analytics/
    │   └── correlation.test.ts (234 lines) ✅
    ├── hs/
    │   └── ihs4.test.ts (525 lines) ✅
    └── photos/
        └── encryption.test.ts (252 lines) ⚠️
```

### 2.3 Critical Coverage Gaps

#### Data Import/Export (CRITICAL)
**Files:** `lib/export/exportJSON.ts`, `importData.ts`, `exportCSV.ts`, `exportPDF.ts`
**Risk:** Users could lose all health data
**Untested:**
- Backup file validation
- Multi-table export with metadata
- Import mode selection (merge vs replace)
- Photo data handling

#### Component Suite (CRITICAL)
**Files:** 91 component files (17,151 LOC)
**Impact:** UI/UX bugs, accessibility violations
**Coverage:** 0%

#### Daily Entry Management (HIGH)
**File:** `lib/daily/saveDailyEntry.ts` (226 LOC)
**Untested:**
- Create/update logic
- Date range queries
- Average score calculations

#### Hurley Staging System (HIGH)
**File:** `lib/hs/hurley.ts` (349 LOC)
**Untested:**
- Stage determination algorithm
- Region status CRUD
- Worst stage calculation

#### Lesion Management (HIGH)
**Files:** `lib/hs/lesions/*.ts` (5 files, 500+ LOC)
**Untested:**
- All CRUD operations
- State transitions

### 2.4 Test Quality Assessment

| Aspect | Rating |
|--------|--------|
| Test Helpers | Excellent |
| Edge Case Coverage | Good |
| Assertion Quality | Good |
| Mocking Strategy | Fair |
| Test Isolation | Good |

### 2.5 Recommendations

1. **Increase coverage threshold** to 70% in `jest.config.js`
2. **Add pre-commit hooks** with husky/lint-staged
3. **Create component test suite** using React Testing Library
4. **Priority tests to add:**
   - `__tests__/lib/export/importExport.test.ts`
   - `__tests__/lib/daily/saveDailyEntry.test.ts`
   - `__tests__/lib/hs/hurley.test.ts`
   - `__tests__/lib/hs/lesions.test.ts`

---

## 3. Best Practices Review

### 3.1 TypeScript Usage: Excellent (10/10)

- **No `any` types** found (strict mode enforced)
- **205+ interface/type definitions**
- **77 components** with explicit Props interfaces
- **Proper return type annotations**
- **Good use of discriminated unions** for error handling

### 3.2 Error Handling: Excellent (9/10)

**Strengths:**
- Centralized error handling in `lib/errors/errorHandler.ts`
- Error Boundary with fallback UI and recovery
- 45+ try-catch blocks with consistent patterns
- Structured logging with timestamps

### 3.3 React/Next.js Patterns: Good (7.5/10)

**Strengths:**
- Proper `'use client'` directives on all interactive pages
- Dynamic imports for Three.js (SSR avoidance)
- Error Boundary implemented

**Issues:**
- **useLiveQuery not used** despite CLAUDE.md recommendation (0 instances)
- **No React.memo** on large components (BodyMap: 476 lines, BodyMap3D: 960 lines)
- **No useMemo/useCallback** in many performance-critical areas

**Fix Example:**
```typescript
// Instead of:
const [lesions, setLesions] = useState([])
useEffect(() => {
  db.hsLesions.toArray().then(setLesions)
}, [])

// Use:
const lesions = useLiveQuery(() => db.hsLesions.toArray())
```

### 3.4 Code Organization: Good (7/10)

**Strengths:**
- Clear directory structure (lib/, components/, app/)
- Domain-driven organization (lib/hs/, lib/analytics/)
- 15 barrel exports for clean imports

**Files Needing Refactoring (>500 lines):**

| File | Lines | Action |
|------|-------|--------|
| `lib/export/exportPDF.ts` | 1013 | Split into reportBuilder, formatter, exporter |
| `components/BodyMap3D/BodyMap3D.tsx` | 960 | Extract shaders, marker component |
| `lib/admin/dataGenerator.ts` | 861 | Move to test fixtures |
| `app/settings/export/page.tsx` | 844 | Extract export/import components |

### 3.5 Accessibility: Partial (6/10)

**Present:**
- SkipLink component implemented
- Main content marked with `id="main-content"`
- 59 accessibility attributes found

**Missing:**
- ARIA labels on SVG regions and interactive elements
- Modal dialogs missing `role="dialog"`, `aria-modal`
- Keyboard navigation not fully implemented
- Color contrast verification needed

### 3.6 ESLint/Prettier: Minimal (4/10)

**Current .eslintrc.json:**
```json
{
  "extends": "next/core-web-vitals"
}
```

**Missing:**
- No Prettier configuration
- No console.log warnings
- No import ordering rules
- No unused variable rules

**Recommended .eslintrc.json:**
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "error",
    "import/order": ["warn", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"]
    }]
  }
}
```

---

## 4. Code Duplication

**Severity:** Low (mostly domain-specific)

**Patterns to consolidate:**

1. **Loading State Pattern** (27+ instances)
   ```typescript
   const [isLoading, setIsLoading] = useState(true)
   useEffect(() => {
     loadData().finally(() => setIsLoading(false))
   }, [])
   ```
   **Solution:** Create `useAsyncData` hook

2. **Modal State Management** (5+ modals)
   **Solution:** Create `useModal` hook

3. **Form Validation** (multiple forms with ~40% similar code)
   **Solution:** Create generic `FormField` component

---

## 5. TODO Comments

Found 3 TODO comments representing legitimate future work:

| File | Line | Comment |
|------|------|---------|
| `app/flares/[id]/page.tsx` | 259 | `// TODO: Implement export functionality (F060)` |
| `app/flares/[id]/page.tsx` | 331 | `// TODO: Implement photo upload (F046)` |
| `lib/correlationAnalysis.ts` | 429 | `// TODO: Analyze food combinations` |

---

## 6. Action Items

### Immediate (This Week)

1. **Fix XSS vulnerability** in `lib/export/exportPDF.ts`
   - Apply `sanitizeHTML()` to all user data in templates

2. **Update Next.js** to version 15.5.7+
   ```bash
   npm install next@latest
   ```

3. **Fix GUID generation** in `lib/utils.ts`
   - Use `crypto.randomUUID()` with fallback

### Short-term (2 Weeks)

4. **Add missing tests**
   - Export/import pipeline tests
   - Daily entry tests
   - Hurley staging tests
   - Lesion management tests

5. **Implement useLiveQuery** in all page components

6. **Add React.memo** to large components

### Medium-term (1 Month)

7. **Refactor large files** (>500 lines)

8. **Enhance ESLint configuration**

9. **Add Prettier configuration**

10. **Improve accessibility**
    - Add ARIA labels
    - Implement keyboard navigation
    - Verify color contrast

11. **Create component test suite**
    - Set up React Testing Library
    - Test all HS components
    - Test form validations

---

## 7. Security Summary Matrix

| # | Type | Severity | File | Lines | Issue |
|---|------|----------|------|-------|-------|
| 1 | XSS | CRITICAL | exportPDF.ts | 575-580, 600-601 | Unescaped user data in HTML |
| 2 | Dependency | CRITICAL | package.json | N/A | Next.js RCE vulnerability |
| 3 | Crypto | HIGH | utils.ts | 4-10 | Math.random() for GUIDs |
| 4 | Code Smell | MEDIUM | layout.tsx | 49 | dangerouslySetInnerHTML |
| 5 | Info Disc. | LOW | Multiple | 122 instances | Console logging |

---

## 8. Conclusion

The Pocket Symptom Tracker has a **solid architectural foundation** with excellent TypeScript usage, strong encryption for photos, and good error handling. However, there are **critical security issues** that require immediate attention:

1. **XSS vulnerability** in PDF export must be fixed before any production release
2. **Next.js dependency** should be updated to patch RCE vulnerability
3. **Test coverage** is dangerously low at <20% and needs significant improvement

The codebase demonstrates good coding practices overall, but would benefit from:
- Performance optimizations (memoization, useLiveQuery)
- Enhanced accessibility features
- Stricter linting and formatting rules
- Refactoring of large files

**Recommended Priority:**
1. Security fixes (CRITICAL)
2. Test coverage improvements (HIGH)
3. Performance optimizations (MEDIUM)
4. Code organization improvements (LOW)

---

*Review completed by Claude Code on December 8, 2025*
