# F039 - Food Journal Meal Logging

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 5-6 hours

---

## Overview

Log meals with multiple foods, portion sizes, meal type, and timestamp. Groups foods by meal ID.

---

## Requirements (from spec)

Multi-select foods. Set portion per food (small/medium/large). Meal type (breakfast/lunch/dinner/snack). Photo optional.

---

## Technical Approach

### File Structure
```
app/food/page.tsx, components/Food/MealLogger.tsx, lib/food/logMeal.ts
```

### Database Operations
Create FoodEvent with unique mealId, foodIds array, portionSizes object, mealType, timestamp.

---

## Acceptance Criteria

- [ ] Select multiple foods for meal
- [ ] Portion size per food (small/medium/large)
- [ ] Meal type selector
- [ ] Timestamp editable
- [ ] Notes field
- [ ] Photo attachment optional
- [ ] All foods share same mealId
- [ ] Creates FoodEvent in database
- [ ] Used for correlation analysis

---

## Dependencies

Database schema (F003✅), Food presets (F013✅)

---

## References

- Specification: Workflow 5: Logging Food Intake
