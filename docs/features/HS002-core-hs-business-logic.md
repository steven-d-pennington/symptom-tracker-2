# HS002 - Core HS Business Logic

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 6-8 hours
**Sprint:** 1 - Foundation

---

## Overview

Create the core business logic for HS lesion management including CRUD operations for lesions, observations, and daily entries. This establishes the foundation for all HS tracking functionality.

---

## Requirements (from spec)

From `body-map-feature-spec.md` Section 2.9:
- Creating new lesions with initial observation
- Updating existing lesions (daily observations)
- Marking lesions as healed
- Lesion type evolution (nodule → abscess)
- Prodromal marker creation and conversion

---

## Technical Approach

### File Structure
```
lib/hs/
├── index.ts                    # Exports
├── types.ts                    # Type definitions
├── lesions/
│   ├── createLesion.ts         # Atomic lesion creation
│   ├── updateLesion.ts         # Lesion updates
│   ├── observeLesion.ts        # Add daily observation
│   ├── healLesion.ts           # Mark as healed
│   ├── evolveLesion.ts         # Change lesion type
│   └── index.ts
├── dailyEntry/
│   ├── createEntry.ts          # Create daily HS entry
│   ├── updateEntry.ts          # Update entry
│   ├── getOrCreateEntry.ts     # Get today's entry or create
│   └── index.ts
└── prodromal/
    ├── createMarker.ts         # Create prodromal marker
    ├── convertToLesion.ts      # Convert prodromal → lesion
    ├── resolveMarker.ts        # Mark as resolved without lesion
    └── index.ts
```

### Database Operations

**createLesion:**
1. Create HSLesion record
2. Create initial LesionObservation
3. Update/create DailyHSEntry for the date
4. Recalculate IHS4 score

**observeLesion:**
1. Verify lesion exists and is active
2. Create new LesionObservation
3. Update DailyHSEntry
4. Recalculate IHS4

**healLesion:**
1. Update HSLesion status to 'healed'
2. Set healedDate
3. Create final observation with statusChange
4. Recalculate IHS4 (lesion excluded)

### Implementation Notes
- All operations should be wrapped in Dexie transactions
- Use append-only pattern for observations (never modify)
- Soft updates for lesion status changes
- Generate UUIDs for all entity IDs
- Timestamps in ISO 8601 format

---

## Functions to Implement

### Lesion Operations
```typescript
// Create a new lesion with initial observation
async function createLesion(
  lesionData: Omit<HSLesion, 'id' | 'createdAt' | 'updatedAt'>,
  initialObservation: Omit<LesionObservation, 'id' | 'lesionId' | 'entryId' | 'createdAt'>
): Promise<HSLesion>

// Add a daily observation to existing lesion
async function observeLesion(
  lesionId: string,
  observation: Omit<LesionObservation, 'id' | 'lesionId' | 'entryId' | 'createdAt'>
): Promise<LesionObservation>

// Mark lesion as healed
async function healLesion(
  lesionId: string,
  healedDate: string,
  finalNote?: string
): Promise<HSLesion>

// Change lesion type (e.g., nodule → abscess)
async function evolveLesion(
  lesionId: string,
  newType: 'nodule' | 'abscess' | 'draining_tunnel'
): Promise<HSLesion>
```

### Daily Entry Operations
```typescript
// Get or create today's daily entry
async function getOrCreateDailyEntry(
  date: string
): Promise<DailyHSEntry>

// Update daily entry fields
async function updateDailyEntry(
  entryId: string,
  updates: Partial<DailyHSEntry>
): Promise<DailyHSEntry>
```

### Prodromal Operations
```typescript
// Create prodromal marker
async function createProdromalMarker(
  markerData: Omit<ProdromalMarker, 'id' | 'createdAt'>
): Promise<ProdromalMarker>

// Convert prodromal marker to full lesion
async function convertProdromalToLesion(
  markerId: string,
  lesionType: 'nodule' | 'abscess' | 'draining_tunnel',
  initialObservation: Omit<LesionObservation, 'id' | 'lesionId' | 'entryId' | 'createdAt'>
): Promise<HSLesion>
```

---

## Acceptance Criteria

- [ ] createLesion creates HSLesion + LesionObservation + updates DailyHSEntry
- [ ] observeLesion adds observation without modifying lesion
- [ ] healLesion updates status, sets healedDate, creates final observation
- [ ] evolveLesion tracks type history
- [ ] getOrCreateDailyEntry returns existing or creates new
- [ ] updateDailyEntry merges partial updates
- [ ] createProdromalMarker stores warning symptoms
- [ ] convertProdromalToLesion links marker to new lesion
- [ ] All operations use database transactions
- [ ] All operations generate proper timestamps

---

## Dependencies

**Required:**
- HS001: Database Schema (must be completed first)
- lib/utils.ts (for UUID generation)

**Optional:**
- None

---

## Testing Checklist

- [ ] createLesion returns valid HSLesion with ID
- [ ] Observation linked to correct lesion and entry
- [ ] healLesion excludes lesion from future IHS4
- [ ] evolveLesion preserves typeHistory
- [ ] Daily entry created with correct date
- [ ] Prodromal conversion preserves location
- [ ] Transaction rollback on error
- [ ] TypeScript types enforce correctness

---

## Related Files

- `/lib/hs/` (to be created)
- `/lib/db.ts` (dependency)

---

## References

- Specification: `docs/body-map-feature-spec.md` Section 2.9
- Implementation Plan: `docs/body-map-implementation-plan.md` Phase 1.2
