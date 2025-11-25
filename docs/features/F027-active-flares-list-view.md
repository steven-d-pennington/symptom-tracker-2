# F027 - Active Flares List View

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

List view of all active flares with sorting, filtering, and quick actions.

---

## Requirements (from spec)

Display active flares (status != resolved). Sort by date, severity, location. Filter by body region. Quick update and resolve actions.

---

## Technical Approach

### File Structure
```
app/flares/page.tsx, components/Flares/FlaresList.tsx, components/Flares/FlareCard.tsx
```

### Database Operations
Query db.flares where status != resolved. Join with latest FlareEvent for trend.

---

## Acceptance Criteria

- [ ] Shows all active flares
- [ ] Sort by: start date, severity, location
- [ ] Filter by body region
- [ ] Card shows: location, current severity, days active, trend
- [ ] Click card opens detail view
- [ ] Quick actions: update, resolve
- [ ] Empty state when no flares
- [ ] Pagination for 20+ flares

---

## Dependencies

Flare creation (F024), Database schema (F003✅)

---

## References

- Specification: F-002: Flare Lifecycle Management - Active flares dashboard
