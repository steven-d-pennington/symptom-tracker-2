# F040 - Portion Size Selection

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Low
**Estimated Effort:** 2-3 hours

---

## Overview

UI component for selecting portion sizes (small/medium/large) per food item in meal.

---

## Requirements (from spec)

Visual portion selector. Store in FoodEvent.portionSizes as { foodId: "small"|"medium"|"large" }.

---

## Technical Approach

### File Structure
```
components/Food/PortionSelector.tsx
```

### Database Operations
Store portion sizes in FoodEvent.portionSizes object.

---

## Acceptance Criteria

- [ ] Visual portion size buttons (S/M/L)
- [ ] Default to medium
- [ ] Per-food portion selection
- [ ] Visual feedback for selection
- [ ] Used in dose-response correlation

---

## Dependencies

Food logging (F039)

---

## References

- Specification: Data Validation Rules: Portion Sizes
