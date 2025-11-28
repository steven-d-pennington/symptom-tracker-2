# HS011 - Hurley Staging Per Region

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 6-8 hours
**Sprint:** 5 - Clinical Features

---

## Overview

Implement Hurley staging tracking per affected body region. Hurley staging is a static classification system (Stages I-III) that indicates disease severity based on scarring and sinus tract presence, used by healthcare providers to assess disease progression.

---

## Requirements (from spec)

From `body-map-feature-spec.md` Section 3:

**Hurley Stage Criteria:**
| Stage | Criteria | Indicator |
|-------|----------|-----------|
| I | Single/multiple abscesses; no sinus tracts or scarring | ● |
| II | Recurrent abscesses with sinus tract OR scarring; lesions widely separated | ●● |
| III | Diffuse involvement; multiple interconnected sinus tracts and abscesses | ●●● |

**Features:**
- Per-region Hurley stage assignment
- Guided assessment wizard
- Stage history tracking
- Visual indicator on body map

---

## Technical Approach

### File Structure
```
components/HS/
├── HurleyStageIndicator.tsx    # Badge/indicator component
├── HurleyAssessmentWizard.tsx  # Guided questionnaire
└── RegionHurleyCard.tsx        # Region status card

lib/hs/
└── hurley.ts                   # Hurley logic
```

### Data Model
```typescript
interface RegionHurleyStatus {
  regionId: string;
  hurleyStage: 1 | 2 | 3 | null;
  hasScarring: boolean;
  hasSinusTracts: boolean;
  lesionsInterconnected: boolean;
  lastAssessedDate: string;
  notes?: string;
}
```

### Assessment Logic
```typescript
function determineHurleyStage(assessment: {
  hasSinusTracts: boolean;
  lesionsInterconnected: boolean;
  hasScarring: boolean;
}): 1 | 2 | 3 {
  if (assessment.lesionsInterconnected) return 3;
  if (assessment.hasSinusTracts || assessment.hasScarring) return 2;
  return 1;
}
```

---

## UI/UX Design

### Hurley Stage Indicator
```
Stage I:  ●     (single dot)
Stage II: ●●    (double dot)
Stage III: ●●●  (triple dot)
```

### Assessment Wizard
```
┌─────────────────────────────────────┐
│  Hurley Assessment - Left Axilla   │
├─────────────────────────────────────┤
│                                     │
│  Q1: Do you have sinus tracts       │
│      (tunnels under the skin)       │
│      in this area?                  │
│                                     │
│  [No, just bumps/abscesses]         │
│  [Yes, I have tunnels]              │
│                                     │
│  ────────────────────────────────   │
│                                     │
│  Q2: Are multiple lesions connected │
│      by tunnels?                    │
│                                     │
│  [No, tunnels are isolated]         │
│  [Yes, widespread connected tunnels]│
│                                     │
│  ────────────────────────────────   │
│                                     │
│  Q3: Is there significant scarring  │
│      in this area?                  │
│                                     │
│  [Minimal/no scarring]              │
│  [Significant scarring]             │
│                                     │
│  ────────────────────────────────   │
│                                     │
│  Based on your answers:             │
│  Likely Stage: II ●●                │
│                                     │
│  [Save Assessment] [Learn More]     │
│                                     │
└─────────────────────────────────────┘
```

---

## Acceptance Criteria

- [ ] HurleyStageIndicator shows dots for stage
- [ ] Assessment wizard with 3 questions
- [ ] Wizard determines stage from answers
- [ ] Stage saved per region
- [ ] Stage displayed on zoomed region view
- [ ] Stage visible on body map overview (small badge)
- [ ] History of stage changes tracked
- [ ] Educational content explains each stage
- [ ] Can update stage over time

---

## Dependencies

**Required:**
- HS001: Database Schema (RegionHurleyStatus)
- HS004: Expanded Regions (regionId)
- HS005: Zoom-to-Region (display in zoomed view)

**Optional:**
- None

---

## Testing Checklist

- [ ] Assessment wizard logic correct
- [ ] Stage persists to database
- [ ] Indicator displays correct dots
- [ ] Multiple regions can have different stages
- [ ] Stage history recorded
- [ ] Works offline
- [ ] Accessible (screen reader announces stage)

---

## Related Files

- `/components/HS/HurleyStageIndicator.tsx` (to be created)
- `/components/HS/HurleyAssessmentWizard.tsx` (to be created)
- `/lib/hs/hurley.ts` (to be created)

---

## References

- Specification: `docs/body-map-feature-spec.md` Section 3
- Implementation Plan: `docs/body-map-implementation-plan.md` Phase 7
- Clinical Reference: Hurley ML. Axillary hyperhidrosis (1989)
