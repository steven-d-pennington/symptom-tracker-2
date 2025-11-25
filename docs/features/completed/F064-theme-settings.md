# F064 - Theme Settings

**Status:** 🚀 TODO
**Priority:** LOW
**Complexity:** Low
**Estimated Effort:** 2-3 hours

---

## Overview

Theme selector: light, dark, or system preference.

---

## Requirements (from spec)

Radio buttons for theme selection. Preview. Persist to database. Apply immediately.

---

## Technical Approach

### File Structure
```
components/Settings/ThemeSelector.tsx
```

### Database Operations
Update User.theme.

---

## Acceptance Criteria

- [ ] Light theme option
- [ ] Dark theme option
- [ ] System preference option
- [ ] Theme preview
- [ ] Immediate application
- [ ] Persists to database
- [ ] Works across all pages

---

## Dependencies

Database schema (F003✅)

---

## References

- Specification: User preferences - Theme
