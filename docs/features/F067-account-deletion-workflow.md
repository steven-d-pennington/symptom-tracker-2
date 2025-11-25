# F067 - Account Deletion Workflow

**Status:** 🚀 TODO
**Priority:** LOW
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

---

## Overview

Permanently delete all user data with confirmation and warning.

---

## Requirements (from spec)

Multi-step confirmation. Warning about data loss. Delete all database records. Reset app.

---

## Technical Approach

### File Structure
```
components/Settings/DeleteAccount.tsx, lib/settings/deleteAllData.ts
```

### Database Operations
Delete all records from all tables. Clear IndexedDB.

---

## Acceptance Criteria

- [ ] Clear warning message
- [ ] Multi-step confirmation
- [ ] Type "DELETE" to confirm
- [ ] Deletes all database records
- [ ] Deletes all photos and encryption keys
- [ ] No recovery possible
- [ ] Redirects to onboarding after deletion
- [ ] Export data option before deletion

---

## Dependencies

Database schema (F003✅)

---

## References

- Specification: PS-006: Secure Data Deletion - Hard deletes
