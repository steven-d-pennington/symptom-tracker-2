# F029 - Symptom Logging Interface

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

Interface for logging symptom occurrences with severity rating, optional location, duration, and notes.

---

## Requirements (from spec)

Quick log symptoms with 1-10 severity scale. Optional body location linking. Track duration and associated triggers. Add notes and photos.

---

## Technical Approach

### File Structure
```
app/symptoms/page.tsx, components/Symptoms/SymptomLogger.tsx, lib/symptoms/logSymptom.ts
```

### Database Operations
Create SymptomInstance with symptomId, timestamp, severity, optional bodyRegion/coordinates, duration, notes, photoIds.

---

## Acceptance Criteria

- [ ] Select symptom from active symptoms list
- [ ] Severity slider (1-10) with labels
- [ ] Optional body location selector (links to body map)
- [ ] Optional duration picker (minutes/hours)
- [ ] Optional trigger associations (multi-select)
- [ ] Notes field (unlimited text)
- [ ] Photo attachment option
- [ ] Timestamp editable (defaults to now)
- [ ] Creates SymptomInstance in database
- [ ] Quick log mode (just symptom + severity)
- [ ] Detailed log mode (all fields)

---

## Dependencies

Database schema (F003✅), Symptom presets (F011✅), Body map (F020)

---

## References

- Specification: F-003: Symptom Tracking
