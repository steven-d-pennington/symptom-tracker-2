# F031 - Symptom-Location Linking

**Status:** ✅ COMPLETED
**Priority:** MEDIUM
**Complexity:** Medium
**Completed:** 2025-11-25

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
components/Symptoms/SymptomLocationPicker.tsx
components/Symptoms/SymptomMarker.tsx
lib/symptoms/linkLocation.ts
```

### Database Operations
Create BodyMapLocation with symptomId, bodyRegion, coordinates, severity.

---

## Acceptance Criteria

- [x] Optional location picker in symptom logger
- [x] Tap body map to specify location
- [x] Captures normalized coordinates
- [x] Creates BodyMapLocation entity
- [x] Symptom markers appear on body map (SymptomMarker component)
- [x] Color-coded by severity
- [x] Click marker shows symptom details (tooltip)
- [x] Filter body map by symptom type (SymptomMarkersLayer supports filtering)

---

## Dependencies

Symptom logging (F029), Body map (F020), Coordinate capture (F022)

---

## References

- Specification: Domain Entities: BodyMapLocation
