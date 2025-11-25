# F028 - Flare Detail View

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 5-6 hours

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
app/flares/[id]/page.tsx, components/Flares/FlareTimeline.tsx, components/Flares/SeverityChart.tsx
```

### Database Operations
Query db.flares by GUID. Query db.flareEvents where flareId = guid. Query db.photoAttachments.

---

## Acceptance Criteria

- [ ] Shows flare location on mini body map
- [ ] Displays initial and current severity
- [ ] Shows days active
- [ ] Timeline of all FlareEvents
- [ ] Severity over time chart
- [ ] List of interventions
- [ ] Photo gallery (encrypted)
- [ ] Update and resolve buttons
- [ ] Export flare report button

---

## Dependencies

Flare creation (F024), Flare update (F025)

---

## References

- Specification: F-002: Flare Lifecycle Management - View flare history
