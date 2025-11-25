# F032 - Medication Library Management

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

Manage medication library: add custom medications, edit dosages, view side effects, enable/disable medications.

---

## Requirements (from spec)

CRUD operations for medications. Set dosage, frequency, schedule. Track side effects. Soft delete (set isActive=false).

---

## Technical Approach

### File Structure
```
app/medications/library/page.tsx, components/Medications/MedicationForm.tsx, lib/medications/manageMedication.ts
```

### Database Operations
Create, update Medication entities. Set isActive=false for soft delete. Query active medications.

---

## Acceptance Criteria

- [ ] List all medications (active and inactive)
- [ ] Add custom medication with name, dosage, frequency
- [ ] Edit medication details
- [ ] Set medication schedule (times/days)
- [ ] Add side effects list
- [ ] Disable medication (soft delete)
- [ ] Re-enable disabled medication
- [ ] Search/filter medications
- [ ] Sort by name, frequency, date added

---

## Dependencies

Database schema (F003✅)

---

## References

- Specification: Domain Entities: Medication
