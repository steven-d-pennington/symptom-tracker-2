# F083 - Unit Tests (Encryption/Decryption)

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

Unit tests for photo encryption and decryption. Verify AES-256-GCM.

---

## Requirements (from spec)

Test encryption. Test decryption. Test key generation. Test EXIF stripping.

---

## Technical Approach

### File Structure
```
tests/encryption.test.ts
```

### Database Operations
No database operations. Crypto only.

---

## Acceptance Criteria

- [ ] Test photo encryption
- [ ] Test photo decryption
- [ ] Test round-trip (encrypt then decrypt)
- [ ] Test unique keys generated
- [ ] Test EXIF stripping
- [ ] Test thumbnail generation
- [ ] Test with various image formats
- [ ] Verify encryption strength
- [ ] All tests pass

---

## Dependencies

Photo encryption (F007✅), EXIF stripping (F008✅)

---

## References

- Specification: PS-003: Photo Encryption - AES-256-GCM
