# HS010 - Daily HS Check-In Component

**Status:** ✅ COMPLETED
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 4-6 hours
**Sprint:** 4 - Daily Tracking

---

## Overview

Create a low-friction daily check-in component for HS tracking. Allows users to quickly log their overall status, pain level, and whether they have new lesions, with the option to expand for more details.

---

## Requirements (from spec)

From `body-map-feature-spec.md` Section 4.2:

**Quick Entry Fields:**
- Mood selector (5 levels)
- "Any new lesions today?" prompt
- Overall pain slider (0-10)
- Quick save option

**Expandable Details:**
- Overall drainage assessment
- Fatigue level
- Quality of life impacts
- Triggers experienced
- Treatments used

---

## Technical Approach

### File Structure
```
components/HS/
├── DailyCheckIn.tsx            # Main check-in component
├── MoodSelector.tsx            # 5-level mood picker
└── QuickPainSlider.tsx         # Simplified pain input
```

### Component Props
```typescript
interface DailyCheckInProps {
  date?: string;  // Default: today
  onSave: (entry: Partial<DailyHSEntry>) => void;
  onAddLesion: () => void;  // Opens body map
  existingEntry?: DailyHSEntry;
  compact?: boolean;
}
```

---

## UI/UX Design

### Quick Check-In Layout
```
┌─────────────────────────────────────┐
│  Daily Check-In - Nov 15           │
├─────────────────────────────────────┤
│                                     │
│  How are you feeling today?         │
│                                     │
│  😊  😐  😟  😢  😭                │
│  Great  OK  Rough Painful Bad      │
│                                     │
│  Any new lesions today?             │
│  [Yes - Add to Map]  [No]          │
│                                     │
│  Overall pain (0-10):               │
│  ○○○○○●○○○○○  (5)                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Save Quick Entry       │   │
│  └─────────────────────────────┘   │
│                                     │
│  [+ Add More Details]              │
│                                     │
└─────────────────────────────────────┘
```

### Expanded Details
```
┌─────────────────────────────────────┐
│  Additional Details                 │
├─────────────────────────────────────┤
│                                     │
│  Overall drainage today:            │
│  ○ None  ○ Minimal  ● Moderate     │
│                                     │
│  Odor level:                        │
│  ○ None  ○ Mild  ● Moderate        │
│                                     │
│  Fatigue (0-10):                    │
│  ○○○○○○●○○○○  (6)                  │
│                                     │
│  Activities affected today:         │
│  ☑ Sleep    ☐ Work/School          │
│  ☑ Mobility ☐ Exercise             │
│  ☐ Social   ☐ Intimacy             │
│                                     │
│  Possible triggers:                 │
│  ☑ Stress   ☐ Heat                 │
│  ☐ Friction ☐ Diet                 │
│  ☐ Menstruation                    │
│                                     │
│  Treatments used:                   │
│  ☑ Warm compress                   │
│  ☐ Topical treatment               │
│  ☐ Oral medication                 │
│                                     │
│  Notes:                             │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Save Complete Entry]             │
│                                     │
└─────────────────────────────────────┘
```

---

## Acceptance Criteria

- [ ] Quick check-in with 3 required fields
- [ ] Mood selector with 5 emoji options
- [ ] "New lesions" button links to body map
- [ ] Pain slider 0-10 with value display
- [ ] Save creates/updates DailyHSEntry
- [ ] Expandable details section
- [ ] All DailyHSEntry fields captured
- [ ] Auto-fills IHS4 from current lesions
- [ ] Works standalone or embedded
- [ ] Compact mode for dashboard widget

---

## Dependencies

**Required:**
- HS001: Database Schema (DailyHSEntry)
- HS002: Core Logic (getOrCreateDailyEntry)
- HS003: IHS4 Calculation

**Optional:**
- None

---

## Testing Checklist

- [ ] Quick save creates minimal entry
- [ ] Expanded save captures all fields
- [ ] Mood persists correctly
- [ ] Pain value validated (0-10)
- [ ] Existing entry pre-fills values
- [ ] IHS4 auto-calculated
- [ ] Works offline
- [ ] Touch targets adequate

---

## Related Files

- `/components/HS/DailyCheckIn.tsx` (to be created)
- `/lib/hs/dailyEntry/` (dependency)

---

## References

- Specification: `docs/body-map-feature-spec.md` Section 4.2
- Implementation Plan: `docs/body-map-implementation-plan.md` Phase 6.1
