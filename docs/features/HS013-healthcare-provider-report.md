# HS013 - Healthcare Provider Report

**Status:** 🚀 TODO
**Priority:** MEDIUM
**Complexity:** High
**Estimated Effort:** 8-12 hours
**Sprint:** 5 - Clinical Features

---

## Overview

Generate comprehensive, shareable reports for healthcare provider visits. Includes current status, IHS4 trends, affected regions with Hurley stages, quality of life impact, trigger analysis, treatment history, and optional photos.

---

## Requirements (from spec)

From `body-map-feature-spec.md` Section 8:

**Report Sections:**
1. Current Status (IHS4, active lesion count)
2. Affected Regions (with Hurley stages)
3. Symptom Trends (30-day summary)
4. Quality of Life Impact
5. Potential Triggers Identified
6. Current Treatments
7. Photos (optional, with dates)

**Export Formats:**
- PDF (primary, for printing/email)
- CSV (data portability)
- JSON (technical backup)

---

## Technical Approach

### File Structure
```
lib/hs/reports/
├── index.ts
├── generateSummary.ts          # Create report data
├── formatPDF.ts                # PDF generation
└── formatCSV.ts                # CSV export

components/HS/
├── ReportPreview.tsx           # Preview component
├── ReportExport.tsx            # Export buttons
└── ReportDateRange.tsx         # Date selection

app/hs/
└── report/page.tsx             # Report page
```

### Report Data Structure
```typescript
interface HSReport {
  generatedAt: string;
  dateRange: { start: string; end: string };

  currentStatus: {
    ihs4: IHS4Result;
    activeLesionCount: number;
    healedLesionCount: number;
  };

  affectedRegions: Array<{
    regionId: string;
    regionName: string;
    hurleyStage: 1 | 2 | 3 | null;
    activeLesions: number;
    lesionBreakdown: { nodules: number; abscesses: number; tunnels: number };
  }>;

  symptomTrends: {
    averagePain: number;
    worstPainDay: { date: string; pain: number };
    flareDays: number;
    ihs4Range: { min: number; max: number };
    ihs4History: Array<{ date: string; score: number }>;
  };

  qualityOfLife: {
    sleepAffectedDays: number;
    workMissedDays: number;
    mobilityLimitedDays: number;
    // ... other QoL metrics
  };

  triggers: Array<{
    trigger: string;
    occurrences: number;
    correlation: number;  // Correlation strength
  }>;

  treatments: Array<{
    treatment: string;
    startDate?: string;
    frequency: string;
  }>;

  photos?: Array<{
    date: string;
    regionId: string;
    photoId: string;
  }>;
}
```

---

## UI/UX Design

### Report Preview
```
┌─────────────────────────────────────────────────┐
│  HS Status Report                               │
│  Generated: November 15, 2024                   │
│  Date Range: Oct 15 - Nov 15, 2024             │
├─────────────────────────────────────────────────┤
│                                                 │
│  CURRENT STATUS                                 │
│  ─────────────                                  │
│  IHS4 Score: 8 (Moderate)                       │
│  - Nodules: 3                                   │
│  - Abscesses: 1                                 │
│  - Draining Tunnels: 1                          │
│                                                 │
│  AFFECTED REGIONS                               │
│  ─────────────────                              │
│  • Left Axilla - Hurley Stage II                │
│    - 2 nodules, 1 abscess                       │
│  • Right Groin - Hurley Stage I                 │
│    - 1 nodule                                   │
│  • Left Inframammary - Hurley Stage II          │
│    - 1 draining tunnel                          │
│                                                 │
│  SYMPTOM TRENDS (Past 30 Days)                  │
│  ─────────────────────────────                  │
│  Average Pain: 5.2/10                           │
│  Worst Pain Day: Nov 8 (8/10)                   │
│  Flare Days: 4                                  │
│  IHS4 Range: 5-12                               │
│                                                 │
│  [Chart: IHS4 over time]                        │
│                                                 │
│  QUALITY OF LIFE IMPACT                         │
│  ─────────────────────                          │
│  Sleep affected: 12 days                        │
│  Work/school missed: 2 days                     │
│  Mobility limited: 8 days                       │
│                                                 │
│  POTENTIAL TRIGGERS                             │
│  ────────────────────                           │
│  • Menstrual cycle correlation noted            │
│  • Flares more common after high-stress days    │
│                                                 │
│  CURRENT TREATMENTS                             │
│  ──────────────────                             │
│  • Adalimumab (started: Sep 2024)               │
│  • Topical clindamycin (as needed)              │
│                                                 │
│  PHOTOS                                         │
│  ──────                                         │
│  [Photo thumbnails with dates]                  │
│                                                 │
├─────────────────────────────────────────────────┤
│  [📄 Download PDF] [📊 Export CSV] [📤 Share]  │
└─────────────────────────────────────────────────┘
```

---

## Acceptance Criteria

- [ ] Report page at `/hs/report`
- [ ] Date range selection (default: 30 days)
- [ ] All report sections populated from data
- [ ] IHS4 trend chart embedded
- [ ] PDF export generates professional document
- [ ] CSV export includes all numerical data
- [ ] Optional photo inclusion (with consent prompt)
- [ ] Share options (email, print)
- [ ] Report preview matches export
- [ ] Works offline (generates from local data)

---

## Dependencies

**Required:**
- HS001-003: Data layer
- HS011: Hurley Staging (for region status)
- HS012: IHS4 Trend Chart (embedded)
- PDF generation library (jsPDF or similar)

**Optional:**
- Photo gallery integration

---

## Testing Checklist

- [ ] Report generates with sample data
- [ ] PDF downloads correctly
- [ ] CSV parseable in Excel
- [ ] All sections populate from database
- [ ] Empty sections handled gracefully
- [ ] Date range changes update report
- [ ] Photos excluded when not selected
- [ ] Report printable (good print styles)
- [ ] Works on mobile

---

## Privacy Considerations

- Photos require explicit inclusion confirmation
- No personal identifiers exported by default
- Export warns about sensitive data
- Option to anonymize for sharing

---

## Related Files

- `/lib/hs/reports/` (to be created)
- `/components/HS/ReportPreview.tsx` (to be created)
- `/app/hs/report/page.tsx` (to be created)

---

## References

- Specification: `docs/body-map-feature-spec.md` Section 8
- Implementation Plan: `docs/body-map-implementation-plan.md` Phase 9
