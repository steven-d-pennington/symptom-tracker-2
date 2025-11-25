# F075 - Install Prompt (Mobile/Desktop)

**Status:** 🚀 TODO
**Priority:** LOW
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

---

## Overview

Custom install prompt encouraging users to install PWA.

---

## Requirements (from spec)

Detect installability. Show custom prompt. Handle user acceptance/dismissal. Track install events.

---

## Technical Approach

### File Structure
```
components/PWA/InstallPrompt.tsx
```

### Database Operations
Store install prompt dismissal in localStorage.

---

## Acceptance Criteria

- [ ] Detect beforeinstallprompt event
- [ ] Show custom install prompt UI
- [ ] Dismiss button (don't show again)
- [ ] Install button triggers native prompt
- [ ] Track install success
- [ ] Hide prompt after installation
- [ ] Respect user dismissal
- [ ] Works on mobile and desktop

---

## Dependencies

PWA manifest (F073), Service worker (F074)

---

## References

- Specification: PWA features - Install prompt
