# F041 - Meal Grouping (Meal IDs)

**Status:** ✅ COMPLETED
**Priority:** MEDIUM
**Complexity:** Low
**Estimated Effort:** 2-3 hours

---

## Overview

Group foods eaten together using meal ID for combination analysis.

---

## Requirements (from spec)

Generate unique meal ID. All foods in same meal share this ID. Used for synergistic combination detection.

---

## Technical Approach

### File Structure
```
lib/food/mealGrouping.ts
```

### Database Operations
FoodEvent.mealId = generateGUID() for foods logged together.

---

## Acceptance Criteria

- [x] Generate unique meal ID when logging
- [x] All concurrent foods share meal ID
- [x] Separate meals have different IDs
- [x] Used in correlation analysis for combinations

---

## Dependencies

Food logging (F039)

---

## References

- Specification: Domain Entities: FoodEvent - Meal identifier
