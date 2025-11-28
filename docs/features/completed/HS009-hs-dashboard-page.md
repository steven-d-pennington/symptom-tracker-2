# HS009 - HS Dashboard Page

**Status:** ✅ COMPLETED
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 6-8 hours
**Sprint:** 3 - IHS4 Dashboard

---

## Overview

Create the main HS (Hidradenitis Suppurativa) tracking dashboard page that integrates the body map, IHS4 score display, active lesions list, and quick actions. This is the primary interface for HS tracking.

---

## Requirements (from spec)

From `body-map-feature-spec.md` Section 7:

**Dashboard Elements:**
- IHS4 score card (prominent)
- Interactive body map with lesion indicators
- Front/back view toggle
- Active lesions summary list
- Quick action buttons
- Legend for lesion types

---

## Technical Approach

### File Structure
```
app/hs/
├── page.tsx                    # HS Dashboard
├── layout.tsx                  # HS section layout
└── loading.tsx                 # Loading state

components/HS/
├── HSLesionsList.tsx           # Active lesions list
└── LesionTypeLegend.tsx        # Marker legend
```

### Page Structure
```typescript
// app/hs/page.tsx
export default function HSDashboardPage() {
  return (
    <div className="hs-dashboard">
      <IHS4ScoreCard />
      <BodyMap mode="hs" />
      <QuickActions />
      <ActiveLesionsList />
      <LesionTypeLegend />
    </div>
  );
}
```

### State Management
```typescript
// Use React Context or Zustand for HS state
interface HSPageState {
  currentIHS4: IHS4Result;
  activeLesions: HSLesion[];
  selectedDate: string;
  bodyMapView: 'front' | 'back';
  zoomedRegionId: string | null;
}
```

---

## UI/UX Design

### Desktop Layout (Side-by-Side)
```
┌───────────────────────────────────────────────────────────────┐
│  HS Tracker                                        [⚙️] [?]   │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐  ┌─────────────────────────────┐    │
│  │  IHS4 Score: 8      │  │                             │    │
│  │  ████████░░ MOD     │  │                             │    │
│  │  🔴3 🟡1 🟣1        │  │      [ Body Map ]          │    │
│  └─────────────────────┘  │                             │    │
│                            │    Front ○ ● Back          │    │
│  Quick Actions             │                             │    │
│  ┌───────────────────────┐│                             │    │
│  │ [+ Add Lesion]        ││                             │    │
│  │ [📋 Daily Entry]      ││                             │    │
│  │ [📊 View Trends]      │└─────────────────────────────┘    │
│  └───────────────────────┘                                    │
│                                                               │
│  Active Lesions (5)                                          │
│  ├─ 🔴 Left Axilla - Nodule - Pain 6/10                      │
│  ├─ 🟡 Right Groin - Abscess - Draining                      │
│  └─ 🟣 Left Inframammary - Tunnel - 3 days                   │
│                                                               │
│  Legend: 🔴 Nodule (×1)  🟡 Abscess (×2)  🟣 Tunnel (×4)     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Mobile Layout (Stacked)
```
┌─────────────────────────────────────┐
│  HS Tracker                    [≡]  │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │  IHS4: 8 (Moderate)         │   │
│  │  🔴3 🟡1 🟣1                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │      [ Body Map ]           │   │
│  │                             │   │
│  │   Front ○ ● Back            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐    │
│  │+ Add  │ │Daily  │ │Trends │    │
│  │Lesion │ │Entry  │ │       │    │
│  └───────┘ └───────┘ └───────┘    │
│                                     │
│  Active Lesions (5)            [>] │
│  ├─ 🔴 Left Axilla - Pain 6        │
│  └─ 🟡 Right Groin - Draining      │
│                                     │
│  🔴×1  🟡×2  🟣×4                  │
└─────────────────────────────────────┘
```

---

## Acceptance Criteria

- [ ] Page accessible at `/hs` route
- [ ] IHS4 score card displayed prominently
- [ ] Body map shows current lesion markers
- [ ] Front/back view toggle works
- [ ] Tapping region zooms into it
- [ ] Active lesions list shows summary
- [ ] Quick action buttons functional
- [ ] Legend explains lesion type markers
- [ ] Responsive layout (desktop/mobile)
- [ ] Page loads with current day's data
- [ ] Real-time updates when lesions change

---

## Dependencies

**Required:**
- HS001-003: Data layer foundation
- HS004-007: Body map components
- HS008: IHS4 Score Card

**Optional:**
- None

---

## Testing Checklist

- [ ] Page renders without errors
- [ ] IHS4 score matches active lesions
- [ ] Body map interactions work
- [ ] Lesions list scrollable if many items
- [ ] Quick actions navigate correctly
- [ ] Data persists across page refreshes
- [ ] Works offline
- [ ] Mobile responsive
- [ ] Screen reader navigable

---

## Related Files

- `/app/hs/page.tsx` (to be created)
- `/components/HS/` (dependencies)

---

## References

- Specification: `docs/body-map-feature-spec.md` Section 7
- Implementation Plan: `docs/body-map-implementation-plan.md` Phase 5
