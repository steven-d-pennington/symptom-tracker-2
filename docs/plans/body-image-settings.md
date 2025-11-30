# Body Image Settings Implementation Plan

## Overview
Add user-selectable anatomical body images as visual backgrounds in the BodyMap component. Users select their body type during onboarding and can change it in settings.

## Key Decisions
- **Zoom behavior**: Background image only in main overview; zoomed region view shows outline only
- **Alignment**: Regions become semi-transparent overlays when image is shown (visual guide approach)
- **File naming**: `{gender}-{bodyType}-{view}.png` (e.g., `female-a-front.png`, `male-h-back.png`)
- **Settings location**: Set during onboarding, changeable in Settings > General

## Image Files
Located in `/public/body-images/`:
```
female-a-front.png  (available)
female-a-back.png   (available)
female-h-front.png  (available)
female-h-back.png   (available)
male-a-front.png    (pending)
male-a-back.png     (pending)
male-h-front.png    (pending)
male-h-back.png     (pending)
```

---

## Implementation Steps

### 1. Update Database Schema
**File**: `lib/db.ts`

Add body image preference to User interface:
```typescript
export interface User {
  // ... existing fields
  bodyImagePreference?: {
    gender: 'male' | 'female'
    bodyType: 'average' | 'heavy'
  } | null  // null = no background image
}
```

### 2. Create Settings API
**File**: `lib/settings/userSettings.ts`

Add functions:
- `getBodyImagePreference(): Promise<BodyImagePreference | null>`
- `updateBodyImagePreference(pref: BodyImagePreference | null): Promise<void>`

### 3. Update BodyMap Component
**File**: `components/BodyMap/BodyMap.tsx`

Changes:
- Replace `BodyImageOption` type with new preference-based system
- Update `BODY_IMAGE_URLS` to use new naming convention
- Add image error handling (fallback to no image if 404)
- Reduce region fill opacity when background image is shown
- Remove background image logic from `ZoomedRegionView` (keep it outline-only)

New type:
```typescript
export type BodyImagePreference = {
  gender: 'male' | 'female'
  bodyType: 'average' | 'heavy'
} | null
```

Image URL builder:
```typescript
function getBodyImageUrl(
  preference: BodyImagePreference,
  view: 'front' | 'back'
): string | null {
  if (!preference) return null
  const typeCode = preference.bodyType === 'average' ? 'a' : 'h'
  return `/body-images/${preference.gender}-${typeCode}-${view}.png`
}
```

### 4. Create BodyTypeSelector Component
**File**: `components/Settings/BodyTypeSelector.tsx`

Features:
- Visual grid of 4 options (2 genders × 2 body types)
- Thumbnail previews of each option
- "No image" option to disable background
- Selected state indicator
- Accessible with keyboard navigation

### 5. Add to Settings Page
**File**: `app/settings/page.tsx`

Add BodyTypeSelector to General tab with:
- Section title: "Body Map Appearance"
- Description explaining the feature
- Preview of current selection

### 6. Add to Onboarding Flow
**File**: `components/Onboarding/` (or wherever onboarding lives)

Add step:
- Title: "Personalize Your Body Map"
- Subtitle: "Choose an image that best represents you (optional)"
- Same selector UI as settings
- Skip button to proceed without selecting

### 7. Create Context/Hook for Body Preference
**File**: `lib/hooks/useBodyImagePreference.ts`

Hook that:
- Loads preference from IndexedDB on mount
- Provides current preference value
- Provides update function
- Handles loading state

Usage in BodyMap:
```typescript
const { preference, isLoading } = useBodyImagePreference()
// Pass to BodyMap or use directly
```

---

## Component Changes Summary

| Component | Change |
|-----------|--------|
| `BodyMap.tsx` | Update image URL logic, add error handling, adjust region opacity |
| `ZoomedRegionView.tsx` | No changes (already doesn't show background) |
| `BodyRegion.tsx` | Accept `hasBackgroundImage` prop to reduce fill opacity |
| `BodyTypeSelector.tsx` | New component |
| `app/settings/page.tsx` | Add BodyTypeSelector to General tab |
| Onboarding | Add body type selection step |

---

## Region Opacity When Image Is Shown

When background image is visible:
- Region fill: reduce from current opacity to ~0.1 (barely visible)
- Region stroke: keep visible for clickable boundaries
- Hover state: increase fill opacity to ~0.3 for feedback
- Selected state: increase fill opacity to ~0.4

This allows the anatomical image to be the primary visual while regions remain interactive.

---

## Error Handling

If image fails to load (404 for pending male images):
1. Catch error in `<image>` onError handler
2. Fall back to showing regions without background
3. Optionally show toast: "Body image not available"

---

## Migration

No database migration needed - new field is optional and defaults to `null` (no image).
