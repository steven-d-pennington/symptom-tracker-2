# F034 - Medication Logging (Taken/Skipped)

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

Log when medication is taken or skipped. Track actual time vs scheduled time. Record dosage overrides.

---

## Requirements (from spec)

Quick log "taken" or "skipped". Editable timestamp. Dosage override. Notes for why skipped. Timing warnings.

---

## Technical Approach

### File Structure
```
components/Medications/MedicationLogger.tsx, lib/medications/logMedication.ts
```

### Database Operations
Create MedicationEvent with medicationId, timestamp, taken (boolean), dosageOverride, notes, timingWarning.

---

## Acceptance Criteria

- [ ] Quick action buttons: Taken / Skipped
- [ ] Timestamp editable (defaults to now)
- [ ] Dosage override field (if different from default)
- [ ] Notes field (especially for skipped)
- [ ] Timing warning (early/late/on-time)
- [ ] Creates immutable MedicationEvent
- [ ] Updates adherence stats
- [ ] Notification dismiss on log

---

## Dependencies

Medication library (F032), Database schema (F003✅)

---

## References

- Specification: Domain Entities: MedicationEvent
