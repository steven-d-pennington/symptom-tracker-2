# F084 - Integration Tests (Flare Lifecycle)

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** High
**Estimated Effort:** 6-8 hours

---

## Overview

Integration tests for complete flare lifecycle. Create → Update → Resolve.

---

## Requirements (from spec)

Test full workflow. Verify database state. Test event creation. Test immutability.

---

## Technical Approach

### File Structure
```
tests/integration/flare.test.ts
```

### Database Operations
Test against real IndexedDB.

---

## Acceptance Criteria

- [ ] Test flare creation
- [ ] Test flare update
- [ ] Test flare resolution
- [ ] Test event creation (append-only)
- [ ] Test database transactions
- [ ] Verify immutability of events
- [ ] Test body map integration
- [ ] Test photo attachment
- [ ] All tests pass
- [ ] Cleanup test data

---

## Dependencies

Flare management (F024-F028)

---

## References

- Specification: Workflow 2-4: Flare Lifecycle
