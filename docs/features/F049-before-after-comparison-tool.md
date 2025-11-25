# F049 - Before/After Comparison Tool

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

---

## Overview

Link two photos as before/after pair. Side-by-side or slider comparison view.

---

## Requirements (from spec)

Select two photos. Create PhotoComparison entity. View side-by-side or with slider.

---

## Technical Approach

### File Structure
```
components/Photos/PhotoComparison.tsx, lib/photos/createComparison.ts
```

### Database Operations
Create PhotoComparison with beforePhotoId, afterPhotoId, title, notes.

---

## Acceptance Criteria

- [ ] Select before photo
- [ ] Select after photo
- [ ] Create comparison with title
- [ ] Side-by-side view
- [ ] Slider view (overlay with draggable divider)
- [ ] Add notes about progress
- [ ] List of all comparisons
- [ ] Used for treatment effectiveness tracking

---

## Dependencies

Photo gallery (F047)

---

## References

- Specification: Domain Entities: PhotoComparison
