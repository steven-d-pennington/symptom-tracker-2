# POL003 - Audit Logging Modals for isActive

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Low
**Estimated Effort:** 1-2 hours

---

## Overview

Audit all logging modals to ensure they only present items where `isActive: true`. Users should only see the symptoms, triggers, medications, and foods they've chosen to track.

---

## Requirements

From [Tracking Preferences Polish Plan](../plans/tracking-preferences-polish.md):
- Logging modals only show tracked (isActive) items
- If user hasn't selected anything, show helpful empty state
- Maintain performance with filtered queries

---

## Components to Audit

### 1. SymptomLoggingModal
**File:** `components/Symptoms/SymptomLoggingModal.tsx`
**Query:** `getActiveSymptoms()` - verify it filters by `isActive`

### 2. TriggerLoggerModal
**File:** `components/Triggers/TriggerLoggerModal.tsx`
**Query:** `getActiveTriggers()` - verify it filters by `isActive`

### 3. MealLoggerModal
**File:** `components/Food/MealLoggerModal.tsx`
**Query:** Food selection - verify it filters by `isActive`

### 4. Medication Logging
**File:** `components/Medications/MedicationLogger.tsx` (or equivalent)
**Query:** `getActiveMedications()` - verify it filters by `isActive`

---

## Technical Approach

### Verification Steps
1. Trace data flow from modal to database query
2. Confirm query includes `where('isActive').equals(true)` or equivalent
3. Test with mixed active/inactive data
4. Add empty state UI if no items are tracked

### Example Query Pattern
```typescript
// Correct pattern
export async function getActiveSymptoms(): Promise<Symptom[]> {
  return db.symptoms.where('isActive').equals(1).toArray()
}

// Usage in modal
const symptoms = await getActiveSymptoms()
```

### Empty State
```tsx
{symptoms.length === 0 && (
  <div className="text-center py-8">
    <p className="text-gray-500">No symptoms to track.</p>
    <Link href="/settings" className="text-blue-600">
      Add symptoms in Settings
    </Link>
  </div>
)}
```

---

## Acceptance Criteria

- [ ] SymptomLoggingModal only shows isActive symptoms
- [ ] TriggerLoggerModal only shows isActive triggers
- [ ] MealLoggerModal only shows isActive foods
- [ ] Medication logging only shows isActive medications
- [ ] Empty state shown when no items tracked
- [ ] Empty state links to Settings > Tracking

---

## Dependencies

**Required:**
- None (audit existing code)

**Related:**
- POL001, POL002 (Settings tracking management)

---

## Testing Checklist

- [ ] Set some symptoms to isActive: false, verify hidden
- [ ] Set all symptoms to isActive: false, verify empty state
- [ ] Repeat for triggers, foods, medications
- [ ] Verify no regression in logging functionality

---

## Related Files

- `components/Symptoms/SymptomLoggingModal.tsx`
- `components/Triggers/TriggerLoggerModal.tsx`
- `components/Food/MealLoggerModal.tsx`
- `components/Medications/*.tsx`
- `lib/symptoms/logSymptom.ts`
- `lib/triggers/logTrigger.ts`
- `lib/food/logMeal.ts`
- `lib/medications/*.ts`

---

## References

- [Tracking Preferences Polish Plan](../plans/tracking-preferences-polish.md)
