# F015 - Onboarding Flow

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 4-6 hours

---

## Overview

Create the first-time user onboarding experience that introduces the app's privacy-first architecture and guides users through initial setup.

---

## Requirements (from spec)

### Workflow 1: First-Time Setup (Onboarding)
**Trigger**: User installs/opens app for first time

**Steps**:
1. Welcome screen explains privacy-first architecture
2. User creates profile (name optional, no email required)
3. Interactive selection screens:
   - Select symptoms to track (from 50+ presets + custom)
   - Select medications (from presets + custom)
   - Select triggers to monitor (from 30+ presets + custom)
   - Select common foods (from 200+ presets + custom)
4. Each selection screen includes:
   - Real-time search/filter
   - Category organization (collapsible)
   - "Add custom" option
   - "Skip" option
5. Configure preferences:
   - Theme (light/dark/system)
   - Notification settings (reminder times)
   - Export format default
6. Quick tutorial (optional):
   - How to log symptoms
   - How to track flares on body map
   - How to view analytics
7. Dashboard tour (tooltips highlight key features)

**Success Criteria**:
- User has profile with GUID identifier
- User has selected initial tracking items
- User understands privacy guarantees
- User ready to begin logging

---

## Technical Approach

### File Structure
```
app/onboarding/
  page.tsx                    # Onboarding container
  layout.tsx                  # Onboarding-specific layout
  steps/
    welcome.tsx               # Step 1: Welcome & privacy
    profile.tsx               # Step 2: Optional profile info
    symptoms.tsx              # Step 3: Symptom selection
    medications.tsx           # Step 4: Medication selection
    triggers.tsx              # Step 5: Trigger selection
    foods.tsx                 # Step 6: Food selection
    preferences.tsx           # Step 7: Preferences
    tutorial.tsx              # Step 8: Quick tutorial
components/onboarding/
  StepIndicator.tsx           # Progress indicator
  SelectionCard.tsx           # Reusable selection component
  CategorySection.tsx         # Collapsible category
  SearchBar.tsx               # Search/filter component
lib/onboarding/
  onboardingState.ts          # State management
  completeOnboarding.ts       # Finalize setup
```

### Database Operations

**Check if onboarding needed:**
```typescript
const user = await getCurrentUser()
const needsOnboarding = !user || !user.onboardingCompleted
```

**Save onboarding selections:**
```typescript
// Enable selected presets
await db.symptoms
  .where('guid')
  .anyOf(selectedSymptomIds)
  .modify({ isActive: true })

// Create custom items
await db.symptoms.add({
  guid: generateGUID(),
  name: customSymptomName,
  category: 'Custom',
  isActive: true,
  isDefault: false,
  ...
})
```

**Complete onboarding:**
```typescript
await updateUserPreferences({
  onboardingCompleted: true,
  onboardingCompletedAt: Date.now(),
  theme: selectedTheme,
  notificationSettings: {
    enabled: true,
    medicationReminders: selectedReminderTimes,
  },
})
```

---

## UI/UX Design

### Step 1: Welcome Screen
```
+----------------------------------+
|  Pocket Symptom Tracker          |
|                                  |
|  🔒 Privacy First                |
|                                  |
|  Your health data stays on       |
|  your device. Always.            |
|                                  |
|  ✓ No cloud storage              |
|  ✓ No tracking                   |
|  ✓ No data sharing               |
|  ✓ You own your data             |
|                                  |
|  [Get Started]    [Learn More]   |
+----------------------------------+
```

### Step 3-6: Selection Screens (Pattern)
```
+----------------------------------+
|  Select Symptoms to Track        |
|  [1/4 steps]                     |
|                                  |
|  🔍 Search symptoms...           |
|                                  |
|  📍 Physical (12 selected)       |
|    ☑ Pain                        |
|    ☑ Swelling                    |
|    ☐ Redness                     |
|    ...                           |
|                                  |
|  🧠 Cognitive (2 selected)       |
|    ☑ Brain Fog                   |
|    ☐ Memory Issues               |
|    ...                           |
|                                  |
|  [+ Add Custom]                  |
|                                  |
|  [Skip]            [Continue]    |
+----------------------------------+
```

### Step Indicator Component
```typescript
<StepIndicator
  currentStep={3}
  totalSteps={8}
  steps={[
    { label: 'Welcome', completed: true },
    { label: 'Profile', completed: true },
    { label: 'Symptoms', completed: false },
    // ...
  ]}
/>
```

---

## State Management

### Onboarding Context
```typescript
interface OnboardingState {
  currentStep: number
  completed: boolean
  selections: {
    symptoms: string[]      // GUIDs
    medications: string[]
    triggers: string[]
    foods: string[]
  }
  customItems: {
    symptoms: Array<{ name: string; category: string }>
    medications: Array<{ name: string; dosage: string }>
    triggers: Array<{ name: string; category: string }>
    foods: Array<{ name: string; allergenTags: string[] }>
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notificationSettings: Record<string, unknown>
  }
}
```

---

## Acceptance Criteria

- [ ] Welcome screen displays privacy guarantees clearly
- [ ] User can optionally enter name (no email/password required)
- [ ] All 4 selection screens (symptoms, meds, triggers, foods) functional
- [ ] Search/filter works in real-time on selection screens
- [ ] Categories are collapsible and organized logically
- [ ] "Add custom" option creates new items in database
- [ ] "Skip" option allows bypassing any selection screen
- [ ] Preferences screen saves theme and notification settings
- [ ] Optional tutorial can be skipped or viewed
- [ ] Completing onboarding marks user.onboardingCompleted = true
- [ ] After onboarding, user redirects to main dashboard
- [ ] Selected presets are marked as active in database
- [ ] Custom items are created with isDefault = false
- [ ] Onboarding is never shown again for existing users

---

## Dependencies

**Required:**
- Database schema (F003) ✅
- Database initialization (F004) ✅
- Preset data (F011-F014) ✅

**Optional:**
- Can be enhanced later with tutorial tooltips

---

## Testing Checklist

- [ ] First-time user sees onboarding
- [ ] Returning user skips onboarding
- [ ] All steps navigate forward/backward correctly
- [ ] Search filters work on all selection screens
- [ ] Custom items are saved to database
- [ ] Skipping steps doesn't break flow
- [ ] Theme selection persists after onboarding
- [ ] Mobile responsive (all screen sizes)
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] Works offline

---

## Notes

- Keep onboarding short (< 5 minutes)
- Allow skipping any step (except welcome)
- Persist partial progress (allow resuming)
- Consider adding progress save to localStorage as backup
- Tutorial should highlight 3-4 key features only
- Use illustrations or icons to make it engaging

---

## Related Files

- `/app/onboarding/page.tsx` (to be created)
- `/lib/initDB.ts` (existing - user initialization)
- `/lib/db.ts` (existing - database schema)
- `/lib/presets/*.ts` (existing - preset data)

---

## References

- Specification: Section "Workflow 1: First-Time Setup (Onboarding)"
- User Experience Requirements: UX-002 (Progressive Disclosure)
