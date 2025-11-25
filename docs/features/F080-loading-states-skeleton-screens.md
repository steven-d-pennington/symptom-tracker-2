# F080 - Loading States & Skeleton Screens

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Low
**Estimated Effort:** 4-5 hours

---

## Overview

Loading indicators and skeleton screens for better perceived performance.

---

## Requirements (from spec)

Skeleton screens for data loading. Spinners for actions. Progress bars for uploads.

---

## Technical Approach

### File Structure
```
components/Loading/Skeleton.tsx, components/Loading/Spinner.tsx
```

### Database Operations
No database operations. UI only.

---

## Acceptance Criteria

- [ ] Skeleton screens for lists
- [ ] Skeleton for body map loading
- [ ] Spinner for database operations
- [ ] Progress bar for photo upload
- [ ] Loading states for > 500ms operations
- [ ] Smooth transitions
- [ ] Accessible (aria-busy)
- [ ] Cancellable long operations

---

## Dependencies

All features with data loading

---

## References

- Specification: UX-003: Immediate Feedback - Loading states for long operations
