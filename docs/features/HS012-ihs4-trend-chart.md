# HS012 - IHS4 Trend Chart

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 4-6 hours
**Sprint:** 5 - Clinical Features

---

## Overview

Create an IHS4 trend visualization chart showing score changes over time. Includes severity bands (mild/moderate/severe zones), date range selection, and integration with analytics dashboard.

---

## Requirements (from spec)

From `body-map-feature-spec.md` Section 8.1:

**Chart Features:**
- Line chart of IHS4 scores over time
- Severity band backgrounds (green/yellow/red zones)
- Date range selector (7d, 30d, 90d, custom)
- Hover/tap to see daily details
- Flare day indicators

---

## Technical Approach

### File Structure
```
components/HS/
├── IHS4TrendChart.tsx          # Main chart component
└── TrendDateRangeSelector.tsx  # Date range picker

lib/hs/
└── trends.ts                   # Trend data helpers
```

### Component Props
```typescript
interface IHS4TrendChartProps {
  entries: DailyHSEntry[];
  dateRange?: { start: string; end: string };
  onDateRangeChange?: (range: { start: string; end: string }) => void;
  showFlareDays?: boolean;
  height?: number;
}
```

### Chart Library
Use Recharts (already in project) or lightweight alternative:
```typescript
import { LineChart, Line, XAxis, YAxis, Area, ReferenceLine } from 'recharts';
```

---

## UI/UX Design

### Chart Layout
```
┌─────────────────────────────────────────────────────┐
│  IHS4 Score History                                 │
│  [7d] [30d] [90d] [Custom]                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  15 ┼─────────────────────────────── SEVERE ──────│
│     │                    *                         │
│  11 ┼───────────────────/─\───────────────────────│
│     │                  /   \      *               │
│  10 ┼─────────────────────────────── MODERATE ───│
│     │        *       /     \    /  \              │
│   5 ┼───────/─\─────/───────\──/────\─────────────│
│     │      /   \   /                 \            │
│   3 ┼─────────────────────────────── MILD ───────│
│     │     /     \ /                   \    *     │
│   0 ┼────*───────*─────────────────────\──/──────│
│     └────┴───────┴───────────────────────┴───────│
│        Nov 1    Nov 8    Nov 15    Nov 22  Nov 28 │
│                                                     │
│  * = Flare day                                     │
│                                                     │
│  Tap a point for details                           │
└─────────────────────────────────────────────────────┘
```

### Severity Bands
- Green background: 0-3 (Mild)
- Yellow background: 4-10 (Moderate)
- Red background: 11+ (Severe)

### Point Details (on tap/hover)
```
┌─────────────────────────┐
│  November 15            │
│  Score: 8 (Moderate)    │
│  🔴 3 Nodules           │
│  🟡 1 Abscess           │
│  🟣 1 Tunnel            │
│  Flare Day: Yes         │
└─────────────────────────┘
```

---

## Acceptance Criteria

- [ ] Line chart displays IHS4 over time
- [ ] Severity bands visible as background
- [ ] Date range selectors work (7d, 30d, 90d)
- [ ] Custom date range picker
- [ ] Tap/hover shows daily details
- [ ] Flare days marked on chart
- [ ] Chart scales to container
- [ ] Handles empty data gracefully
- [ ] Works in dark mode
- [ ] Accessible (keyboard navigable)

---

## Dependencies

**Required:**
- HS001: Database Schema (DailyHSEntry)
- HS003: IHS4 Calculation (getIHS4History)
- Chart library (Recharts or similar)

**Optional:**
- None

---

## Testing Checklist

- [ ] Chart renders with sample data
- [ ] Severity bands correct colors
- [ ] Date range changes update chart
- [ ] Point details display on interaction
- [ ] Empty state handled
- [ ] Responsive to container size
- [ ] Dark mode compatible
- [ ] Performance with 365 days of data

---

## Related Files

- `/components/HS/IHS4TrendChart.tsx` (to be created)
- `/lib/hs/trends.ts` (to be created)
- `/app/hs/analytics/page.tsx` (integration point)

---

## References

- Specification: `docs/body-map-feature-spec.md` Section 8.1
- Implementation Plan: `docs/body-map-implementation-plan.md` Phase 8.1
