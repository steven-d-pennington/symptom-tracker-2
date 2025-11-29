# POL005 - Audit Analytics Filters

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Low
**Estimated Effort:** 1-2 hours

---

## Overview

Ensure analytics filter dropdowns and reports only show items the user has chosen to track (isActive: true). This provides a cleaner, more relevant analytics experience.

---

## Requirements

From [Tracking Preferences Polish Plan](../plans/tracking-preferences-polish.md):
- Filter dropdowns only show tracked items
- Food correlation reports use tracked foods
- Trigger analysis uses tracked triggers
- Symptom trends use tracked symptoms

---

## Components to Audit

### Analytics Pages
1. **Food-Symptom Correlation** (`app/analytics/food/page.tsx`)
   - Food filter dropdown
   - Symptom filter dropdown

2. **Trigger Analysis** (`app/analytics/triggers/page.tsx`)
   - Trigger filter dropdown
   - Symptom correlation display

3. **Symptom Trends** (`app/analytics/symptoms/page.tsx`)
   - Symptom filter dropdown

4. **Analytics Dashboard** (`app/analytics/page.tsx`)
   - Any filter controls

---

## Technical Approach

### Verification
```typescript
// Analytics filters should use active items only
const symptoms = useLiveQuery(() =>
  db.symptoms.where('isActive').equals(1).toArray()
)

// Filter dropdown
<select>
  <option value="all">All Tracked Symptoms</option>
  {symptoms?.map(s => (
    <option key={s.guid} value={s.guid}>{s.name}</option>
  ))}
</select>
```

### Correlation Engine
Verify `lib/correlationAnalysis.ts` or `lib/analytics/` functions filter input data to tracked items only.

---

## Acceptance Criteria

- [ ] Food correlation page only shows tracked foods in filters
- [ ] Trigger analysis only shows tracked triggers in filters
- [ ] Symptom trends only shows tracked symptoms in filters
- [ ] Correlation calculations only use tracked items
- [ ] Charts/reports only display tracked item data

---

## Dependencies

**Required:**
- F050-F056 Analytics features ✅

**Related:**
- POL001, POL002 (Settings tracking management)

---

## Testing Checklist

- [ ] Deactivate a food, verify removed from food correlation filter
- [ ] Deactivate a trigger, verify removed from trigger analysis
- [ ] Deactivate a symptom, verify removed from symptom trends
- [ ] Verify correlation results update appropriately

---

## Related Files

- `app/analytics/page.tsx`
- `app/analytics/food/page.tsx`
- `app/analytics/symptoms/page.tsx`
- `app/analytics/triggers/page.tsx`
- `lib/correlationAnalysis.ts`
- `lib/analytics/*.ts`

---

## References

- [Tracking Preferences Polish Plan](../plans/tracking-preferences-polish.md)
- F052 Food-Symptom Correlation Reports
- F056 Trigger Impact Analysis
