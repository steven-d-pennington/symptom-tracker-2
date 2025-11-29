# POL004 - Audit Daily Reflection Form

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Low
**Estimated Effort:** 1 hour

---

## Overview

Ensure the Daily Reflection form only displays symptoms, triggers, and medications that the user has chosen to track (isActive: true).

---

## Requirements

From [Tracking Preferences Polish Plan](../plans/tracking-preferences-polish.md):
- Symptom checkboxes only show tracked symptoms
- Trigger checkboxes only show tracked triggers
- Medication checkboxes only show tracked medications
- Empty states with links to Settings if nothing tracked

---

## Components to Audit

### DailyReflectionForm
**File:** `components/Daily/DailyReflectionForm.tsx` or `app/daily/page.tsx`

Sections to verify:
1. "How are you feeling?" symptom selection
2. "Any triggers today?" trigger selection
3. "Medications taken?" medication checklist

---

## Technical Approach

### Verification
```typescript
// Ensure queries filter by isActive
const symptoms = await db.symptoms.where('isActive').equals(1).toArray()
const triggers = await db.triggers.where('isActive').equals(1).toArray()
const medications = await db.medications.where('isActive').equals(1).toArray()
```

### Empty State Pattern
```tsx
{symptoms.length === 0 ? (
  <div className="text-center py-4 text-gray-500">
    <p>No symptoms configured.</p>
    <Link href="/settings" className="text-blue-600 text-sm">
      Set up tracking in Settings
    </Link>
  </div>
) : (
  <div className="grid grid-cols-2 gap-2">
    {symptoms.map(symptom => (
      <Checkbox key={symptom.guid} ... />
    ))}
  </div>
)}
```

---

## Acceptance Criteria

- [ ] Only isActive symptoms appear in daily reflection
- [ ] Only isActive triggers appear in daily reflection
- [ ] Only isActive medications appear in daily reflection
- [ ] Empty states show when categories have no tracked items
- [ ] Empty states link to Settings > Tracking

---

## Dependencies

**Required:**
- F044 Daily Reflection Form ✅

**Related:**
- POL001, POL002 (Settings tracking management)

---

## Testing Checklist

- [ ] Deactivate some symptoms, verify hidden in form
- [ ] Deactivate all triggers, verify empty state
- [ ] Complete a daily reflection with filtered items
- [ ] Verify saved data is correct

---

## Related Files

- `app/daily/page.tsx`
- `components/Daily/DailyReflectionForm.tsx`
- `lib/daily/*.ts`

---

## References

- [Tracking Preferences Polish Plan](../plans/tracking-preferences-polish.md)
- F044 Daily Reflection Form spec
