# F026 - Flare Resolution Workflow

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Low
**Estimated Effort:** 2-3 hours

---

## Overview

Mark flare as resolved with resolution date and notes. Creates final FlareEvent of type resolved.

---

## Requirements (from spec)

Confirmation modal for marking flare as resolved. Optional resolution notes and final photo.

---

## Technical Approach

### File Structure
```
components/Flares/FlareResolutionModal.tsx, lib/flares/resolveFlare.ts
```

### Database Operations
Create FlareEvent type=resolved. Update Flare.status=resolved, set Flare.endDate.

---

## Acceptance Criteria

- [ ] Confirmation dialog before resolving
- [ ] Resolution date editable (defaults today)
- [ ] Optional resolution notes
- [ ] Optional final photo
- [ ] Creates resolved FlareEvent
- [ ] Sets Flare.endDate
- [ ] Flare.status = resolved
- [ ] Removed from active flares list
- [ ] Cannot be re-opened after resolution

---

## Dependencies

Flare creation (F024), Flare update (F025)

---

## References

- Specification: Workflow 4: Resolving a Flare
