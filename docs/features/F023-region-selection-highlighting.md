# F023 - Region Selection & Highlighting

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Low
**Estimated Effort:** 2-3 hours

---

## Overview

Highlight body regions on hover and selection. Show visual feedback when regions contain flares.

---

## Requirements (from spec)

Regions highlight on hover. Selected region stays highlighted. Regions with flares have distinct styling.

---

## Technical Approach

### File Structure
```
components/BodyMap/BodyRegion.tsx, styles/bodyMap.css
```

### Database Operations
Query db.flares to check which regions have flares

---

## Acceptance Criteria

- [ ] Regions highlight on hover
- [ ] Selected region visually distinct
- [ ] Regions with flares show indicator
- [ ] Hover shows region name tooltip
- [ ] Touch targets ≥ 44px

---

## Dependencies

Body map SVG (F020)

---

## References

- Specification: F-001: Precision Body Mapping - Region selection
