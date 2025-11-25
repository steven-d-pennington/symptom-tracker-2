# F036 - Medication Reminders System

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** High
**Estimated Effort:** 6-8 hours

---

## Overview

Schedule-based notifications for medication reminders. Snooze functionality. Quick log from notification.

---

## Requirements (from spec)

Browser notifications at scheduled times. Snooze for 15/30/60 minutes. Mark as taken from notification.

---

## Technical Approach

### File Structure
```
lib/medications/reminderSystem.ts, components/Medications/ReminderSettings.tsx
```

### Database Operations
Query Medication.schedule to determine next reminder time. Create reminder queue.

---

## Acceptance Criteria

- [ ] Notifications at scheduled times
- [ ] Notification shows medication name and dosage
- [ ] Snooze options (15/30/60 min)
- [ ] Quick action: Mark as Taken
- [ ] Quick action: Mark as Skipped
- [ ] Dismiss notification
- [ ] Notification permission request
- [ ] Enable/disable per medication
- [ ] Works when app is closed (service worker)

---

## Dependencies

Medication scheduling (F033), Medication logging (F034), Service worker (F074)

---

## References

- Specification: F-004: Medication Management - Medication reminders
