# F046 - Photo Capture & Upload

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

Capture photos from camera or upload from gallery. Automatic encryption and EXIF stripping.

---

## Requirements (from spec)

Camera capture (mobile). File upload (desktop/mobile). Auto-encrypt with AES-256-GCM. Strip EXIF metadata.

---

## Technical Approach

### File Structure
```
components/Photos/PhotoCapture.tsx, lib/photos/uploadPhoto.ts
```

### Database Operations
Create PhotoAttachment with encrypted data, encryption key, IV, thumbnail.

---

## Acceptance Criteria

- [ ] Camera capture button (mobile)
- [ ] File upload button
- [ ] Image preview before saving
- [ ] Automatic EXIF stripping
- [ ] Automatic encryption (AES-256-GCM)
- [ ] Thumbnail generation (200x200)
- [ ] Thumbnail also encrypted
- [ ] Unique encryption key per photo
- [ ] Max file size validation (10MB)
- [ ] Image format validation (JPEG/PNG)
- [ ] Progress indicator during upload

---

## Dependencies

Photo encryption (F007✅), EXIF stripping (F008✅)

---

## References

- Specification: F-008: Photo Documentation - Photo capture
