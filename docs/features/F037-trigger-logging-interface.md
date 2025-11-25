# F037 - Trigger Logging Interface

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Low
**Estimated Effort:** 3-4 hours

---

## Overview

Log trigger exposures with intensity levels (low/medium/high). Quick log common triggers.

---

## Requirements (from spec)

Select trigger from active triggers. Set intensity. Optional notes. Timestamp.

---

## Technical Approach

### File Structure
```
app/triggers/page.tsx, components/Triggers/TriggerLogger.tsx, lib/triggers/logTrigger.ts
```

### Database Operations
Create TriggerEvent with triggerId, timestamp, intensity, notes.

---

## Acceptance Criteria

- [ ] Select trigger from active list
- [ ] Intensity selector (low/medium/high)
- [ ] Notes field
- [ ] Timestamp editable (defaults to now)
- [ ] Quick log mode (just trigger + intensity)
- [ ] Creates TriggerEvent in database
- [ ] Used for correlation analysis

---

## Dependencies

Database schema (F003✅), Trigger presets (F012✅)

---

## References

- Specification: F-005: Trigger Monitoring
