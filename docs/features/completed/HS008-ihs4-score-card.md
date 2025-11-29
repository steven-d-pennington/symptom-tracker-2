# HS008 - IHS4 Score Card Component

**Status:** ✅ COMPLETED
**Priority:** HIGH
**Complexity:** Low
**Estimated Effort:** 3-4 hours
**Sprint:** 3 - IHS4 Dashboard

---

## Overview

Create a reusable IHS4 score card component that displays the current IHS4 score with severity indicator, lesion type breakdown, and optional trend information. This is a core UI element used across the HS tracking features.

---

## Requirements (from spec)

From `body-map-feature-spec.md` Section 7.1:

**Display Elements:**
- Large score number
- Severity badge (Mild/Moderate/Severe) with color
- Breakdown by lesion type with counts
- Optional: trend indicator (up/down from previous)

**Severity Colors:**
| Score | Severity | Color |
|-------|----------|-------|
| ≤3 | Mild | Green |
| 4-10 | Moderate | Yellow/Orange |
| ≥11 | Severe | Red |

---

## Technical Approach

### File Structure
```
components/HS/
└── IHS4ScoreCard.tsx           # Score card component
```

### Component Props
```typescript
interface IHS4ScoreCardProps {
  score: number;
  severity: 'mild' | 'moderate' | 'severe';
  breakdown: {
    nodules: number;
    abscesses: number;
    drainingTunnels: number;
  };
  variant?: 'compact' | 'detailed';
  previousScore?: number;  // For trend indicator
  showTrend?: boolean;
  className?: string;
}
```

### Color Scheme
```typescript
const SEVERITY_COLORS = {
  mild: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    badge: 'bg-green-500',
  },
  moderate: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-200',
    badge: 'bg-yellow-500',
  },
  severe: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-200',
    badge: 'bg-red-500',
  },
};
```

---

## UI/UX Design

### Detailed Variant
```
┌─────────────────────────────────────┐
│  Today's IHS4 Score                 │
│  ┌─────────────────────────────┐   │
│  │  ████████░░                 │   │
│  │     8      MODERATE         │   │
│  │                             │   │
│  │  🔴 3 Nodules    (×1 = 3)   │   │
│  │  🟡 1 Abscess    (×2 = 2)   │   │
│  │  🟣 1 Tunnel     (×4 = 4)   │   │  <- Note: this adds to 9, will fix in impl
│  │                             │   │
│  │  ↑ +2 from yesterday        │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Compact Variant
```
┌─────────────────────────────────────┐
│  IHS4: 8 (Moderate) ↑2              │
│  🔴3 🟡1 🟣1                        │
└─────────────────────────────────────┘
```

---

## Acceptance Criteria

- [ ] Displays IHS4 score prominently
- [ ] Shows severity badge with appropriate color
- [ ] Displays breakdown by lesion type
- [ ] Shows IHS4 weight calculation per type
- [ ] Compact variant for space-constrained areas
- [ ] Detailed variant with full breakdown
- [ ] Optional trend indicator (up/down arrows)
- [ ] Works in light and dark mode
- [ ] Accessible (ARIA labels for screen readers)

---

## Dependencies

**Required:**
- HS003: IHS4 Calculation Engine (for types)
- Tailwind CSS (existing)

**Optional:**
- None

---

## Testing Checklist

- [ ] Renders correct score and severity
- [ ] Breakdown counts match total
- [ ] Colors correct for each severity
- [ ] Trend indicator shows correct direction
- [ ] Compact variant fits in small spaces
- [ ] Dark mode colors appropriate
- [ ] Screen reader announces "IHS4 score [N], [severity]"

---

## Related Files

- `/components/HS/IHS4ScoreCard.tsx` (to be created)
- `/lib/hs/ihs4.ts` (dependency)

---

## References

- Specification: `docs/body-map-feature-spec.md` Section 7.1, Appendix D
- Implementation Plan: `docs/body-map-implementation-plan.md` Phase 5.1
