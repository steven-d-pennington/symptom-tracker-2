# F022 - Coordinate Capture

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

---

## Overview

Capture normalized (0-1) coordinates when user taps body map region. Resolution-independent precision.

---

## Requirements (from spec)

Convert screen tap coordinates to normalized 0-1 range relative to region bounds. Account for zoom level and pan offset.

---

## Technical Approach

### File Structure
```
lib/bodyMap/coordinateUtils.ts
```

### Database Operations
Store normalized coordinates in Flare.coordinateX and Flare.coordinateY

---

## Acceptance Criteria

- [ ] Tap captures coordinates relative to region
- [ ] Coordinates normalized to 0-1 range
- [ ] Works at all zoom levels
- [ ] Works with pan offset
- [ ] Resolution independent
- [ ] Touch and mouse both work

---

## Dependencies

Body map SVG (F020), Zoom & pan (F021)

---

## References

- Specification: BR-4: Precision Tracking - Coordinate-level precision
