# F051 - Problem Areas Heat Map

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 5-6 hours

---

## Overview

Body map visualization with heat map showing flare frequency by region. Color-coded intensity.

---

## Requirements (from spec)

Analyze flare history per region. Color code regions by frequency (green→yellow→red). Show stats on hover.

---

## Technical Approach

### File Structure
```
components/Analytics/ProblemAreasHeatMap.tsx, lib/analytics/calculateProblemAreas.ts
```

### Database Operations
Query db.flares, group by bodyRegion, count occurrences, calculate average severity and duration.

---

## Acceptance Criteria

- [ ] Body map with color-coded regions
- [ ] Heat map intensity based on flare frequency
- [ ] Hover shows region stats
- [ ] Ranked list of problem regions
- [ ] Stats: flare count, avg duration, avg severity
- [ ] Date range filter
- [ ] Export problem areas report

---

## Dependencies

Body map (F020), Flare management (F024-F028)

---

## References

- Specification: Workflow 7: Identifying Problem Areas
