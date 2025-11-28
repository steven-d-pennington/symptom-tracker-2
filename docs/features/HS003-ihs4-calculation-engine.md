# HS003 - IHS4 Calculation Engine

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 4-6 hours
**Sprint:** 1 - Foundation

---

## Overview

Implement the IHS4 (International Hidradenitis Suppurativa Severity Score System) calculation engine. IHS4 is a clinically-validated scoring system used by healthcare providers to assess HS disease severity.

---

## Requirements (from spec)

From `body-map-feature-spec.md` Section 2.2 and 2.8:

**IHS4 Formula:**
```
IHS4 = (Nodule Count × 1) + (Abscess Count × 2) + (Draining Tunnel Count × 4)
```

**Severity Thresholds:**
| Score | Severity | Display |
|-------|----------|---------|
| ≤3    | Mild     | Green   |
| 4-10  | Moderate | Yellow/Orange |
| ≥11   | Severe   | Red     |

---

## Technical Approach

### File Structure
```
lib/hs/
├── ihs4.ts                     # IHS4 calculation logic
└── index.ts                    # Export ihs4 functions
```

### Implementation Notes
- Calculate based on active lesions (status = 'active' | 'healing')
- Exclude healed/scarred lesions
- Handle date-specific calculations for historical views
- Cache/memoize for performance during rapid updates
- Return structured result with breakdown

---

## Functions to Implement

```typescript
// lib/hs/ihs4.ts

export interface IHS4Result {
  score: number;
  severity: 'mild' | 'moderate' | 'severe';
  breakdown: {
    nodules: number;
    abscesses: number;
    drainingTunnels: number;
  };
  lesionIds: string[];
}

/**
 * Calculate IHS4 score for a specific date
 * Considers lesions that were active on that date
 */
export function calculateIHS4ForDate(
  lesions: HSLesion[],
  date: string
): IHS4Result {
  // Get lesions that were active on this date
  const activeLesions = lesions.filter(lesion => {
    const onsetDate = new Date(lesion.onsetDate);
    const targetDate = new Date(date);
    const healedDate = lesion.healedDate ? new Date(lesion.healedDate) : null;

    // Lesion must have started on or before this date
    const hasStarted = onsetDate <= targetDate;

    // Lesion must not have healed before this date
    const notYetHealed = !healedDate || healedDate >= targetDate;

    // Must be in countable status
    const isCountable = ['active', 'healing'].includes(lesion.status);

    return hasStarted && notYetHealed && isCountable;
  });

  // Count by type
  const nodules = activeLesions.filter(l => l.lesionType === 'nodule').length;
  const abscesses = activeLesions.filter(l => l.lesionType === 'abscess').length;
  const tunnels = activeLesions.filter(l => l.lesionType === 'draining_tunnel').length;

  // Calculate score
  const score = (nodules * 1) + (abscesses * 2) + (tunnels * 4);

  // Determine severity
  const severity = score <= 3 ? 'mild'
    : score <= 10 ? 'moderate'
    : 'severe';

  return {
    score,
    severity,
    breakdown: { nodules, abscesses, drainingTunnels: tunnels },
    lesionIds: activeLesions.map(l => l.id)
  };
}

/**
 * Get severity level from IHS4 score
 */
export function getIHS4Severity(score: number): 'mild' | 'moderate' | 'severe' {
  if (score <= 3) return 'mild';
  if (score <= 10) return 'moderate';
  return 'severe';
}

/**
 * Get IHS4 history over a date range
 */
export function getIHS4History(
  entries: DailyHSEntry[],
  startDate?: string,
  endDate?: string
): Array<{ date: string; score: number; severity: string }> {
  // Filter by date range if provided
  // Return sorted by date
}

/**
 * Calculate IHS4 impact of adding a new lesion
 */
export function calculateIHS4Impact(
  currentScore: number,
  newLesionType: 'nodule' | 'abscess' | 'draining_tunnel'
): { newScore: number; change: number; newSeverity: string } {
  const weights = { nodule: 1, abscess: 2, draining_tunnel: 4 };
  const change = weights[newLesionType];
  const newScore = currentScore + change;
  return {
    newScore,
    change,
    newSeverity: getIHS4Severity(newScore)
  };
}
```

---

## Acceptance Criteria

- [ ] calculateIHS4ForDate returns correct score for given lesions
- [ ] Only active/healing lesions are counted
- [ ] Lesions are correctly filtered by date range
- [ ] Severity thresholds are accurate (≤3 mild, 4-10 moderate, ≥11 severe)
- [ ] Lesion type weights are correct (nodule=1, abscess=2, tunnel=4)
- [ ] Breakdown shows count of each lesion type
- [ ] lesionIds array contains IDs of counted lesions
- [ ] getIHS4History returns sorted date history
- [ ] calculateIHS4Impact previews score change

---

## Dependencies

**Required:**
- HS001: Database Schema (HSLesion, DailyHSEntry types)

**Optional:**
- None

---

## Testing Checklist

- [ ] Score 0 when no active lesions
- [ ] Score 3 for 3 nodules (mild)
- [ ] Score 4 for 2 abscesses (moderate)
- [ ] Score 11 for 1 nodule + 1 abscess + 2 tunnels (severe)
- [ ] Healed lesions not counted
- [ ] Future lesions not counted for past dates
- [ ] Severity boundaries correct (3→4, 10→11)
- [ ] Impact calculation shows correct delta
- [ ] Empty lesion array returns score 0

---

## Test Cases

```typescript
describe('IHS4 Calculation', () => {
  it('returns mild for 3 nodules', () => {
    const lesions = [
      { id: '1', lesionType: 'nodule', status: 'active', onsetDate: '2024-01-01' },
      { id: '2', lesionType: 'nodule', status: 'active', onsetDate: '2024-01-01' },
      { id: '3', lesionType: 'nodule', status: 'active', onsetDate: '2024-01-01' },
    ];
    const result = calculateIHS4ForDate(lesions, '2024-01-15');
    expect(result.score).toBe(3);
    expect(result.severity).toBe('mild');
  });

  it('returns severe for mixed lesions totaling 14', () => {
    const lesions = [
      { id: '1', lesionType: 'nodule', status: 'active', onsetDate: '2024-01-01' },      // 1
      { id: '2', lesionType: 'abscess', status: 'active', onsetDate: '2024-01-01' },     // 2
      { id: '3', lesionType: 'abscess', status: 'active', onsetDate: '2024-01-01' },     // 2
      { id: '4', lesionType: 'draining_tunnel', status: 'active', onsetDate: '2024-01-01' }, // 4
      { id: '5', lesionType: 'nodule', status: 'active', onsetDate: '2024-01-01' },      // 1
      { id: '6', lesionType: 'draining_tunnel', status: 'healing', onsetDate: '2024-01-01' }, // 4 (healing still counts)
    ];
    const result = calculateIHS4ForDate(lesions, '2024-01-15');
    expect(result.score).toBe(14);
    expect(result.severity).toBe('severe');
  });

  it('excludes healed lesions', () => {
    const lesions = [
      { id: '1', lesionType: 'nodule', status: 'healed', onsetDate: '2024-01-01', healedDate: '2024-01-10' },
    ];
    const result = calculateIHS4ForDate(lesions, '2024-01-15');
    expect(result.score).toBe(0);
  });
});
```

---

## Related Files

- `/lib/hs/ihs4.ts` (to be created)
- `/lib/hs/types.ts` (dependency)

---

## References

- Specification: `docs/body-map-feature-spec.md` Section 2.2, 2.8
- Implementation Plan: `docs/body-map-implementation-plan.md` Phase 1.3
- Clinical Reference: IHS4 validation study (Zouboulis et al.)
