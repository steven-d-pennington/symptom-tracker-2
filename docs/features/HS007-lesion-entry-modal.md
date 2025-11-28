# HS007 - Lesion Entry Modal

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** High
**Estimated Effort:** 8-10 hours
**Sprint:** 2 - Body Map Enhancement

---

## Overview

Create a comprehensive lesion entry modal (bottom sheet pattern) for adding and editing HS lesions. Captures lesion type, size, pain level, drainage assessment, and optional detailed symptoms. Shows real-time IHS4 impact preview.

---

## Requirements (from spec)

From `body-map-feature-spec.md` Section 6:

**Required Fields:**
- Lesion type (nodule, abscess, draining tunnel, prodromal)
- Size (small <1cm, medium 1-3cm, large >3cm)
- Pain level (0-10)

**Optional Fields:**
- Drainage amount and type
- Additional symptoms (tenderness, swelling, heat, itch, pressure)
- Pain character (nociceptive vs neuropathic)
- Notes
- Photos

**Features:**
- IHS4 impact preview ("Adding this will change score from 5 to 7")
- Quick entry mode for flare-friendly input (large targets)
- Expandable "More Details" section

---

## Technical Approach

### File Structure
```
components/HS/
├── LesionEntryModal.tsx        # Main modal component
├── LesionTypeSelector.tsx      # 2x2 type grid
├── SizeSelector.tsx            # Size radio buttons
├── PainSlider.tsx              # 0-10 pain input
├── DrainageAssessment.tsx      # Drainage amount/type/odor
├── SymptomScores.tsx           # Additional symptom sliders
└── IHS4ImpactPreview.tsx       # Score change preview
```

### Component Props
```typescript
interface LesionEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lesion: HSLesionInput, observation: LesionObservationInput) => void;
  regionId: string;
  coordinates: { x: number; y: number };
  existingLesion?: HSLesion;  // For editing
  existingObservation?: LesionObservation;
  currentIHS4Score: number;
  quickEntryMode?: boolean;
}

interface HSLesionInput {
  lesionType: 'nodule' | 'abscess' | 'draining_tunnel';
  // ... other fields from HSLesion
}

interface LesionObservationInput {
  size: 'small' | 'medium' | 'large';
  symptoms: { pain: number; /* ... */ };
  drainage: { amount: string; type?: string; odor: string };
  // ... other fields
}
```

---

## UI/UX Design

### Basic Entry Layout (Bottom Sheet)
```
┌─────────────────────────────────────┐
│ ═══════════                         │  <- Drag handle
│                                     │
│  New Lesion - Left Axilla      [X]  │
│                                     │
│  What type of lesion?               │
│  ┌─────────────────────────────┐    │
│  │ 🔴 Nodule    │ 🟡 Abscess  │    │
│  │  (×1 IHS4)   │  (×2 IHS4)  │    │
│  ├──────────────┼─────────────┤    │
│  │ 🟣 Draining  │ ⚪ Prodromal │    │
│  │   Tunnel     │  (warning)   │    │
│  │  (×4 IHS4)   │              │    │
│  └─────────────────────────────┘    │
│                                     │
│  Size                               │
│  ○ Small (<1cm)  ● Medium  ○ Large │
│                                     │
│  Pain Level                         │
│  0 ───────●───────── 10             │
│           6                         │
│                                     │
│  Is it draining?                    │
│  ○ No  ○ Minimal  ● Moderate  ○ Heavy│
│                                     │
│  [+ More Details]                   │
│                                     │
│  ┌─────────────────────────────┐    │
│  │        Save Lesion          │    │
│  └─────────────────────────────┘    │
│                                     │
│  IHS4 Impact: +2 → Score: 8 (Mod)  │
│                                     │
└─────────────────────────────────────┘
```

### Expanded Details Section
```
┌─────────────────────────────────────┐
│  Additional Details                 │
├─────────────────────────────────────┤
│                                     │
│  Symptoms (0-10)                    │
│  Tenderness: ○○○○●○○○○○○  (4)      │
│  Swelling:   ○○○○○○●○○○○  (6)      │
│  Heat:       ○○○●○○○○○○○  (3)      │
│  Itch:       ○○●○○○○○○○○  (2)      │
│                                     │
│  Drainage Type (if applicable)      │
│  ○ Clear  ○ Blood-tinged           │
│  ● Purulent  ○ Mixed               │
│                                     │
│  Pain Character                     │
│  ☑ Aching/throbbing (nociceptive)  │
│  ☐ Burning/shooting (neuropathic)  │
│                                     │
│  Notes                              │
│  ┌─────────────────────────────┐    │
│  │ Started as bump 2 days ago, │    │
│  │ now draining...             │    │
│  └─────────────────────────────┘    │
│                                     │
│  [📷 Add Photo]                     │
│                                     │
└─────────────────────────────────────┘
```

### Quick Entry Mode (Flare-Friendly)
- Large touch targets (56px minimum)
- Single-tap type selection (no sliders)
- Pre-filled defaults from user's common patterns
- Voice input option for notes
- Save with minimal required fields

---

## Acceptance Criteria

- [ ] Modal opens as bottom sheet on mobile
- [ ] Lesion type selector with 2x2 grid
- [ ] Each type shows IHS4 weight
- [ ] Size selector with three options
- [ ] Pain slider with 0-10 range
- [ ] Drainage assessment (amount, type, odor)
- [ ] Expandable "More Details" section
- [ ] All additional symptom scores (0-10)
- [ ] Notes text area
- [ ] Photo attachment option
- [ ] IHS4 impact preview updates in real-time
- [ ] Save button creates lesion + observation
- [ ] Edit mode pre-fills existing values
- [ ] Quick entry mode with large targets
- [ ] Form validation (type required)
- [ ] Keyboard navigation works

---

## Dependencies

**Required:**
- HS001: Database Schema
- HS002: Core Business Logic (createLesion)
- HS003: IHS4 Calculation (for impact preview)
- HS006: Lesion Marker Component (for type icons)

**Optional:**
- Photo upload component (existing)

---

## Testing Checklist

- [ ] Modal opens and closes correctly
- [ ] All form fields functional
- [ ] Validation prevents empty type submission
- [ ] IHS4 preview updates when type changes
- [ ] Save creates correct database records
- [ ] Edit mode loads existing values
- [ ] Quick entry mode has large targets
- [ ] Works on mobile (bottom sheet)
- [ ] Works on desktop (centered modal)
- [ ] Accessible via keyboard
- [ ] Screen reader announces form labels

---

## Accessibility Requirements

- All form inputs have visible labels
- Error messages announced to screen readers
- Focus trapped within modal
- Escape closes modal
- Touch targets ≥44px (56px in quick mode)
- Slider values announced on change
- Required fields indicated

---

## Related Files

- `/components/HS/LesionEntryModal.tsx` (to be created)
- `/components/HS/LesionTypeSelector.tsx` (to be created)
- `/lib/hs/lesions/createLesion.ts` (dependency)
- `/lib/hs/ihs4.ts` (dependency)

---

## References

- Specification: `docs/body-map-feature-spec.md` Section 6
- Implementation Plan: `docs/body-map-implementation-plan.md` Phase 4.2
