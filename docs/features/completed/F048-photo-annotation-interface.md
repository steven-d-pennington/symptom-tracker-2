# F048 - Photo Annotation Interface

**Status:** 🚀 TODO
**Priority:** LOW
**Complexity:** High
**Estimated Effort:** 6-8 hours

---

## Overview

Draw annotations on photos (arrows, circles, text). Annotations also encrypted.

---

## Requirements (from spec)

Canvas-based drawing. Add arrows, circles, text labels. Save annotations as encrypted JSON. Render on photo view.

---

## Technical Approach

### File Structure
```
components/Photos/PhotoAnnotator.tsx, lib/photos/annotationUtils.ts
```

### Database Operations
Store annotations in PhotoAttachment.annotations (encrypted JSON string).

---

## Acceptance Criteria

- [ ] Drawing tools: arrow, circle, freehand
- [ ] Text tool for labels
- [ ] Color picker
- [ ] Undo/redo
- [ ] Clear all annotations
- [ ] Annotations saved as encrypted JSON
- [ ] Annotations rendered on photo view
- [ ] Works on touch and mouse
- [ ] Export photo with annotations

---

## Dependencies

Photo gallery (F047)

---

## References

- Specification: Domain Entities: PhotoAttachment - Annotations (optional, encrypted)
