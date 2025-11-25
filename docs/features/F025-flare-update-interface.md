# F025 - Flare Update Interface

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 4-6 hours

---

## Overview

Interface for updating existing flare with new severity, trend, and intervention details.

---

## Requirements (from spec)

Allow updating flare severity, marking trend (improving/stable/worsening), logging interventions (ice, heat, medication, drainage, rest). Creates FlareEvent of type severity_update or intervention.

---

## Technical Approach

### File Structure
```
components/Flares/FlareUpdateModal.tsx, lib/flares/updateFlare.ts
```

### Database Operations
Create FlareEvent with type severity_update or intervention. Update Flare.currentSeverity and Flare.status.

---

## Acceptance Criteria

- [ ] Modal shows current flare details
- [ ] Can update severity (1-10 slider)
- [ ] Can select trend (improving/stable/worsening)
- [ ] Can log interventions with checkboxes
- [ ] Intervention details text field
- [ ] Creates immutable FlareEvent
- [ ] Updates Flare currentSeverity
- [ ] Updates Flare status based on trend

---

## Dependencies

Flare creation (F024), Database schema (F003✅)

---

## References

- Specification: Workflow 3: Updating Flare Progression
