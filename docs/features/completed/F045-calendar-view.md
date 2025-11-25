# F045 - Calendar View

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

Calendar view of daily entries. Color-coded by health score. Quick navigation.

---

## Requirements (from spec)

Month/week view. Color code days by health score. Click day to view/edit entry. Pattern visualization.

---

## Technical Approach

### File Structure
```
app/daily/calendar/page.tsx, components/Daily/HealthCalendar.tsx
```

### Database Operations
Query DailyEntry by date range. Aggregate for visualization.

---

## Acceptance Criteria

- [ ] Month view calendar
- [ ] Week view option
- [ ] Days color-coded by health score
- [ ] Shows health score on each day
- [ ] Click day opens entry
- [ ] Empty days have "add entry" action
- [ ] Navigate prev/next month
- [ ] Today indicator
- [ ] Pattern detection (e.g., worse on Mondays)

---

## Dependencies

Daily reflection form (F044)

---

## References

- Specification: F-007: Daily Health Reflection - Calendar view
