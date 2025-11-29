# HS015 - HS Features Accessibility Audit

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 6-8 hours
**Sprint:** 6 - Polish

---

## Overview

Conduct comprehensive accessibility audit and fixes for all HS tracking features. Ensure WCAG 2.1 AA compliance with focus on motor accessibility (important during flares when users may have limited dexterity).

---

## Requirements (from spec)

From `body-map-feature-spec.md` Section 10:

**Screen Reader Support:**
- All regions have descriptive labels
- Lesions announce type, severity, symptoms
- IHS4 score announced on body map load
- Modal state changes announced

**Motor Accessibility:**
- Touch targets ≥44px (56px for flare mode)
- Switch access / keyboard navigation
- No time-limited interactions
- Tap-to-place primary (no drag required)

**Visual Accessibility:**
- Color + shape indicators (not color alone)
- High contrast mode support
- System font size respected
- Reduced motion preference honored

**Cognitive Accessibility:**
- Clear, simple labels
- Consistent interaction patterns
- Undo for destructive actions
- Auto-save progress
- Quick entry mode for flares

---

## Technical Approach

### Audit Checklist by Component

**Body Map (HS004-005):**
- [ ] Region ARIA labels: "Left axilla region, 2 active lesions"
- [ ] Focus visible on regions
- [ ] Keyboard: Tab to navigate, Enter to zoom
- [ ] Touch targets minimum 44px

**Lesion Markers (HS006):**
- [ ] ARIA: "[Type] lesion, pain level [N]"
- [ ] Shape distinguishes type (not just color)
- [ ] High contrast borders
- [ ] Focus indicator visible

**Lesion Entry Modal (HS007):**
- [ ] Focus trap implemented
- [ ] Escape closes modal
- [ ] Form labels linked to inputs
- [ ] Error messages announced
- [ ] Touch targets 44px (56px quick mode)

**IHS4 Score Card (HS008):**
- [ ] Score announced: "IHS4 score 8, moderate severity"
- [ ] Color not sole indicator

**Daily Check-In (HS010):**
- [ ] Mood icons have text alternatives
- [ ] Slider values announced
- [ ] Save confirmation announced

**Hurley Assessment (HS011):**
- [ ] Wizard questions focusable
- [ ] Stage result announced
- [ ] Progress indicated

**Trend Chart (HS012):**
- [ ] Data table alternative available
- [ ] Keyboard navigation through points
- [ ] Values announced on focus

---

## ARIA Patterns

### Body Map Region
```html
<g
  role="button"
  aria-label="Left axilla region, 2 active lesions, Hurley Stage II"
  tabindex="0"
>
```

### Lesion Marker
```html
<div
  role="button"
  aria-label="Nodule lesion, pain level 6 out of 10, in left axilla"
  tabindex="0"
>
```

### IHS4 Score
```html
<div
  role="status"
  aria-live="polite"
  aria-label="IHS4 score 8, moderate severity, 3 nodules, 1 abscess, 1 draining tunnel"
>
```

---

## Testing Tools

1. **Automated:**
   - axe DevTools
   - Lighthouse accessibility audit
   - WAVE browser extension

2. **Manual:**
   - Keyboard-only navigation test
   - Screen reader testing (VoiceOver, NVDA)
   - High contrast mode test
   - Reduced motion test
   - Zoom to 200% test

3. **User Testing:**
   - Test with users during flare conditions
   - Gather feedback on quick entry mode

---

## Acceptance Criteria

- [ ] All interactive elements keyboard accessible
- [ ] Tab order logical
- [ ] Focus indicators visible
- [ ] Screen reader announces all content
- [ ] No color-only indicators
- [ ] Touch targets meet size requirements
- [ ] Reduced motion respected
- [ ] High contrast mode functional
- [ ] axe/Lighthouse report shows no critical issues
- [ ] WCAG 2.1 AA compliance verified

---

## Dependencies

**Required:**
- HS004-014: All HS features implemented

**Optional:**
- None

---

## Testing Checklist

- [ ] Keyboard-only navigation complete flow
- [ ] VoiceOver/NVDA test all components
- [ ] iOS VoiceOver test
- [ ] Android TalkBack test
- [ ] Windows High Contrast mode
- [ ] Browser zoom 200%
- [ ] Reduced motion browser setting
- [ ] Color blindness simulation

---

## Quick Entry Mode Validation

Special attention for flare-friendly mode:
- [ ] 56px minimum touch targets
- [ ] Single-tap actions (no holds/drags)
- [ ] Largest clickable areas possible
- [ ] Clear visual feedback on tap
- [ ] Error recovery without losing data

---

## Related Files

- All `/components/HS/` components
- `/app/hs/` pages
- `/lib/accessibility/` (existing utilities)

---

## References

- Specification: `docs/body-map-feature-spec.md` Section 10
- Implementation Plan: `docs/body-map-implementation-plan.md` Accessibility Checklist
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
