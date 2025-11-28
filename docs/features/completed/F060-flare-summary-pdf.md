# F060 - Flare Summary PDF

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 4-5 hours

---

## Overview

Generate PDF report focused on flare history and progression.

---

## Requirements (from spec)

Flare timeline, severity charts, body map visualization, intervention effectiveness.

---

## Technical Approach

### File Structure
```
lib/export/flareSummaryPDF.ts
```

### Database Operations
Query flares and flareEvents, format for PDF.

---

## Acceptance Criteria

- [ ] Flare summary statistics
- [ ] Body map with flare locations
- [ ] Flare timeline chart
- [ ] Severity progression charts
- [ ] Intervention effectiveness table
- [ ] Problem areas heat map
- [ ] Date range selector
- [ ] Download as PDF

---

## Dependencies

Flare management (F024-F028)

---

## References

- Specification: F-010: Data Export & Sharing - Flare summary report
