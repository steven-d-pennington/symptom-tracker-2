# POL001 - Settings: Tracking Preferences Tab

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 2-3 hours

---

## Overview

Add a "Tracking" tab to the Settings page that provides centralized management of what symptoms, medications, triggers, and foods the user wants to track. This allows users to modify their onboarding selections without navigating to separate library pages.

---

## Requirements

From [Tracking Preferences Polish Plan](../plans/tracking-preferences-polish.md):
- Add new "Tracking" tab to Settings page tabs
- Show 4 category sections (Symptoms, Medications, Triggers, Foods)
- Display count of currently tracked items per category
- Link to expandable management for each category

---

## Technical Approach

### File Structure
```
components/Settings/TrackingPreferences.tsx   # Main component
app/settings/page.tsx                         # Add tab
```

### Implementation

1. Add "tracking" to `SettingsTab` type in `app/settings/page.tsx`
2. Add tab button with icon "📋" and label "Tracking"
3. Create `TrackingPreferences.tsx` component
4. Query counts for each category using existing functions

### Database Queries
```typescript
// Get counts for display
const symptomCount = await db.symptoms.where('isActive').equals(1).count()
const medicationCount = await db.medications.where('isActive').equals(1).count()
const triggerCount = await db.triggers.where('isActive').equals(1).count()
const foodCount = await db.foods.where('isActive').equals(1).count()
```

---

## UI/UX Design

```
+------------------------------------------+
| Tracking Preferences                      |
|                                          |
| Manage what you track in the app.        |
| Changes apply to logging screens.        |
|                                          |
| +--------------------------------------+ |
| | 📊 Symptoms                     8 → | |
| +--------------------------------------+ |
| | 💊 Medications                  3 → | |
| +--------------------------------------+ |
| | ⚡ Triggers                    12 → | |
| +--------------------------------------+ |
| | 🍽️ Foods                       25 → | |
| +--------------------------------------+ |
|                                          |
| These items appear in logging modals,    |
| daily reflections, and analytics.        |
+------------------------------------------+
```

Clicking a row expands to show the full management interface (POL002).

---

## Acceptance Criteria

- [ ] "Tracking" tab appears in Settings navigation
- [ ] Tab shows 4 category cards with accurate counts
- [ ] Counts update when items are enabled/disabled
- [ ] Cards are clickable/expandable
- [ ] Responsive on mobile
- [ ] Accessible (keyboard navigation, ARIA labels)

---

## Dependencies

**Required:**
- F063 Settings Page Layout ✅

**Related:**
- POL002 Tracking Category Management Component

---

## Testing Checklist

- [ ] Tab renders without errors
- [ ] Counts match database queries
- [ ] Works in dark mode
- [ ] Mobile responsive
- [ ] Keyboard accessible

---

## Related Files

- `app/settings/page.tsx` (modify)
- `components/Settings/TrackingPreferences.tsx` (create)
- `components/Settings/index.ts` (export)

---

## References

- [Tracking Preferences Polish Plan](../plans/tracking-preferences-polish.md)
