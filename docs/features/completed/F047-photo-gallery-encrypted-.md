# F047 - Photo Gallery (Encrypted)

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 5-6 hours

---

## Overview

Grid gallery view of all photos with encrypted thumbnails. Decrypt on-demand for viewing.

---

## Requirements (from spec)

Grid layout with encrypted thumbnails. Click to view full size (decrypted). Filter by date, tag, body region.

---

## Technical Approach

### File Structure
```
app/photos/page.tsx, components/Photos/PhotoGallery.tsx, lib/photos/decryptPhoto.ts
```

### Database Operations
Query PhotoAttachment. Decrypt thumbnail for display. Decrypt full image on click.

---

## Acceptance Criteria

- [ ] Grid layout of photo thumbnails
- [ ] Thumbnails decrypted on load
- [ ] Full image decrypted on click
- [ ] Modal viewer for full image
- [ ] Filter by date range
- [ ] Filter by tags
- [ ] Filter by body region
- [ ] Sort by date (newest/oldest)
- [ ] Shows photo metadata (date, size)
- [ ] Delete photo option
- [ ] Performance: lazy load thumbnails

---

## Dependencies

Photo capture (F046), Photo encryption (F007✅)

---

## References

- Specification: F-008: Photo Documentation - Photo management
