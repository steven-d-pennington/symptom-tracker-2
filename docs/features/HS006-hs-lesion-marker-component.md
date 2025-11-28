# HS006 - HS Lesion Marker Component

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 4-6 hours
**Sprint:** 2 - Body Map Enhancement

---

## Overview

Create a specialized lesion marker component that visually distinguishes between the three IHS4 lesion types (nodule, abscess, draining tunnel) plus prodromal markers. Uses colorblind-safe palette with distinct shapes.

---

## Requirements (from spec)

From `body-map-feature-spec.md` Section 2.1 and Appendix C:

**Lesion Type Visual Identifiers:**
| Type | IHS4 Weight | Shape | Color | Icon |
|------|-------------|-------|-------|------|
| Nodule | ×1 | Solid Circle | #E69F00 (Orange) | ● |
| Abscess | ×2 | Circle with dot | #CC79A7 (Pink) | ⊙ |
| Draining Tunnel | ×4 | Circle with tail | #882255 (Purple) | ◉→ |
| Prodromal | N/A | Dashed circle | #44AA99 (Teal) | ◌ |
| Healing | Varies | Faded version | #999999 (Gray) | ○ |
| Scarred | N/A | X mark | #666666 (Dark Gray) | ✕ |

---

## Technical Approach

### File Structure
```
components/HS/
├── HSLesionMarker.tsx          # Main marker component
├── LesionTypeIcon.tsx          # SVG icon for each type
└── hsColors.ts                 # Color palette constants
```

### Component Props
```typescript
interface HSLesionMarkerProps {
  lesion: HSLesion;
  observation?: LesionObservation;
  size?: 'small' | 'medium' | 'large';
  onClick?: (lesion: HSLesion) => void;
  showLabel?: boolean;
  animated?: boolean;
}
```

### Color Palette (Colorblind-Safe)
```typescript
// lib/hs/colors.ts
export const HS_LESION_COLORS = {
  nodule: {
    primary: '#E69F00',      // Orange
    background: '#E69F0033', // 20% opacity
    border: '#B47B00',
  },
  abscess: {
    primary: '#CC79A7',      // Pink/Magenta
    background: '#CC79A733',
    border: '#A35D85',
  },
  draining_tunnel: {
    primary: '#882255',      // Purple
    background: '#88225533',
    border: '#661144',
  },
  prodromal: {
    primary: '#44AA99',      // Teal
    background: '#44AA9933',
    border: '#338877',
  },
  healing: {
    primary: '#999999',      // Gray
    background: '#99999933',
    border: '#777777',
  },
  scarred: {
    primary: '#666666',      // Dark Gray
    background: '#66666633',
    border: '#444444',
  },
};
```

### SVG Icons
```typescript
// Each type has a distinct SVG shape
const NoduleIcon = () => (
  <circle cx="12" cy="12" r="8" fill="currentColor" />
);

const AbscessIcon = () => (
  <>
    <circle cx="12" cy="12" r="8" fill="currentColor" />
    <circle cx="12" cy="12" r="3" fill="white" />
  </>
);

const TunnelIcon = () => (
  <>
    <circle cx="12" cy="12" r="8" fill="currentColor" />
    <path d="M20 12 L26 12" stroke="currentColor" strokeWidth="3" />
  </>
);

const ProdromalIcon = () => (
  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor"
          strokeWidth="2" strokeDasharray="4 2" />
);
```

---

## UI/UX Design

### Marker Sizes
| Size | Diameter | Use Case |
|------|----------|----------|
| small | 16px | Overview map with many lesions |
| medium | 24px | Default zoomed view |
| large | 32px | Detail view / single lesion focus |

### Marker States
- **Default**: Normal appearance
- **Selected**: Highlighted border, slightly larger
- **Pulsing**: For high-severity lesions (pain ≥7)
- **Faded**: For healing/scarred status

### Label Display
When `showLabel={true}`:
```
   🔴
Nodule
```

---

## Acceptance Criteria

- [ ] Renders correct shape for each lesion type
- [ ] Uses colorblind-safe palette
- [ ] Shape distinguishable without color (accessibility)
- [ ] Three size variants (small/medium/large)
- [ ] Click handler fires with lesion data
- [ ] Selected state visually distinct
- [ ] Pulsing animation for severe pain
- [ ] Faded appearance for healing/scarred
- [ ] Optional label display
- [ ] Works in both light and dark mode

---

## Dependencies

**Required:**
- HS001: Database Schema (HSLesion type)

**Optional:**
- None

---

## Testing Checklist

- [ ] All 6 marker types render correctly
- [ ] Colors match specification exactly
- [ ] Shapes visible on both light/dark backgrounds
- [ ] Touch target ≥44px for all sizes
- [ ] Click/tap triggers callback
- [ ] Animation smooth and not distracting
- [ ] Screen reader announces lesion type
- [ ] High contrast mode compatible

---

## Accessibility Requirements

- Shape AND color distinguish types (not color alone)
- Minimum touch target 44px (use padding if needed)
- ARIA label: "[Type] lesion, pain level [N]"
- High contrast mode uses darker borders
- Animation can be disabled (prefers-reduced-motion)

---

## Related Files

- `/components/HS/HSLesionMarker.tsx` (to be created)
- `/components/HS/LesionTypeIcon.tsx` (to be created)
- `/lib/hs/colors.ts` (to be created)

---

## References

- Specification: `docs/body-map-feature-spec.md` Section 2.1, Appendix C
- Implementation Plan: `docs/body-map-implementation-plan.md` Phase 4.3
