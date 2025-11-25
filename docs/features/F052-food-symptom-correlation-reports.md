# F052 - Food-Symptom Correlation Reports

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 5-6 hours

---

## Overview

Display food-symptom correlations with statistical significance, lag windows, and confidence levels.

---

## Requirements (from spec)

Show positive correlations (foods that increase symptoms). Negative correlations (foods that help). Sort by correlation strength.

---

## Technical Approach

### File Structure
```
app/analytics/correlations/page.tsx, components/Analytics/CorrelationTable.tsx
```

### Database Operations
Run correlation analysis, query FoodCombinationCorrelation results.

---

## Acceptance Criteria

- [ ] List of positive correlations (sorted by strength)
- [ ] List of negative correlations
- [ ] Shows: food name, symptom, correlation score, p-value
- [ ] Confidence level indicator
- [ ] Best lag window displayed
- [ ] Sample size shown
- [ ] Filter by symptom
- [ ] Filter by confidence level
- [ ] Timeline visualization of correlation
- [ ] Export correlation report

---

## Dependencies

Correlation engine (F009✅), Food logging (F039)

---

## References

- Specification: Workflow 6: Discovering Food-Symptom Correlations
