# F050 - Analytics Dashboard Landing

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

Main analytics dashboard with key metrics, recent insights, and navigation to detailed analysis views.

---

## Requirements (from spec)

Overview cards with active flares count, top triggers, recent correlations. Quick access to detailed views.

---

## Technical Approach

### File Structure
```
app/analytics/page.tsx, components/Analytics/MetricCard.tsx
```

### Database Operations
Aggregate queries for counts, recent correlations, trends.

---

## Acceptance Criteria

- [ ] Active flares count
- [ ] Total symptoms logged (this month)
- [ ] Top 3 triggers
- [ ] Latest food-symptom correlations
- [ ] Problem areas preview
- [ ] Navigation cards to detailed views
- [ ] Date range selector
- [ ] Export analytics button

---

## Dependencies

Database schema (F003✅), Correlation engine (F009✅)

---

## References

- Specification: F-009: Analytics Dashboard
