# F078 - Background Correlation Analysis

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** High
**Estimated Effort:** 6-8 hours

---

## Overview

Run correlation analysis in background worker. Don't block UI thread.

---

## Requirements (from spec)

Web Worker for correlation calculations. Run on schedule or trigger. Update UI when complete.

---

## Technical Approach

### File Structure
```
workers/correlationWorker.ts, lib/workers/workerManager.ts
```

### Database Operations
Worker reads from IndexedDB. Writes results back.

---

## Acceptance Criteria

- [ ] Web Worker for correlation analysis
- [ ] Runs in background (doesn't block UI)
- [ ] Scheduled to run (e.g., daily at 2 AM)
- [ ] Manual trigger option
- [ ] Progress updates to UI
- [ ] Results written to database
- [ ] Error handling in worker
- [ ] Worker can be terminated
- [ ] IndexedDB access from worker

---

## Dependencies

Correlation engine (F009✅)

---

## References

- Specification: Workflow 6: Discovering Food-Symptom Correlations - Background process
