# Tracking Preferences Polish Plan

## Overview

Users select symptoms, medications, triggers, and foods during onboarding, but the tracking screens and logging modals currently show ALL active items rather than respecting these choices. Additionally, Settings lacks a dedicated interface to manage these selections post-onboarding.

## Current State

### Onboarding Flow
- Users select items during onboarding (F015-F019)
- Selected items have `isActive: true` set in the database
- Unselected preset items remain with `isActive: false`

### Tracking Screens
- `getActiveSymptoms()`, `getActiveTriggers()`, `getActiveFoods()`, etc. query for `isActive: true`
- This correctly filters, but ALL presets are active by default after DB initialization

### Library Pages
- `/triggers/library`, `/food/library` allow activate/deactivate
- Scattered access - not consolidated in Settings

### Settings Page
- No "Tracking Preferences" or "Manage Items to Track" section
- Quick Links only go to Export and Analytics

## Problem

1. **Logging modals show too many options** - If a user only wants to track 5 symptoms, they still see all 50+ active presets
2. **No centralized management** - Users must navigate to separate library pages to enable/disable items
3. **Onboarding selections not enforced** - After onboarding, all presets are still active

## Proposed Solution

### Phase 1: Settings - Tracking Preferences Section

Add a new "Tracking" tab in Settings with sub-sections for each category:
- Symptoms to Track
- Medications to Track
- Triggers to Track
- Foods to Track

Each section shows:
- Currently enabled items with toggle to disable
- "Add more" button to enable additional presets
- "Create custom" option
- Count of enabled items

### Phase 2: Respect isActive in All Screens

Audit all tracking screens and modals to ensure they only present `isActive: true` items:
- `SymptomLoggingModal` - symptom dropdown
- `TriggerLoggerModal` - trigger dropdown
- `MealLoggerModal` - food selection
- `DailyReflectionForm` - symptom/trigger/medication checkboxes
- Analytics filters

### Phase 3: Onboarding Initialization Fix

Ensure database initialization properly sets:
- All preset items to `isActive: false` initially
- Only items selected during onboarding get `isActive: true`

## Technical Approach

### New Files
```
components/Settings/TrackingPreferences.tsx    # Main component
components/Settings/TrackingCategory.tsx       # Reusable category section
lib/settings/trackingPreferences.ts            # Business logic
```

### Database Queries
```typescript
// Get user's actively tracked items
export async function getTrackedSymptoms(): Promise<Symptom[]> {
  return db.symptoms.where('isActive').equals(1).toArray()
}

// Enable/disable tracking
export async function setSymptomTracked(guid: string, tracked: boolean): Promise<void> {
  await db.symptoms.where('guid').equals(guid).modify({ isActive: tracked })
}
```

### Settings UI Pattern
```
+----------------------------------+
| Tracking Preferences             |
+----------------------------------+
| Symptoms (8 tracked)        [>]  |
| Medications (3 tracked)     [>]  |
| Triggers (12 tracked)       [>]  |
| Foods (25 tracked)          [>]  |
+----------------------------------+

Expanded:
+----------------------------------+
| Symptoms (8 tracked)             |
|  ☑ Fatigue                       |
|  ☑ Joint Pain                    |
|  ☑ Brain Fog                     |
|  ...                             |
|  [+ Add More] [+ Create Custom]  |
+----------------------------------+
```

## Feature Tasks

### POL001 - Settings: Tracking Preferences Tab
- Add "Tracking" tab to Settings page
- Create `TrackingPreferences.tsx` component
- Show 4 category sections with item counts
- Link to expand each category

### POL002 - Tracking Category Management Component
- Reusable component for each category (symptoms, meds, triggers, foods)
- Toggle items on/off with immediate save
- Search/filter within category
- "Add More" modal to enable from presets
- "Create Custom" to add new items

### POL003 - Audit Logging Modals for isActive
- Verify `SymptomLoggingModal` only shows tracked symptoms
- Verify `TriggerLoggerModal` only shows tracked triggers
- Verify `MealLoggerModal` only shows tracked foods
- Verify `MedicationLoggingModal` only shows tracked meds

### POL004 - Audit Daily Reflection Form
- Ensure symptom checkboxes only show tracked symptoms
- Ensure trigger checkboxes only show tracked triggers
- Ensure medication checkboxes only show tracked meds

### POL005 - Audit Analytics Filters
- Verify filter dropdowns only show tracked items
- Food correlation reports - only tracked foods
- Trigger analysis - only tracked triggers

### POL006 - Database Initialization Audit
- Verify presets initialize with `isActive: false`
- Verify onboarding sets selected items to `isActive: true`
- Add migration if needed for existing users

## Dependencies

- F063 Settings Page Layout (completed)
- F015-F019 Onboarding flow (completed)
- Library management pages (completed)

## Acceptance Criteria

- [ ] Settings has "Tracking" tab with all 4 categories
- [ ] Users can toggle items on/off from Settings
- [ ] Users can add more presets or create custom from Settings
- [ ] All logging modals only show tracked items
- [ ] Daily reflection only shows tracked items
- [ ] Analytics filters only show tracked items
- [ ] New users: only onboarding selections are active
- [ ] Existing users: no change to current active items

## Estimated Effort

- POL001: 2-3 hours
- POL002: 3-4 hours
- POL003: 1-2 hours
- POL004: 1 hour
- POL005: 1-2 hours
- POL006: 1-2 hours

**Total: 9-14 hours**
