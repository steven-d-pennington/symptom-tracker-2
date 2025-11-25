# F017 - Medication Selection Screen

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

---

## Overview

Interactive screen for selecting medications to track from presets with dosage information.

---

## Requirements (from spec)

Similar to symptom selection but for medications. Includes common medications database with dosage defaults.

---

## Technical Approach

### File Structure
```
app/onboarding/steps/medications.tsx, components/onboarding/MedicationSelector.tsx
```

### Database Operations
Query db.medications where isDefault=true. Enable selected medications. Create custom medications.

---

## Acceptance Criteria

- [ ] Display preset medications with dosage info
- [ ] Search and filter medications
- [ ] Can add custom medication with name and dosage
- [ ] Skip option available
- [ ] Selections persist to database

---

## Dependencies

Database schema (F003✅), Onboarding flow (F015)

---

## References

- Specification: Workflow 1: First-Time Setup - Step 3
