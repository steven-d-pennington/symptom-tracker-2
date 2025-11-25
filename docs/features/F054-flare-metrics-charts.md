# F054 - Flare Metrics Charts

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

Visualize flare metrics: total flares, average duration, severity trends, resolution rates.

---

## Requirements (from spec)

Line charts for flares over time. Bar charts for average duration by region. Trend indicators.

---

## Technical Approach

### File Structure
```
components/Analytics/FlareMetrics.tsx, lib/analytics/calculateFlareMetrics.ts
```

### Database Operations
Aggregate flares by date, region. Calculate averages.

---

## Acceptance Criteria

- [ ] Total flares count (active vs resolved)
- [ ] Flares over time chart (line)
- [ ] Average flare duration by region (bar)
- [ ] Severity trends (improving/worsening)
- [ ] Intervention effectiveness chart
- [ ] Date range selector
- [ ] Export flare metrics

---

## Dependencies

Flare management (F024-F028)

---

## References

- Specification: F-009: Analytics Dashboard - Flare metrics
