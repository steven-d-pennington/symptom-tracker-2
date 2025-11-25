# F057 - JSON Export (Full Backup)

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

---

## Overview

Export complete database as JSON file for backup and migration.

---

## Requirements (from spec)

Export all tables (users, flares, symptoms, medications, foods, etc.). Include encryption keys for photos.

---

## Technical Approach

### File Structure
```
lib/export/exportJSON.ts
```

### Database Operations
Read all tables from database, serialize to JSON.

---

## Acceptance Criteria

- [ ] Exports all database tables
- [ ] Includes encryption keys
- [ ] Valid JSON format
- [ ] Includes metadata (export date, version)
- [ ] Download as .json file
- [ ] File size indicator
- [ ] Can be used for data migration

---

## Dependencies

Database schema (F003✅)

---

## References

- Specification: Data Retention Rules: Export & Backup
