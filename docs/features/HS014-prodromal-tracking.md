# HS014 - Prodromal Symptom Tracking

**Status:** 🚀 TODO
**Priority:** LOW
**Complexity:** Medium
**Estimated Effort:** 4-6 hours
**Sprint:** 6 - Polish

---

## Overview

Track prodromal (pre-lesion) warning symptoms before a visible lesion appears. Allows users to identify early warning signs and potentially convert prodromal markers to full lesions when they develop.

---

## Requirements (from spec)

From `body-map-feature-spec.md` Section 2.7:

**Prodromal Symptoms:**
- Burning
- Stinging
- Itching
- Warmth
- Hyperhidrosis (excess sweating)
- Tightness
- "Something feels off"

**Lifecycle:**
1. User notices warning symptoms → creates ProdromalMarker
2. Marker tracks symptoms and location
3. If lesion develops → convert marker to HSLesion
4. If symptoms resolve → mark as resolved without lesion

---

## Technical Approach

### File Structure
```
components/HS/
├── ProdromalEntryModal.tsx     # Create prodromal marker
├── ProdromalMarker.tsx         # Map marker (dashed circle)
└── ConvertProdromalModal.tsx   # Convert to lesion

lib/hs/prodromal/
├── createMarker.ts
├── convertToLesion.ts
├── resolveMarker.ts
└── index.ts
```

### Data Model
```typescript
interface ProdromalMarker {
  id: string;
  regionId: string;
  coordinates: { x: number; y: number };
  date: string;

  symptoms: {
    burning: boolean;
    stinging: boolean;
    itching: boolean;
    warmth: boolean;
    hyperhidrosis: boolean;
    tightness: boolean;
    somethingFeelsOff: boolean;
  };

  convertedToLesionId?: string;
  conversionDate?: string;
  resolvedWithoutLesion?: boolean;
  resolvedDate?: string;

  createdAt: string;
}
```

---

## UI/UX Design

### Prodromal Entry Modal
```
┌─────────────────────────────────────┐
│  ⚪ Prodromal Warning               │
│  Left Axilla                   [X]  │
├─────────────────────────────────────┤
│                                     │
│  What symptoms are you feeling?     │
│  (Select all that apply)            │
│                                     │
│  ☑ Burning sensation               │
│  ☐ Stinging                        │
│  ☑ Itching                         │
│  ☑ Warmth                          │
│  ☐ Excess sweating                 │
│  ☐ Tightness                       │
│  ☐ "Something feels off"           │
│                                     │
│  Notes (optional):                  │
│  ┌─────────────────────────────┐   │
│  │ Feels like one is coming... │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Save Prodromal Marker]           │
│                                     │
│  This will be tracked separately   │
│  from lesions. You can convert it  │
│  to a lesion if one develops.      │
│                                     │
└─────────────────────────────────────┘
```

### Marker on Map
- Dashed teal circle (distinct from solid lesion markers)
- Shows on body map with other markers
- Tap to view/edit/convert

### Conversion Flow
```
┌─────────────────────────────────────┐
│  Convert to Lesion?                 │
├─────────────────────────────────────┤
│                                     │
│  This prodromal marker was created  │
│  2 days ago with these symptoms:    │
│  • Burning • Itching • Warmth       │
│                                     │
│  Did a lesion develop?              │
│                                     │
│  [Yes - Create Lesion]              │
│  [No - Symptoms Resolved]           │
│  [Keep Monitoring]                  │
│                                     │
└─────────────────────────────────────┘
```

---

## Acceptance Criteria

- [ ] ProdromalEntryModal captures warning symptoms
- [ ] Marker displayed as dashed teal circle
- [ ] Can view/edit existing prodromal markers
- [ ] Convert to lesion workflow
- [ ] Resolve without lesion workflow
- [ ] Conversion links marker to new lesion
- [ ] Marker history preserved after conversion
- [ ] Prodromal markers don't count in IHS4
- [ ] Analytics can correlate prodromal → lesion patterns

---

## Dependencies

**Required:**
- HS001: Database Schema (ProdromalMarker table)
- HS002: Core Logic (prodromal functions)
- HS006: Lesion Marker (for visual consistency)
- HS007: Lesion Entry Modal (for conversion)

**Optional:**
- None

---

## Testing Checklist

- [ ] Create prodromal marker works
- [ ] Marker appears on body map
- [ ] Conversion creates linked lesion
- [ ] Resolution marks as resolved
- [ ] Multiple symptoms can be selected
- [ ] Location preserved during conversion
- [ ] Prodromal not counted in IHS4
- [ ] Works offline

---

## Analytics Potential

Future enhancement: Analyze prodromal → lesion conversion rates to:
- Identify which warning symptoms most reliably predict lesions
- Track if early intervention affects outcomes
- Personalize warning alerts

---

## Related Files

- `/components/HS/ProdromalEntryModal.tsx` (to be created)
- `/components/HS/ConvertProdromalModal.tsx` (to be created)
- `/lib/hs/prodromal/` (to be created)

---

## References

- Specification: `docs/body-map-feature-spec.md` Section 2.7
- Implementation Plan: `docs/body-map-implementation-plan.md` Phase 10
