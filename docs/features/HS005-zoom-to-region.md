# HS005 - Zoom-to-Region Functionality

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** High
**Estimated Effort:** 8-10 hours
**Sprint:** 2 - Body Map Enhancement

---

## Overview

Enable tap-to-zoom functionality where users can tap on a body region to expand it and fill the viewport for detailed marker placement. This provides precise lesion location tracking crucial for HS management.

---

## Requirements (from spec)

From `body-map-feature-spec.md` Section 5:

**Trigger:**
- Single tap/click on any defined region
- Response time: transition begins within 100ms

**Animation:**
- Smooth zoom + pan animation
- Duration: 300-400ms
- Easing: ease-out curve
- Respect reduced-motion preferences

**Zoomed View:**
- Selected region scales up and centers
- Shows detailed region SVG (for HS-priority regions)
- Displays existing lesion markers
- Back button returns to overview
- Region header with name and Hurley stage

---

## Technical Approach

### File Structure
```
components/BodyMap/
├── BodyMap.tsx                 # UPDATED: Add mode state
├── ZoomedRegionView.tsx        # NEW: Zoomed view component
├── RegionNavigation.tsx        # NEW: Quick nav buttons
└── BodyMapTransition.tsx       # NEW: Animation handling
```

### State Management
```typescript
interface BodyMapState {
  view: 'front' | 'back';
  mode: 'overview' | 'zoomed';
  selectedRegionId: string | null;
  pendingLesionPosition: { x: number; y: number } | null;
}
```

### Component Props
```typescript
// ZoomedRegionView.tsx
interface ZoomedRegionViewProps {
  regionId: string;
  lesions: HSLesion[];
  hurleyStage?: 1 | 2 | 3 | null;
  onBack: () => void;
  onAddLesion: (coordinates: { x: number; y: number }) => void;
  onLesionClick: (lesion: HSLesion) => void;
}
```

### Animation Implementation
```typescript
// Use CSS transforms for GPU acceleration
const zoomTransition = {
  transition: 'transform 350ms ease-out',
  willChange: 'transform',
};

// Respect reduced motion
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const duration = prefersReducedMotion ? 0 : 350;
```

---

## UI/UX Design

### Zoomed View Layout
```
┌─────────────────────────────────────┐
│  ← Back       Left Axilla    [⚙️]  │  <- Header
│               Hurley Stage II       │
├─────────────────────────────────────┤
│                                     │
│     ┌───────────────────────┐       │
│     │                       │       │
│     │   [Zoomed Region      │       │
│     │    SVG]               │       │
│     │      🔴 nodule        │       │
│     │           🟡 abscess  │       │
│     │      🟣 tunnel        │       │
│     │                       │       │
│     └───────────────────────┘       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [+ Add Lesion] [📷 Photo] │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Active Lesions (3)                 │
│  ├─ 🔴 Nodule - Pain: 6/10         │
│  ├─ 🟡 Abscess - Draining          │
│  └─ 🟣 Tunnel - Moderate odor      │
│                                     │
│  [View History] [Update Hurley]    │
└─────────────────────────────────────┘
```

### Navigation Options
- **Back Button**: Prominent in top-left
- **Swipe Gesture**: Swipe right to go back (optional)
- **Hardware Back**: Android/browser back button support
- **Adjacent Navigation**: Quick-nav to other HS-priority regions

---

## Acceptance Criteria

- [ ] Tapping a region triggers zoom animation
- [ ] Animation completes in 300-400ms
- [ ] Zoomed region fills viewport appropriately
- [ ] Back button returns to overview with reverse animation
- [ ] Region header displays region name
- [ ] Existing lesion markers visible in zoomed view
- [ ] Can tap in zoomed view to set lesion position
- [ ] Reduced motion preference respected
- [ ] Works on both mobile (touch) and desktop (click)
- [ ] Keyboard navigation supported (Enter to zoom, Escape to back)

---

## Dependencies

**Required:**
- HS004: Expanded Body Map Regions (region definitions)
- HS001: Database Schema (HSLesion type)

**Optional:**
- HS007: Hurley Staging (for header display)

---

## Testing Checklist

- [ ] Zoom animation smooth (60fps)
- [ ] No layout shift during transition
- [ ] Touch/click coordinates accurate in zoomed view
- [ ] Back navigation works (button, swipe, hardware)
- [ ] Lesion markers positioned correctly after zoom
- [ ] Screen reader announces region name
- [ ] Keyboard focus managed correctly
- [ ] Works on small screens (320px width)
- [ ] Works on large screens (1200px+)

---

## Accessibility Requirements

- Screen reader announces: "Zoomed into [Region Name], [N] active lesions"
- Focus moves to region area when zoomed
- Escape key returns to overview
- Zoom level doesn't exceed 200% for accessibility
- Touch targets remain ≥44px in zoomed view

---

## Related Files

- `/components/BodyMap/BodyMap.tsx` (to be modified)
- `/components/BodyMap/ZoomedRegionView.tsx` (to be created)
- `/components/BodyMap/RegionNavigation.tsx` (to be created)

---

## References

- Specification: `docs/body-map-feature-spec.md` Section 5
- Implementation Plan: `docs/body-map-implementation-plan.md` Phase 3
