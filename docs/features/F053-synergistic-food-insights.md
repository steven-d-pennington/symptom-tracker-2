# F053 - Synergistic Food Insights

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

Highlight food combinations with synergistic effects (combination correlation > individual + threshold).

---

## Requirements (from spec)

Detect when food combination correlation exceeds individual food correlations by 0.15+. Show which combinations amplify effects.

---

## Technical Approach

### File Structure
```
components/Analytics/SynergyInsights.tsx
```

### Database Operations
Query FoodCombinationCorrelation where isSynergistic = true.

---

## Acceptance Criteria

- [ ] List of synergistic combinations
- [ ] Shows: food combo, symptom, combo correlation, individual max correlation
- [ ] Synergy strength indicator
- [ ] Example: "Tomato + Egg together worse than individually"
- [ ] Filter by symptom
- [ ] Sort by synergy strength
- [ ] Recommendations to avoid combinations

---

## Dependencies

Correlation engine (F009✅)

---

## References

- Specification: Correlation Analysis Rules: Food Combination Analysis
