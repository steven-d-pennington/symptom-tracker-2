# F031 - Symptom-Location Linking

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

---

## Overview

Link symptom instances to precise body map locations. Display symptom markers on body map.

---

## Requirements (from spec)

When logging symptom, optionally tap body map to specify location. Create BodyMapLocation entity. Display on body map.

---

## Technical Approach

### File Structure
```
components/Symptoms/SymptomLocationPicker.tsx, lib/symptoms/linkLocation.ts
```

### Database Operations
Create BodyMapLocation with symptomId, bodyRegion, coordinates, severity.

---

## Acceptance Criteria

- [ ] Optional location picker in symptom logger
- [ ] Tap body map to specify location
- [ ] Captures normalized coordinates
- [ ] Creates BodyMapLocation entity
- [ ] Symptom markers appear on body map
- [ ] Color-coded by severity
- [ ] Click marker shows symptom details
- [ ] Filter body map by symptom type

---

## Dependencies

Symptom logging (F029), Body map (F020), Coordinate capture (F022)

---

## References

- Specification: Domain Entities: BodyMapLocation
