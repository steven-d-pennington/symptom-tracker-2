# F016 - Symptom Selection Screen

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

---

## Overview

Interactive screen for selecting symptoms to track from 50+ presets with categories, search, and custom addition.

---

## Requirements (from spec)

Part of onboarding flow. Users select which symptoms they want to track. Includes real-time search, category organization (Physical, Cognitive, Emotional), and ability to add custom symptoms.

---

## Technical Approach

### File Structure
```
app/onboarding/steps/symptoms.tsx, components/onboarding/SymptomSelector.tsx
```

### Database Operations
Query db.symptoms where isDefault=true. Update isActive=true for selected symptoms. Add custom symptoms with isDefault=false.

---

## Acceptance Criteria

- [ ] Display all preset symptoms organized by category
- [ ] Search filters symptoms in real-time
- [ ] Categories are collapsible/expandable
- [ ] Multi-select with visual checkboxes
- [ ] Selected count displayed
- [ ] Can add custom symptom with name and category
- [ ] Skip button allows proceeding without selection
- [ ] Selections saved to database on continue

---

## Dependencies

Symptom presets (F011✅), Database schema (F003✅), Onboarding flow (F015)

---

## References

- Specification: Workflow 1: First-Time Setup - Step 3
