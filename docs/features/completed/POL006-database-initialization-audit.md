# POL006 - Database Initialization Audit

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Low
**Estimated Effort:** 1-2 hours

---

## Overview

Audit and fix database initialization to ensure preset items start with `isActive: false` and only become active when selected during onboarding. This prevents the issue where all presets are active by default.

---

## Requirements

From [Tracking Preferences Polish Plan](../plans/tracking-preferences-polish.md):
- Presets initialize with `isActive: false`
- Onboarding sets selected items to `isActive: true`
- Existing users should not be affected (migration consideration)

---

## Current State Analysis

### Database Initialization
**File:** `lib/initDB.ts`

Current behavior (suspected):
```typescript
// Presets may be inserted with isActive: true
await db.symptoms.bulkAdd(
  symptomPresets.map(s => ({ ...s, isActive: true }))  // Problem!
)
```

### Onboarding Selection
**File:** `app/onboarding/steps/symptoms.tsx` (and others)

Current behavior:
```typescript
// May be setting isActive on already-active items
await db.symptoms
  .where('guid')
  .anyOf(selectedIds)
  .modify({ isActive: true })
```

---

## Technical Approach

### Fix 1: Preset Initialization
```typescript
// lib/initDB.ts
export async function initializePresets() {
  const existingSymptoms = await db.symptoms.count()
  if (existingSymptoms === 0) {
    await db.symptoms.bulkAdd(
      symptomPresets.map(s => ({
        ...s,
        isActive: false,  // Start inactive
        isDefault: true,
      }))
    )
  }
  // Repeat for triggers, foods, medications
}
```

### Fix 2: Onboarding Activation
```typescript
// Onboarding should explicitly activate selected items
async function completeOnboarding(selections: {
  symptoms: string[]
  triggers: string[]
  foods: string[]
  medications: string[]
}) {
  await db.transaction('rw', [db.symptoms, db.triggers, db.foods, db.medications], async () => {
    // Activate selected symptoms
    if (selections.symptoms.length > 0) {
      await db.symptoms
        .where('guid')
        .anyOf(selections.symptoms)
        .modify({ isActive: true })
    }
    // Repeat for other categories
  })
}
```

### Migration for Existing Users
```typescript
// Check if this is an existing user vs new user
async function needsMigration(): Promise<boolean> {
  const user = await db.users.toCollection().first()
  return user?.onboardingCompleted === true
}

// For existing users: leave their current isActive states alone
// For new users: presets start inactive
```

---

## Acceptance Criteria

- [ ] New user: all presets start with isActive: false
- [ ] New user: only onboarding selections become isActive: true
- [ ] Existing user: no change to their current isActive states
- [ ] Custom items created by user have isActive: true
- [ ] Database version increment if schema migration needed

---

## Dependencies

**Required:**
- F004 Database Initialization ✅
- F015 Onboarding Flow ✅

---

## Testing Checklist

- [ ] Fresh install: verify presets are inactive
- [ ] Complete onboarding: verify only selections are active
- [ ] Skip onboarding step: verify those items stay inactive
- [ ] Existing user upgrade: verify no data loss
- [ ] Create custom item: verify it's active

---

## Related Files

- `lib/initDB.ts`
- `lib/db.ts`
- `lib/onboarding/completeOnboarding.ts`
- `app/onboarding/steps/*.tsx`
- `lib/presets/symptoms.ts`
- `lib/presets/triggers.ts`
- `lib/presets/foods.ts`

---

## Migration Considerations

If existing users have all presets active, we have two options:

**Option A: Preserve current state**
- Don't migrate existing users
- Only affects new installations
- Existing users can manually disable in Settings

**Option B: Reset to onboarding selections**
- Would need to identify what user actually selected
- Risky - could remove items user wants to track
- Not recommended

**Recommendation:** Option A - preserve existing user state, fix for new users only.

---

## References

- [Tracking Preferences Polish Plan](../plans/tracking-preferences-polish.md)
- F004 Database Initialization spec
- F015 Onboarding Flow spec
