# POL002 - Tracking Category Management Component

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

---

## Overview

Create a reusable component for managing tracked items within each category (symptoms, medications, triggers, foods). Users can toggle items on/off, search/filter, add more presets, and create custom items - all from within Settings.

---

## Requirements

From [Tracking Preferences Polish Plan](../plans/tracking-preferences-polish.md):
- Toggle items on/off with immediate database save
- Search/filter within category
- "Add More" button to enable items from presets
- "Create Custom" to add new user-defined items
- Show item metadata (category, description where applicable)

---

## Technical Approach

### File Structure
```
components/Settings/TrackingCategory.tsx      # Reusable component
lib/settings/trackingPreferences.ts           # Business logic
```

### Props Interface
```typescript
interface TrackingCategoryProps {
  category: 'symptoms' | 'medications' | 'triggers' | 'foods'
  title: string
  icon: string
  onCountChange?: (count: number) => void
}
```

### Database Operations
```typescript
// lib/settings/trackingPreferences.ts
export async function getTrackedItems(category: string) {
  return db[category].where('isActive').equals(1).toArray()
}

export async function getAllItems(category: string) {
  return db[category].toArray()
}

export async function setItemTracked(category: string, guid: string, tracked: boolean) {
  await db[category].where('guid').equals(guid).modify({ isActive: tracked })
}
```

---

## UI/UX Design

### Collapsed State (in TrackingPreferences)
```
+--------------------------------------+
| 📊 Symptoms                     8 → |
+--------------------------------------+
```

### Expanded State
```
+------------------------------------------+
| 📊 Symptoms (8 tracked)             [-]  |
+------------------------------------------+
| 🔍 Search symptoms...                    |
|                                          |
| Currently Tracking:                      |
| +--------------------------------------+ |
| | ☑ Fatigue              Physical    | |
| | ☑ Joint Pain           Physical    | |
| | ☑ Brain Fog            Cognitive   | |
| | ☑ Headache             Physical    | |
| | ☑ Nausea               Digestive   | |
| | ☑ Anxiety              Emotional   | |
| | ☑ Sleep Issues         Sleep       | |
| | ☑ Muscle Aches         Physical    | |
| +--------------------------------------+ |
|                                          |
| [+ Add More Symptoms] [+ Create Custom]  |
+------------------------------------------+
```

### "Add More" Modal
```
+------------------------------------------+
| Add Symptoms to Track                    |
+------------------------------------------+
| 🔍 Search available symptoms...          |
|                                          |
| Physical (15 available)                  |
| ☐ Swelling                               |
| ☐ Redness                                |
| ☐ Stiffness                              |
| ...                                      |
|                                          |
| Digestive (8 available)                  |
| ☐ Bloating                               |
| ...                                      |
|                                          |
| [Cancel]                    [Add Selected]|
+------------------------------------------+
```

---

## Acceptance Criteria

- [ ] Component shows all tracked items for category
- [ ] Toggle checkbox enables/disables tracking instantly
- [ ] Search filters displayed items in real-time
- [ ] "Add More" modal shows untracked presets
- [ ] Can select multiple items in "Add More"
- [ ] "Create Custom" opens appropriate form modal
- [ ] Count updates immediately on change
- [ ] Grouped by sub-category where applicable
- [ ] Accessible (screen readers, keyboard)
- [ ] Works in dark mode

---

## Dependencies

**Required:**
- POL001 Settings: Tracking Preferences Tab

**Uses:**
- Existing form components (SymptomForm, TriggerForm, etc.)
- Existing library functions

---

## Testing Checklist

- [ ] Toggle saves to database
- [ ] Search filters correctly
- [ ] Add More modal works
- [ ] Create Custom works
- [ ] Count stays in sync
- [ ] Mobile responsive
- [ ] Keyboard accessible
- [ ] Works offline

---

## Related Files

- `components/Settings/TrackingCategory.tsx` (create)
- `lib/settings/trackingPreferences.ts` (create)
- Reuse: `components/Symptoms/SymptomForm.tsx`
- Reuse: `components/Triggers/TriggerForm.tsx`
- Reuse: `components/Food/FoodForm.tsx`

---

## References

- [Tracking Preferences Polish Plan](../plans/tracking-preferences-polish.md)
- Trigger Library page pattern (`app/triggers/library/page.tsx`)
