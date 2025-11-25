# F018 - Trigger Selection Screen

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

---

## Overview

Screen for selecting environmental, lifestyle, and dietary triggers to monitor from 30+ presets.

---

## Requirements (from spec)

Select triggers organized by category (Environmental, Lifestyle, Dietary). Search and custom addition supported.

---

## Technical Approach

### File Structure
```
app/onboarding/steps/triggers.tsx
```

### Database Operations
Enable selected triggers from db.triggers presets

---

## Acceptance Criteria

- [ ] Triggers organized by category
- [ ] Search functionality
- [ ] Add custom triggers
- [ ] Skip option
- [ ] Persist selections

---

## Dependencies

Trigger presets (F012✅), Onboarding flow (F015)

---

## References

- Specification: Workflow 1: First-Time Setup - Step 3
