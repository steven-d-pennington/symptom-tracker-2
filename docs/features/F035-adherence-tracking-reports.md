# F035 - Adherence Tracking & Reports

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

Calculate medication adherence percentage. Show missed doses. Trend over time. Export adherence report.

---

## Requirements (from spec)

Calculate: (doses taken / doses scheduled) × 100. Show weekly/monthly adherence. List missed doses.

---

## Technical Approach

### File Structure
```
app/medications/adherence/page.tsx, lib/medications/calculateAdherence.ts
```

### Database Operations
Query MedicationEvent where taken=true vs taken=false. Group by medication and time period.

---

## Acceptance Criteria

- [ ] Overall adherence percentage
- [ ] Per-medication adherence percentage
- [ ] Weekly adherence trend chart
- [ ] Monthly adherence trend
- [ ] List of missed doses with dates
- [ ] Reasons for missed doses (from notes)
- [ ] Export adherence report (PDF/CSV)
- [ ] Date range selector

---

## Dependencies

Medication logging (F034)

---

## References

- Specification: F-004: Medication Management - Adherence tracking
