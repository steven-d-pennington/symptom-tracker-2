# F043 - Food Search & Filtering

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

---

## Overview

Real-time search and filtering for foods by name, category, allergen tags.

---

## Requirements (from spec)

Search by name (fuzzy). Filter by category. Filter by allergen tags. Sort by name, frequency used.

---

## Technical Approach

### File Structure
```
components/Food/FoodSearch.tsx, lib/food/searchFoods.ts
```

### Database Operations
Query db.foods with text search and filters.

---

## Acceptance Criteria

- [ ] Real-time search by name
- [ ] Filter by category (multi-select)
- [ ] Filter by allergen tags (multi-select)
- [ ] Sort by name (A-Z)
- [ ] Sort by frequency used
- [ ] Clear filters button
- [ ] Show result count
- [ ] Fast search (<100ms)

---

## Dependencies

Food library (F042)

---

## References

- Specification: F-006: Food Journal & Correlation Analysis - Food database search
