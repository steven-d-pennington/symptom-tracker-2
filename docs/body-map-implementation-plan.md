# Body Map Feature Implementation Plan

## Overview

This plan outlines how to integrate the comprehensive HS-focused body map specification into the existing Symptom Tracker application. The implementation is designed to work with the existing architecture (Next.js 15 + React 19 + Dexie.js + Tailwind CSS).

---

## Current State Analysis

### Existing Body Map Features
- **Regions**: ~38 simplified regions (front/back views)
- **Zoom/Pan**: Uses `react-zoom-pan-pinch` library
- **Markers**: `FlareMarker` component with severity-based colors
- **Coordinate System**: Normalized 0-1 coordinates
- **Storage**: `Flare`, `FlareEvent`, `BodyMapLocation` tables

### What Needs to Change
| Aspect | Current | Target |
|--------|---------|--------|
| Regions | 38 simplified | 58 detailed (26 HS-priority + 32 standard) |
| Lesion Types | Generic flares | Nodules, Abscesses, Draining Tunnels, Prodromal |
| Scoring | None | IHS4 auto-calculation |
| Staging | None | Hurley staging per region |
| Zoom | Full body only | Zoom-to-region (detailed region view) |
| Daily Tracking | Generic symptoms | HS-specific daily entry |

---

## Implementation Phases

### Phase 1: Data Layer Foundation (P0 - Must Have)

**Goal**: Establish the new data models without breaking existing functionality.

#### 1.1 Database Schema Updates (`lib/db.ts`)

Add new interfaces and tables:

```typescript
// New interfaces to add
interface HSLesion { ... }           // Persistent lesion entity
interface LesionObservation { ... }  // Daily snapshot per lesion
interface DailyHSEntry { ... }       // HS-specific daily summary
interface ProdromalMarker { ... }    // Pre-lesion warning symptoms
interface RegionHurleyStatus { ... } // Hurley stage per region
```

**New Tables:**
- `hsLesions` - Persistent lesion records
- `lesionObservations` - Daily lesion observations
- `dailyHSEntries` - HS-specific daily summaries
- `prodromalMarkers` - Pre-lesion warning markers
- `regionHurleyStatuses` - Hurley staging per region

**Migration Strategy:**
- Add as new Dexie version (version 2)
- Existing `Flare` and `BodyMapLocation` tables remain unchanged
- Can optionally migrate old flares to HSLesions later

#### 1.2 Core Business Logic (`lib/hs/`)

Create new directory structure:
```
lib/hs/
├── index.ts                    # Exports
├── types.ts                    # Type definitions
├── ihs4.ts                     # IHS4 calculation logic
├── hurley.ts                   # Hurley staging logic
├── lesions/
│   ├── createLesion.ts         # Atomic lesion creation
│   ├── updateLesion.ts         # Lesion updates
│   ├── observeLesion.ts        # Add daily observation
│   ├── healLesion.ts           # Mark as healed
│   └── index.ts
├── dailyEntry/
│   ├── createEntry.ts          # Create daily HS entry
│   ├── updateEntry.ts          # Update entry
│   └── index.ts
└── prodromal/
    ├── createMarker.ts         # Create prodromal marker
    ├── convertToLesion.ts      # Convert prodromal → lesion
    └── index.ts
```

#### 1.3 IHS4 Calculation (`lib/hs/ihs4.ts`)

```typescript
export function calculateIHS4ForDate(lesions: HSLesion[], date: string): IHS4Result
export function getIHS4Severity(score: number): 'mild' | 'moderate' | 'severe'
export function getIHS4History(entries: DailyHSEntry[]): IHS4HistoryPoint[]
```

---

### Phase 2: Enhanced Body Map Regions (P0 - Must Have)

**Goal**: Expand from 38 to 58 detailed regions with HS-priority highlighting.

#### 2.1 Region Definition Update (`lib/bodyMap/regions/`)

Create hierarchical region structure:
```
lib/bodyMap/regions/
├── index.ts                    # Aggregates all regions
├── types.ts                    # Region type definitions
├── hsPriority/
│   ├── axillae.ts              # 4 regions
│   ├── groin.ts                # 6 regions
│   ├── inframammary.ts         # 6 regions
│   ├── buttocks.ts             # 6 regions
│   └── waistband.ts            # 4 regions
└── standard/
    ├── headNeck.ts             # 6 regions
    ├── torsoFront.ts           # 4 regions
    ├── torsoBack.ts            # 4 regions
    ├── arms.ts                 # 12 regions
    └── legs.ts                 # 12 regions
```

#### 2.2 Region Interface Enhancement

```typescript
interface BodyMapRegion {
  id: string                    // e.g., 'left-axilla-central'
  name: string                  // e.g., 'Left Axilla (central)'
  path: string                  // SVG path data
  view: 'front' | 'back'
  category: string              // e.g., 'hs-priority' | 'standard'
  isHSPriority: boolean
  parentRegion?: string         // For hierarchy (e.g., 'left-axilla')
  detailedSVG?: string          // Path to detailed region SVG
}
```

#### 2.3 SVG Asset Structure

```
public/body-map/
├── full/
│   ├── body-front.svg          # Full front view
│   └── body-back.svg           # Full back view
└── regions/
    ├── left-axilla.svg         # Detailed axilla view
    ├── right-axilla.svg
    ├── left-groin.svg
    ├── right-groin.svg
    ├── left-inframammary.svg
    ├── right-inframammary.svg
    ├── left-buttock.svg
    ├── right-buttock.svg
    └── ... (one per HS-priority region)
```

**Note**: For MVP, use enhanced SVG paths in code. Production should use professionally designed SVGs.

---

### Phase 3: Zoom-to-Region UI (P0 - Must Have)

**Goal**: Enable tap-to-zoom into individual regions for precise lesion placement.

#### 3.1 Enhanced BodyMap Component

Update `components/BodyMap/BodyMap.tsx`:
- Add `mode: 'overview' | 'zoomed'` state
- Add `zoomedRegionId` state
- Implement smooth zoom transition (300-400ms)
- Show detailed region SVG when zoomed

#### 3.2 New ZoomedRegionView Component

Create `components/BodyMap/ZoomedRegionView.tsx`:
```typescript
interface ZoomedRegionViewProps {
  regionId: string
  lesions: HSLesion[]
  onBack: () => void
  onAddLesion: (coordinates: { x: number; y: number }) => void
  onLesionClick: (lesion: HSLesion) => void
}
```

Features:
- Back button to return to overview
- Detailed region SVG display
- Existing lesion markers
- Tap-to-place new lesion
- Region header with name and Hurley stage

#### 3.3 Region Navigation

Create `components/BodyMap/RegionNavigation.tsx`:
- Quick-nav buttons to HS-priority regions
- Adjacent region navigation when zoomed
- Breadcrumb: "Body Map > Left Axilla"

---

### Phase 4: Lesion Entry & Tracking (P0 - Must Have)

**Goal**: Enable creation and tracking of HS lesions with proper typing.

#### 4.1 Lesion Type Selector

Create `components/HS/LesionTypeSelector.tsx`:
```typescript
interface LesionTypeSelectorProps {
  selectedType: LesionType | null
  onSelect: (type: LesionType) => void
}
```

Visual design:
- 2x2 grid of lesion types
- Each with icon, name, IHS4 weight
- Color-coded: Orange (nodule), Pink (abscess), Purple (tunnel), Teal (prodromal)

#### 4.2 Lesion Entry Modal

Create `components/HS/LesionEntryModal.tsx`:
- Bottom sheet pattern (mobile-friendly)
- Lesion type selection (required)
- Size selection (small/medium/large)
- Pain level slider (0-10)
- Drainage assessment (for abscesses/tunnels)
- "More Details" expandable section
- IHS4 impact preview

#### 4.3 Lesion Marker Component

Create `components/HS/HSLesionMarker.tsx`:
- Different shapes per type (circle, circle+dot, circle+line)
- Color-coded by type (using colorblind-safe palette)
- Severity-based pulse animation
- Status indicators (healing, healed, scarred)

#### 4.4 Quick Entry Mode

Create `components/HS/QuickLesionEntry.tsx`:
- Large touch targets (56px minimum)
- Single-tap type selection
- Pre-filled defaults from user patterns
- Minimal required fields

---

### Phase 5: IHS4 Dashboard (P0 - Must Have)

**Goal**: Display real-time IHS4 score with breakdown.

#### 5.1 IHS4 Score Card

Create `components/HS/IHS4ScoreCard.tsx`:
```typescript
interface IHS4ScoreCardProps {
  score: number
  severity: 'mild' | 'moderate' | 'severe'
  breakdown: { nodules: number; abscesses: number; tunnels: number }
  showDetails?: boolean
}
```

Features:
- Large score display with color indicator
- Severity badge (Mild/Moderate/Severe)
- Breakdown by lesion type with counts
- Compact and expanded variants

#### 5.2 Body Map Overview Header

Update overview state to show:
- Today's IHS4 score prominently
- Lesion type legend
- "Last updated" timestamp

---

### Phase 6: Daily HS Entry Integration (P1 - Should Have)

**Goal**: Integrate HS tracking with daily health reflections.

#### 6.1 Quick Daily Check-In

Create `components/HS/DailyCheckIn.tsx`:
- Mood selector (5 levels)
- "Any new lesions today?" prompt
- Overall pain slider
- Quick save option
- "Add More Details" expansion

#### 6.2 Full Daily Entry Form

Create `components/HS/DailyHSEntryForm.tsx`:
- Overall symptoms section
- Quality of life impacts checklist
- Triggers section
- Treatments used today
- Notes field

#### 6.3 Daily Entry Page Integration

Update `app/daily/page.tsx`:
- Add HS-specific section
- Show today's IHS4 calculation
- Link to body map for lesion updates
- Show lesion summary for the day

---

### Phase 7: Hurley Staging (P1 - Should Have)

**Goal**: Track Hurley stage per affected region.

#### 7.1 Hurley Stage Indicator

Create `components/HS/HurleyStageIndicator.tsx`:
- Visual badge (I, II, III)
- Tooltip with criteria
- Color coding

#### 7.2 Hurley Assessment Wizard

Create `components/HS/HurleyAssessmentWizard.tsx`:
- Guided questions to determine stage
- Per-region assessment
- Educational content about each stage

#### 7.3 Region Hurley Display

Update zoomed region view:
- Show current Hurley stage
- "Update Hurley Stage" action
- History of stage changes

---

### Phase 8: Analytics & Trends (P1 - Should Have)

**Goal**: Visualize IHS4 trends and lesion patterns.

#### 8.1 IHS4 Trend Chart

Create `components/HS/IHS4TrendChart.tsx`:
- Line chart of IHS4 over time
- Severity bands (mild/moderate/severe backgrounds)
- Date range selector

#### 8.2 Lesion Heatmap

Enhance `app/analytics/heatmap/page.tsx`:
- Show lesion density by region
- Filter by lesion type
- Time period selection

#### 8.3 Trigger Correlation

Create `components/HS/TriggerAnalysis.tsx`:
- Correlate triggers with IHS4 changes
- Show potential flare predictors

---

### Phase 9: Healthcare Provider Reports (P1 - Should Have)

**Goal**: Generate shareable summaries for doctor visits.

#### 9.1 Report Generator

Create `lib/hs/reports/`:
```
lib/hs/reports/
├── generateSummary.ts          # Create report data structure
├── formatPDF.ts                # PDF generation
├── formatCSV.ts                # CSV export
└── index.ts
```

#### 9.2 Report Preview

Create `components/HS/ReportPreview.tsx`:
- Current status section
- Affected regions with Hurley stages
- IHS4 trend chart
- Quality of life impact summary
- Trigger analysis
- Treatment history

#### 9.3 Export Options

Create `components/HS/ReportExport.tsx`:
- PDF download button
- CSV export for data
- Share options (email, print)
- Date range selection

---

### Phase 10: Prodromal Tracking (P2 - Nice to Have)

**Goal**: Track pre-lesion warning symptoms.

#### 10.1 Prodromal Entry

Create `components/HS/ProdromalEntryModal.tsx`:
- Symptom checkboxes (burning, stinging, itching, warmth, etc.)
- Location placement on body map
- Notes field

#### 10.2 Prodromal → Lesion Conversion

Create `components/HS/ConvertProdromalModal.tsx`:
- Show prodromal marker details
- Convert to full lesion with type selection
- Preserve location and date context

---

## File Structure Summary

```
lib/
├── db.ts                       # + New tables and interfaces
├── hs/                         # NEW: HS-specific business logic
│   ├── index.ts
│   ├── types.ts
│   ├── ihs4.ts
│   ├── hurley.ts
│   ├── lesions/
│   ├── dailyEntry/
│   ├── prodromal/
│   └── reports/
└── bodyMap/
    ├── bodyMapSVGs.ts          # UPDATED: Expanded regions
    ├── regions/                # NEW: Detailed region definitions
    └── coordinateUtils.ts      # Existing

components/
├── BodyMap/
│   ├── BodyMap.tsx             # UPDATED: Add zoom-to-region
│   ├── ZoomedRegionView.tsx    # NEW
│   ├── RegionNavigation.tsx    # NEW
│   └── ...existing
└── HS/                         # NEW: HS-specific components
    ├── LesionTypeSelector.tsx
    ├── LesionEntryModal.tsx
    ├── HSLesionMarker.tsx
    ├── QuickLesionEntry.tsx
    ├── IHS4ScoreCard.tsx
    ├── DailyCheckIn.tsx
    ├── DailyHSEntryForm.tsx
    ├── HurleyStageIndicator.tsx
    ├── HurleyAssessmentWizard.tsx
    ├── IHS4TrendChart.tsx
    ├── ReportPreview.tsx
    ├── ReportExport.tsx
    ├── ProdromalEntryModal.tsx
    └── ConvertProdromalModal.tsx

app/
├── hs/                         # NEW: HS tracking routes
│   ├── page.tsx                # HS dashboard with body map
│   ├── daily/page.tsx          # Daily HS entry
│   ├── history/page.tsx        # Lesion history
│   └── report/page.tsx         # Generate report
└── ... existing routes
```

---

## Testing Strategy

### Unit Tests
- `lib/hs/ihs4.ts` - IHS4 calculation accuracy
- `lib/hs/hurley.ts` - Hurley stage determination
- `lib/hs/lesions/` - CRUD operations
- Region coordinate normalization

### Integration Tests
- Full lesion lifecycle (create → observe → heal)
- Daily entry with lesion tracking
- IHS4 recalculation on changes

### Component Tests
- `LesionTypeSelector` - Type selection and callbacks
- `IHS4ScoreCard` - Correct display based on props
- `LesionEntryModal` - Form validation

---

## Accessibility Checklist

- [ ] All regions have descriptive ARIA labels
- [ ] Lesion markers announce type, severity, symptoms
- [ ] IHS4 score announced on body map load
- [ ] Minimum 44px touch targets (56px for flare mode)
- [ ] Keyboard navigation for all interactions
- [ ] Reduced motion support for zoom animations
- [ ] Screen reader announcements for state changes
- [ ] High contrast mode support
- [ ] Colorblind-safe palette with shape differentiation

---

## Implementation Order

### Sprint 1: Foundation
1. [ ] Database schema updates (Phase 1.1)
2. [ ] Core HS business logic (Phase 1.2, 1.3)
3. [ ] Unit tests for IHS4 calculation

### Sprint 2: Body Map Enhancement
4. [ ] Expanded region definitions (Phase 2)
5. [ ] Zoom-to-region functionality (Phase 3)
6. [ ] Lesion markers and entry modal (Phase 4)

### Sprint 3: IHS4 Dashboard
7. [ ] IHS4 score card component (Phase 5)
8. [ ] Body map overview with IHS4 display
9. [ ] HS dashboard page (`app/hs/page.tsx`)

### Sprint 4: Daily Tracking
10. [ ] Daily check-in component (Phase 6)
11. [ ] Full daily entry form
12. [ ] Integration with existing daily page

### Sprint 5: Clinical Features
13. [ ] Hurley staging (Phase 7)
14. [ ] Analytics and trends (Phase 8)
15. [ ] Healthcare provider reports (Phase 9)

### Sprint 6: Polish
16. [ ] Prodromal tracking (Phase 10)
17. [ ] Quick entry mode refinements
18. [ ] Accessibility audit and fixes
19. [ ] Performance optimization

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| SVG complexity | Start with enhanced path definitions; professional SVGs can be swapped later |
| Database migration | Use new Dexie version; don't modify existing tables |
| Performance with many lesions | Virtualize lesion lists; debounce IHS4 calculation |
| Breaking existing features | Keep existing Flare system parallel; don't remove |
| Accessibility gaps | Follow WCAG 2.1 AA; test with screen readers early |

---

## Success Criteria

### P0 (Must Have)
- [ ] Body map with 50+ regions rendering correctly
- [ ] Three lesion types (nodule, abscess, draining tunnel) with distinct visuals
- [ ] IHS4 score calculated and displayed in real-time
- [ ] Tap-to-zoom into regions with smooth animation
- [ ] Place lesions at precise coordinates in zoomed view
- [ ] Pain level and drainage capture per lesion
- [ ] Edit and delete existing lesions
- [ ] Data persists in IndexedDB
- [ ] Basic accessibility (touch targets, ARIA labels, keyboard nav)

### P1 (Should Have)
- [ ] Hurley stage tracking per region
- [ ] Full HSSD-aligned symptom capture
- [ ] Quick daily check-in mode
- [ ] IHS4 score history and trend chart
- [ ] Export summary report (PDF)

### P2 (Nice to Have)
- [ ] Prodromal symptom tracking
- [ ] Quality of life impact tracking
- [ ] Trigger correlation suggestions
- [ ] Photo attachment to lesions
