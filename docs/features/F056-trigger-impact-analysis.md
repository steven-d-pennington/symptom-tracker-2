# F056 - Trigger Impact Analysis

**Status:** 🚀 TODO
**Priority:** LOW
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

Analyze which triggers correlate with increased symptoms or flares.

---

## Requirements (from spec)

Calculate correlation between trigger events and symptom/flare occurrences. Rank triggers by impact.

---

## Technical Approach

### File Structure
```
components/Analytics/TriggerImpact.tsx, lib/analytics/analyzeTriggerImpact.ts
```

### Database Operations
Correlate TriggerEvent timestamps with SymptomInstance and Flare creation times.

---

## Acceptance Criteria

- [ ] List of triggers ranked by impact
- [ ] Shows: trigger name, correlation strength, occurrences
- [ ] Timeline showing trigger vs symptom correlation
- [ ] Most impactful triggers highlighted
- [ ] Avoidance recommendations
- [ ] Filter by symptom type

---

## Dependencies

Trigger tracking (F037-F038)

---

## References

- Specification: F-009: Analytics Dashboard - Trigger impact
