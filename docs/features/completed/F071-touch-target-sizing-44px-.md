# F071 - Touch Target Sizing (≥44px)

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

Ensure all touch targets are at least 44x44px for mobile accessibility.

---

## Requirements (from spec)

Audit all buttons, links, inputs. Minimum 44x44px target size. Adequate spacing between targets.

---

## Technical Approach

### File Structure
```
styles/touchTargets.css, components/**/*.tsx
```

### Database Operations
No database operations. Client-side only.

---

## Acceptance Criteria

- [ ] All buttons ≥ 44x44px
- [ ] All links ≥ 44x44px
- [ ] All form inputs ≥ 44x44px
- [ ] Body map regions ≥ 44x44px
- [ ] Checkbox/radio buttons ≥ 44x44px
- [ ] Adequate spacing (≥ 8px between targets)
- [ ] Touch targets don't overlap
- [ ] Tested on mobile devices

---

## Dependencies

All UI components

---

## References

- Specification: F-001: Precision Body Mapping - Touch target size ≥ 44x44px
