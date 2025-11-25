# F030 - Symptom History View

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

---

## Overview

Timeline view of all symptom instances with filtering, sorting, and trend visualization.

---

## Requirements (from spec)

List all symptom instances chronologically. Filter by symptom type, date range, severity. Show frequency and severity trends.

---

## Technical Approach

### File Structure
```
app/symptoms/history/page.tsx, components/Symptoms/SymptomTimeline.tsx
```

### Database Operations
Query db.symptomInstances with filters. Aggregate by symptom type for frequency analysis.

---

## Acceptance Criteria

- [ ] Chronological list of symptom instances
- [ ] Filter by symptom type
- [ ] Filter by date range
- [ ] Filter by severity range
- [ ] Sort by date, severity, or symptom
- [ ] Shows symptom name, severity, location, timestamp
- [ ] Click to view full details
- [ ] Frequency chart per symptom
- [ ] Severity trend line chart
- [ ] Export symptom history

---

## Dependencies

Symptom logging (F029), Database schema (F003✅)

---

## References

- Specification: F-003: Symptom Tracking - Symptom instances timeline
