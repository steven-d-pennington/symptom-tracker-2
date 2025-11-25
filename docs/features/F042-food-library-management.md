# F042 - Food Library Management

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

Manage food database: add custom foods, edit allergen tags, set preparation methods, enable/disable.

---

## Requirements (from spec)

CRUD for foods. Set allergen tags (dairy, gluten, nuts, etc.). Preparation method (raw/cooked/fried/baked). Categorize.

---

## Technical Approach

### File Structure
```
app/food/library/page.tsx, components/Food/FoodForm.tsx, lib/food/manageFood.ts
```

### Database Operations
Create, update Food entities. Set allergen tags array. Set preparation method.

---

## Acceptance Criteria

- [ ] List all foods by category
- [ ] Add custom food
- [ ] Edit food details
- [ ] Multi-select allergen tags
- [ ] Set preparation method
- [ ] Categorize food
- [ ] Disable/enable food
- [ ] Search foods
- [ ] Filter by allergen tag

---

## Dependencies

Database schema (F003✅), Food presets (F013✅)

---

## References

- Specification: Domain Entities: Food
