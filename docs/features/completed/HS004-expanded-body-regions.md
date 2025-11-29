# HS004 - Expanded Body Map Regions (58 Regions)

**Status:** ✅ COMPLETED
**Priority:** HIGH
**Complexity:** High
**Estimated Effort:** 8-12 hours
**Sprint:** 2 - Body Map Enhancement

---

## Overview

Expand the body map from ~38 simplified regions to 58 detailed regions with HS-priority highlighting. HS-prone areas (axillae, groin, inframammary, buttocks, perianal) receive finer granularity for precise lesion placement.

---

## Requirements (from spec)

From `body-map-feature-spec.md` Section 1.3:

**HS-Priority Regions (26 regions):**
- Axillae/Armpits: 4 regions (left/right central & peripheral)
- Groin/Inguinal: 6 regions (folds, inner thighs, mons pubis, perineum)
- Inframammary/Chest: 6 regions (folds, breast/chest, intermammary, submammary)
- Buttocks/Gluteal: 6 regions (upper/lower left/right, gluteal cleft, perianal)
- Waistband/Belt Line: 4 regions (flanks, suprapubic, sacral)

**Standard Regions (32 regions):**
- Head & Neck: 6 regions
- Torso Front: 4 regions
- Torso Back: 4 regions
- Arms: 12 regions (6 per arm)
- Legs: 12 regions (6 per leg)

---

## Technical Approach

### File Structure
```
lib/bodyMap/regions/
├── index.ts                    # Aggregates all regions
├── types.ts                    # Region type definitions
├── hsPriority/
│   ├── axillae.ts              # 4 regions
│   ├── groin.ts                # 6 regions
│   ├── inframammary.ts         # 6 regions
│   ├── buttocks.ts             # 6 regions
│   └── waistband.ts            # 4 regions
└── standard/
    ├── headNeck.ts             # 6 regions
    ├── torsoFront.ts           # 4 regions
    ├── torsoBack.ts            # 4 regions
    ├── arms.ts                 # 12 regions
    └── legs.ts                 # 12 regions

public/body-map/
├── full/
│   ├── body-front.svg          # Full front view with 58 region paths
│   └── body-back.svg           # Full back view
└── regions/
    ├── left-axilla.svg         # Detailed HS-priority region SVGs
    ├── right-axilla.svg
    └── ... (10 HS-priority detailed SVGs)
```

### Region Interface
```typescript
interface BodyMapRegion {
  id: string;                    // e.g., 'left-axilla-central'
  name: string;                  // e.g., 'Left Axilla (central)'
  path: string;                  // SVG path data
  view: 'front' | 'back';
  category: 'hs-priority' | 'standard';
  isHSPriority: boolean;
  parentRegion?: string;         // For hierarchy (e.g., 'left-axilla')
  detailedSVG?: string;          // Path to detailed region SVG
  boundingBox?: {                // For coordinate calculations
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

### Implementation Notes
- Each region must have unique `id` matching `regionId` in HSLesion
- SVG paths should be optimized but smooth
- HS-priority regions have `data-hs-priority="true"` attribute
- Region definitions separate from SVG for easy updates
- Support both inline path definitions and external SVG files

---

## Region Definitions

### HS-Priority Regions

**Axillae (4 regions):**
| ID | Name | View |
|----|------|------|
| left-axilla-central | Left Axilla (central) | front |
| left-axilla-peripheral | Left Axilla (peripheral) | front |
| right-axilla-central | Right Axilla (central) | front |
| right-axilla-peripheral | Right Axilla (peripheral) | front |

**Groin (6 regions):**
| ID | Name | View |
|----|------|------|
| left-groin-fold | Left Groin (inguinal fold) | front |
| left-inner-thigh-upper | Left Inner Thigh (upper) | front |
| right-groin-fold | Right Groin (inguinal fold) | front |
| right-inner-thigh-upper | Right Inner Thigh (upper) | front |
| mons-pubis | Mons Pubis | front |
| perineum | Perineum | front |

**Inframammary (6 regions):**
| ID | Name | View |
|----|------|------|
| left-inframammary-fold | Left Inframammary Fold | front |
| right-inframammary-fold | Right Inframammary Fold | front |
| left-breast-chest | Left Breast/Chest | front |
| right-breast-chest | Right Breast/Chest | front |
| intermammary | Intermammary | front |
| submammary | Submammary | front |

**Buttocks (6 regions):**
| ID | Name | View |
|----|------|------|
| left-buttock-upper | Left Buttock (upper) | back |
| left-buttock-lower | Left Buttock (lower) | back |
| right-buttock-upper | Right Buttock (upper) | back |
| right-buttock-lower | Right Buttock (lower) | back |
| gluteal-cleft | Gluteal Cleft | back |
| perianal | Perianal | back |

**Waistband (4 regions):**
| ID | Name | View |
|----|------|------|
| left-waist-flank | Left Waist/Flank | front/back |
| right-waist-flank | Right Waist/Flank | front/back |
| lower-abdomen-suprapubic | Lower Abdomen (suprapubic) | front |
| lower-back-sacral | Lower Back (sacral) | back |

### Standard Regions (32 total)
See implementation plan for complete list.

---

## Acceptance Criteria

- [ ] 58 regions defined with unique IDs
- [ ] 26 HS-priority regions with `isHSPriority: true`
- [ ] All regions have valid SVG path data
- [ ] Front view contains ~30 regions
- [ ] Back view contains ~28 regions
- [ ] Each region has human-readable display name
- [ ] HS-priority regions have parent groupings
- [ ] Detailed SVG files for 10 HS-priority parent regions
- [ ] Region lookup by ID is O(1)
- [ ] TypeScript exports all region definitions

---

## Dependencies

**Required:**
- Existing body map SVG structure (to be enhanced)

**Optional:**
- Professional SVG designer for polished illustrations

---

## Testing Checklist

- [ ] All 58 region IDs are unique
- [ ] No overlapping SVG paths
- [ ] Each region is clickable/tappable
- [ ] Region names display correctly
- [ ] HS-priority regions visually distinguished
- [ ] Front/back toggle works correctly
- [ ] Regions scale properly on different screen sizes
- [ ] Touch/click detection accurate

---

## Related Files

- `/lib/bodyMap/regions/` (to be created)
- `/lib/bodyMap/bodyMapSVGs.ts` (existing, to be enhanced)
- `/public/body-map/` (SVG assets)

---

## References

- Specification: `docs/body-map-feature-spec.md` Section 1.3
- Implementation Plan: `docs/body-map-implementation-plan.md` Phase 2
