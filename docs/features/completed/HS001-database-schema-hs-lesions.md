# HS001 - Database Schema: HS Lesion Tables

**Status:** ✅ COMPLETED
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 4-6 hours
**Sprint:** 1 - Foundation

---

## Overview

Establish the new data models for HS (Hidradenitis Suppurativa) lesion tracking without breaking existing functionality. This adds new Dexie tables for persistent lesions, daily observations, daily summaries, prodromal markers, and Hurley staging.

---

## Requirements (from spec)

From `body-map-feature-spec.md` Section 2.3-2.7:
- HSLesion: Persistent lesion entity that lives until healed
- LesionObservation: Daily snapshot of lesion state
- DailyHSEntry: HS-specific daily summary with IHS4 calculation
- ProdromalMarker: Pre-lesion warning symptoms
- RegionHurleyStatus: Hurley staging per body region

---

## Technical Approach

### File Structure
```
lib/
├── db.ts                    # ADD: New interfaces and Dexie tables
└── hs/
    └── types.ts             # NEW: Type definitions exported separately
```

### Database Operations

**New Dexie Tables (version 2):**
```typescript
hsLesions: '++id, regionId, lesionType, status, onsetDate, healedDate'
lesionObservations: '++id, lesionId, entryId, date'
dailyHSEntries: '++id, &date'
prodromalMarkers: '++id, regionId, date, convertedToLesionId'
regionHurleyStatuses: '++id, &regionId, hurleyStage'
```

### Implementation Notes
- Use Dexie version upgrade (version 2) to add new tables
- Existing `Flare`, `FlareEvent`, `BodyMapLocation` tables remain unchanged
- Can optionally migrate old flares to HSLesions in a future feature
- All interfaces should match the spec exactly for clinical accuracy

---

## Interfaces to Implement

### HSLesion
```typescript
interface HSLesion {
  id: string;
  regionId: string;
  coordinates: { x: number; y: number };
  lesionType: 'nodule' | 'abscess' | 'draining_tunnel';
  status: 'active' | 'healing' | 'healed' | 'scarred';
  onsetDate: string;
  healedDate?: string;
  typeHistory?: { date: string; fromType: string; toType: string }[];
  recurrenceOf?: string;
  createdAt: string;
  updatedAt: string;
}
```

### LesionObservation
```typescript
interface LesionObservation {
  id: string;
  lesionId: string;
  entryId: string;
  date: string;
  size: 'small' | 'medium' | 'large';
  symptoms: {
    pain: number;
    tenderness: number;
    swelling: number;
    heat: number;
    itch: number;
    pressure: number;
  };
  drainage: {
    amount: 'none' | 'minimal' | 'moderate' | 'heavy';
    type?: 'clear' | 'blood-tinged' | 'purulent' | 'mixed';
    odor: 'none' | 'mild' | 'moderate' | 'severe';
  };
  painType?: { nociceptive: boolean; neuropathic: boolean };
  photos?: string[];
  notes?: string;
  statusChange?: { newStatus: string; note?: string };
  createdAt: string;
}
```

### DailyHSEntry
See spec Section 2.6 for complete interface.

### ProdromalMarker
See spec Section 2.7 for complete interface.

### RegionHurleyStatus
See spec Section 3.2 for complete interface.

---

## Acceptance Criteria

- [ ] HSLesion table created with proper indexes
- [ ] LesionObservation table created with lesionId/entryId indexes
- [ ] DailyHSEntry table created with unique date constraint
- [ ] ProdromalMarker table created
- [ ] RegionHurleyStatus table created with unique regionId
- [ ] All TypeScript interfaces exported from lib/db.ts
- [ ] Dexie version upgraded to version 2
- [ ] Existing tables (Flare, etc.) remain functional
- [ ] Database initializes without errors

---

## Dependencies

**Required:**
- lib/db.ts (existing Dexie setup)
- Dexie.js library (already installed)

**Optional:**
- None

---

## Testing Checklist

- [ ] Database initializes with new tables
- [ ] Can create HSLesion record
- [ ] Can create LesionObservation linked to lesion
- [ ] Can create DailyHSEntry with unique date
- [ ] Existing Flare operations still work
- [ ] Version upgrade doesn't lose existing data
- [ ] TypeScript types compile without errors

---

## Related Files

- `/lib/db.ts` (to be modified)
- `/lib/hs/types.ts` (to be created)

---

## References

- Specification: `docs/body-map-feature-spec.md` Section 2.3-2.7
- Implementation Plan: `docs/body-map-implementation-plan.md` Phase 1.1
