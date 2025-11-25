# F021 - Zoom & Pan Functionality

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 4-6 hours

---

## Overview

Implement zoom (1x to 3x) and pan controls for body map. Support pinch-to-zoom on mobile and scroll-wheel on desktop.

---

## Requirements (from spec)

Zoom controls allow magnification from 1x to 3x. Pan by dragging when zoomed. Pinch-to-zoom on touch devices. Scroll-wheel zoom on desktop.

---

## Technical Approach

### File Structure
```
components/BodyMap/ZoomControls.tsx, lib/bodyMap/zoomPanUtils.ts
```

### Database Operations
No database operations. Client-side only.

---

## Acceptance Criteria

- [ ] Zoom in/out buttons work (1x, 1.5x, 2x, 2.5x, 3x)
- [ ] Pinch-to-zoom works on mobile
- [ ] Scroll wheel zooms on desktop
- [ ] Pan by dragging when zoomed > 1x
- [ ] Zoom centers on cursor/touch point
- [ ] Pan bounds prevent scrolling off map
- [ ] Smooth transitions

---

## Dependencies

Body map SVG (F020)

---

## References

- Specification: F-001: Precision Body Mapping - Zoom/pan functionality
