# F044 - Daily Reflection Form

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

End-of-day comprehensive health entry with overall health, energy, sleep, stress, mood ratings.

---

## Requirements (from spec)

Single entry per day. Health/energy/sleep/stress scores (1-10). Mood selector. Aggregate symptoms/meds/triggers. Notes.

---

## Technical Approach

### File Structure
```
app/daily/page.tsx, components/Daily/DailyEntryForm.tsx, lib/daily/saveDailyEntry.ts
```

### Database Operations
Create or update DailyEntry with date as unique key. Store scores, mood, notes.

---

## Acceptance Criteria

- [ ] One entry per day (unique by date)
- [ ] Overall health score (1-10)
- [ ] Energy level (1-10)
- [ ] Sleep quality (1-10)
- [ ] Stress level (1-10)
- [ ] Mood selector (happy/neutral/sad/anxious/stressed)
- [ ] Auto-populate symptoms/meds from day
- [ ] Notes field
- [ ] Can edit existing entry
- [ ] Shows date prominently

---

## Dependencies

Database schema (F003✅)

---

## References

- Specification: F-007: Daily Health Reflection
