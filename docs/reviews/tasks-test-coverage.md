# Test Coverage Improvement Task List

**Created:** December 8, 2025
**Status:** Not Started
**Related Review:** [code-review-2025-12-08.md](./code-review-2025-12-08.md)

---

## Overview

This document tracks the implementation of comprehensive test coverage for the Pocket Symptom Tracker. Current coverage is estimated at <20% with only 4 test files. The target is 75%+ coverage.

---

## Current State

| Metric | Current | Target |
|--------|---------|--------|
| Test Files | 4 | 25+ |
| Total Test Cases | ~125 | 500+ |
| Lines of Test Code | 1,678 | 8,000+ |
| Test-to-Code Ratio | 5.1% | 25%+ |
| Estimated Coverage | <20% | 75%+ |

### Existing Test Files
- `__tests__/lib/hs/ihs4.test.ts` (525 lines) - IHS4 calculations
- `__tests__/lib/analytics/correlation.test.ts` (234 lines) - Correlation analysis
- `__tests__/lib/photos/encryption.test.ts` (252 lines) - Photo encryption
- `__tests__/integration/flareLifecycle.test.ts` (667 lines) - Flare workflow

---

## Phase 1: Critical Data Integrity (Priority: CRITICAL)

### Task 1.1: Export/Import Pipeline Tests

- **Priority:** CRITICAL
- **Status:** [ ] Pending
- **New File:** `__tests__/lib/export/importExport.test.ts`
- **Estimated Lines:** 400+

**Tests to Implement:**
- [ ] `validateBackupFile()` with valid backup files
- [ ] `validateBackupFile()` with corrupted/incomplete files
- [ ] `validateBackupFile()` with wrong format
- [ ] `parseBackupFile()` with all table types
- [ ] `parseBackupFile()` error handling
- [ ] `exportFullBackup()` metadata generation
- [ ] `exportFullBackup()` multi-table serialization
- [ ] `importBackup()` merge mode (deduplication)
- [ ] `importBackup()` replace mode (clean import)
- [ ] `getImportPreview()` record counting
- [ ] Table dependency ordering during import
- [ ] Binary photo data handling
- [ ] Progress callback functionality

**Acceptance Criteria:**
- [ ] 100% function coverage in `lib/export/`
- [ ] Edge cases for corrupted data
- [ ] Round-trip test (export → import → verify)

---

### Task 1.2: CSV Export Tests

- **Priority:** HIGH
- **Status:** [ ] Pending
- **New File:** `__tests__/lib/export/exportCSV.test.ts`
- **Estimated Lines:** 200+

**Tests to Implement:**
- [ ] CSV header generation
- [ ] Data escaping (commas, quotes, newlines)
- [ ] Date formatting
- [ ] Multi-table export
- [ ] Empty data handling
- [ ] Special characters in user data

---

### Task 1.3: PDF Export Tests

- **Priority:** HIGH
- **Status:** [ ] Pending
- **New File:** `__tests__/lib/export/exportPDF.test.ts`
- **Estimated Lines:** 300+

**Tests to Implement:**
- [ ] `gatherMedicalReportData()` data aggregation
- [ ] `gatherFlareSummaryData()` statistics
- [ ] `gatherCorrelationReportData()` calculations
- [ ] HTML template generation
- [ ] XSS prevention (verify sanitization)
- [ ] Date range filtering
- [ ] Empty data states

---

## Phase 2: Core Business Logic (Priority: HIGH)

### Task 2.1: Daily Entry Tests

- **Priority:** HIGH
- **Status:** [ ] Pending
- **New File:** `__tests__/lib/daily/saveDailyEntry.test.ts`
- **Estimated Lines:** 250+

**Tests to Implement:**
- [ ] `saveDailyEntry()` create new entry
- [ ] `saveDailyEntry()` update existing entry
- [ ] `saveDailyEntry()` upsert pattern
- [ ] `getDailyEntry()` retrieval
- [ ] `getDailyEntriesInRange()` date filtering
- [ ] `getAverageScores()` calculations
- [ ] Mood tracking validation
- [ ] Timezone edge cases
- [ ] Duplicate date handling

---

### Task 2.2: Hurley Staging Tests

- **Priority:** HIGH
- **Status:** [ ] Pending
- **New File:** `__tests__/lib/hs/hurley.test.ts`
- **Estimated Lines:** 300+

**Tests to Implement:**
- [ ] `determineHurleyStage()` Stage I (solitary)
- [ ] `determineHurleyStage()` Stage II (multiple, limited sinus)
- [ ] `determineHurleyStage()` Stage III (interconnected)
- [ ] `setRegionHurleyStatus()` CRUD operations
- [ ] `getRegionHurleyStatus()` retrieval
- [ ] `getWorstHurleyStage()` multi-region aggregation
- [ ] `countRegionsByHurleyStage()` statistics
- [ ] `getHurleyStageColor()` theme colors
- [ ] Region validation

---

### Task 2.3: Lesion Management Tests

- **Priority:** HIGH
- **Status:** [ ] Pending
- **New File:** `__tests__/lib/hs/lesions.test.ts`
- **Estimated Lines:** 350+

**Tests to Implement:**
- [ ] `createLesion()` with all lesion types (nodule, abscess, tunnel)
- [ ] `createLesion()` validation (required fields)
- [ ] `updateLesion()` state changes
- [ ] `updateLesion()` observation logging
- [ ] `healLesion()` with healing date
- [ ] `healLesion()` state transition
- [ ] `deleteLesion()` soft delete
- [ ] `getLesionsByRegion()` filtering
- [ ] `getActiveLesions()` status filtering
- [ ] Lesion type weight validation for IHS4

---

### Task 2.4: Medication Tracking Tests

- **Priority:** HIGH
- **Status:** [ ] Pending
- **New File:** `__tests__/lib/medications/medicationTracking.test.ts`
- **Estimated Lines:** 250+

**Tests to Implement:**
- [ ] `logMedication()` taken event
- [ ] `logMedication()` skipped event
- [ ] `getMedicationAdherence()` calculation
- [ ] `getMedicationEvents()` date filtering
- [ ] Reminder scheduling
- [ ] Dosage validation
- [ ] Medication lifecycle (create, update, deactivate)

---

### Task 2.5: Food & Trigger Tests

- **Priority:** MEDIUM
- **Status:** [ ] Pending
- **New Files:**
  - `__tests__/lib/food/foodTracking.test.ts`
  - `__tests__/lib/triggers/triggerTracking.test.ts`
- **Estimated Lines:** 300+

**Tests to Implement:**
- [ ] `logMeal()` food event creation
- [ ] `logTrigger()` trigger event creation
- [ ] Food synergy detection
- [ ] Correlation coefficient calculations
- [ ] Custom food/trigger creation
- [ ] Food/trigger deactivation

---

## Phase 3: Utility Functions (Priority: MEDIUM)

### Task 3.1: Utils Tests

- **Priority:** MEDIUM
- **Status:** [ ] Pending
- **New File:** `__tests__/lib/utils.test.ts`
- **Estimated Lines:** 150+

**Tests to Implement:**
- [ ] `generateGUID()` uniqueness (1000+ generations)
- [ ] `generateGUID()` UUID v4 format validation
- [ ] `validateSeverity()` boundary cases (0, 1, 10, 11)
- [ ] `validateCoordinate()` boundary cases (-0.1, 0, 1, 1.1)
- [ ] `formatDate()` various dates
- [ ] `formatDateISO()` timezone handling
- [ ] `sanitizeHTML()` XSS prevention
- [ ] `daysBetween()` calculations

---

### Task 3.2: Database Schema Tests

- **Priority:** MEDIUM
- **Status:** [ ] Pending
- **New File:** `__tests__/lib/db.test.ts`
- **Estimated Lines:** 200+

**Tests to Implement:**
- [ ] Schema initialization (all 23 tables)
- [ ] GUID uniqueness constraints
- [ ] Foreign key relationships
- [ ] Transaction handling
- [ ] Schema version migration
- [ ] Index performance

---

### Task 3.3: Analytics Engine Tests

- **Priority:** MEDIUM
- **Status:** [ ] Pending
- **New File:** `__tests__/lib/analytics/analytics.test.ts`
- **Estimated Lines:** 250+

**Tests to Implement:**
- [ ] `backgroundCorrelation.ts` lag window calculations
- [ ] `problemAreas.ts` area aggregation
- [ ] Confidence level thresholds
- [ ] Sample size validation
- [ ] Performance with large datasets

---

## Phase 4: Component Testing (Priority: HIGH)

### Task 4.1: Setup React Testing Library

- **Priority:** HIGH
- **Status:** [ ] Pending

**Setup Steps:**
- [ ] Verify @testing-library/react is installed
- [ ] Add @testing-library/user-event if needed
- [ ] Create test utilities file
- [ ] Set up mock providers for database

---

### Task 4.2: HS Component Tests

- **Priority:** HIGH
- **Status:** [ ] Pending
- **New Files:**
  - `__tests__/components/hs/IHS4ScoreCard.test.tsx`
  - `__tests__/components/hs/DailyHSEntryForm.test.tsx`
  - `__tests__/components/hs/LesionEntryModal.test.tsx`
  - `__tests__/components/hs/HurleyAssessmentWizard.test.tsx`
- **Estimated Lines:** 600+

**Tests to Implement:**
- [ ] Score card rendering with different severity levels
- [ ] Form validation (required fields)
- [ ] Form submission
- [ ] Modal open/close behavior
- [ ] Wizard step navigation
- [ ] Error state display

---

### Task 4.3: Symptom Component Tests

- **Priority:** HIGH
- **Status:** [ ] Pending
- **New Files:**
  - `__tests__/components/Symptoms/SymptomLoggingModal.test.tsx`
  - `__tests__/components/Symptoms/SymptomLocationPicker.test.tsx`
  - `__tests__/components/Symptoms/SymptomCard.test.tsx`
- **Estimated Lines:** 400+

**Tests to Implement:**
- [ ] Modal form validation
- [ ] Location picker coordinate handling
- [ ] Severity slider interaction
- [ ] Card display states
- [ ] Accessibility attributes

---

### Task 4.4: Body Map Tests

- **Priority:** MEDIUM
- **Status:** [ ] Pending
- **New Files:**
  - `__tests__/components/BodyMap/BodyMap.test.tsx`
  - `__tests__/components/BodyMap/BodyRegion.test.tsx`
- **Estimated Lines:** 300+

**Tests to Implement:**
- [ ] Region click detection
- [ ] Coordinate normalization
- [ ] Marker placement
- [ ] View switching (front/back)
- [ ] Zoom functionality

---

## Phase 5: Infrastructure (Priority: MEDIUM)

### Task 5.1: Increase Coverage Thresholds

- **Priority:** MEDIUM
- **Status:** [ ] Pending
- **File:** `jest.config.js`

**Changes:**
```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 75,
    lines: 75,
    statements: 75,
  },
  './lib/hs/': { lines: 90 },
  './lib/export/': { lines: 85 },
  './lib/daily/': { lines: 85 },
}
```

---

### Task 5.2: Add Pre-commit Hooks

- **Priority:** LOW
- **Status:** [ ] Pending

**Steps:**
- [ ] Install husky and lint-staged
- [ ] Configure pre-commit hook for tests
- [ ] Add to package.json scripts

---

### Task 5.3: Improve Crypto Mocking

- **Priority:** LOW
- **Status:** [ ] Pending
- **File:** `jest.setup.ts`

**Changes:**
- [ ] Replace simplistic crypto mock with real implementation
- [ ] Use Node.js webcrypto for actual encryption tests
- [ ] Add custom matchers for domain objects

---

## Success Criteria

### Minimum Viable Coverage
- [ ] 70%+ line coverage globally
- [ ] 85%+ coverage for `lib/hs/`
- [ ] 85%+ coverage for `lib/export/`
- [ ] 85%+ coverage for `lib/daily/`

### Quality Metrics
- [ ] All tests passing
- [ ] Test execution time < 30 seconds
- [ ] No flaky tests
- [ ] Edge cases covered

### Documentation
- [ ] Test patterns documented
- [ ] Mock utilities documented
- [ ] Coverage reports generated

---

## Estimated Timeline

| Phase | Tasks | Estimated Effort |
|-------|-------|-----------------|
| Phase 1 | Data Integrity | 3-4 days |
| Phase 2 | Business Logic | 4-5 days |
| Phase 3 | Utilities | 2-3 days |
| Phase 4 | Components | 5-7 days |
| Phase 5 | Infrastructure | 1-2 days |
| **Total** | | **15-21 days** |

---

## Test File Structure

```
__tests__/
├── components/
│   ├── BodyMap/
│   │   ├── BodyMap.test.tsx
│   │   └── BodyRegion.test.tsx
│   ├── hs/
│   │   ├── IHS4ScoreCard.test.tsx
│   │   ├── DailyHSEntryForm.test.tsx
│   │   ├── LesionEntryModal.test.tsx
│   │   └── HurleyAssessmentWizard.test.tsx
│   └── Symptoms/
│       ├── SymptomLoggingModal.test.tsx
│       ├── SymptomLocationPicker.test.tsx
│       └── SymptomCard.test.tsx
├── integration/
│   └── flareLifecycle.test.ts (existing)
└── lib/
    ├── analytics/
    │   ├── analytics.test.ts
    │   └── correlation.test.ts (existing)
    ├── daily/
    │   └── saveDailyEntry.test.ts
    ├── db.test.ts
    ├── export/
    │   ├── exportCSV.test.ts
    │   ├── exportPDF.test.ts
    │   └── importExport.test.ts
    ├── food/
    │   └── foodTracking.test.ts
    ├── hs/
    │   ├── hurley.test.ts
    │   ├── ihs4.test.ts (existing)
    │   └── lesions.test.ts
    ├── medications/
    │   └── medicationTracking.test.ts
    ├── photos/
    │   └── encryption.test.ts (existing)
    ├── triggers/
    │   └── triggerTracking.test.ts
    └── utils.test.ts
```

---

## Changelog

| Date | Update | Notes |
|------|--------|-------|
| 2025-12-08 | Document created | Initial task list from code review |

---

*Last updated: December 8, 2025*
