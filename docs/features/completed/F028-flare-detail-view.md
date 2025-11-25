# F028 - Flare Detail View

**Status:** ✅ COMPLETED
**Priority:** MEDIUM
**Complexity:** Medium
**Completed:** 2025-11-25

---

## Overview

Detailed view of single flare showing complete event timeline, severity chart, interventions, and photos.

---

## Requirements (from spec)

Show flare location on mini body map. Chronological event timeline. Severity trend chart. List of interventions. Photo gallery.

---

## Technical Approach

### File Structure
```
app/flares/[id]/page.tsx
components/Flares/FlareTimeline.tsx
components/Flares/SeverityChart.tsx
components/Flares/MiniBodyMap.tsx
```

### Database Operations
Query db.flares by GUID. Query db.flareEvents where flareId = guid. Query db.photoAttachments.

---

## Acceptance Criteria

- [x] Shows flare location on mini body map
- [x] Displays initial and current severity
- [x] Shows days active
- [x] Timeline of all FlareEvents
- [x] Severity over time chart
- [x] List of interventions
- [x] Photo gallery (encrypted)
- [x] Update and resolve buttons
- [x] Export flare report button (placeholder - exports functionality via F060)

---

## Dependencies

Flare creation (F024), Flare update (F025)

---

## References

- Specification: F-002: Flare Lifecycle Management - View flare history
