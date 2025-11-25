#!/usr/bin/env node

/**
 * Script to generate feature documentation files
 * Run with: node docs/generate-features.js
 */

const fs = require('fs')
const path = require('path')

const features = [
  // Onboarding
  {
    id: 'F016',
    title: 'Symptom Selection Screen',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '3-4 hours',
    overview: 'Interactive screen for selecting symptoms to track from 50+ presets with categories, search, and custom addition.',
    requirements: 'Part of onboarding flow. Users select which symptoms they want to track. Includes real-time search, category organization (Physical, Cognitive, Emotional), and ability to add custom symptoms.',
    files: 'app/onboarding/steps/symptoms.tsx, components/onboarding/SymptomSelector.tsx',
    dbOps: 'Query db.symptoms where isDefault=true. Update isActive=true for selected symptoms. Add custom symptoms with isDefault=false.',
    acceptance: [
      'Display all preset symptoms organized by category',
      'Search filters symptoms in real-time',
      'Categories are collapsible/expandable',
      'Multi-select with visual checkboxes',
      'Selected count displayed',
      'Can add custom symptom with name and category',
      'Skip button allows proceeding without selection',
      'Selections saved to database on continue'
    ],
    dependencies: 'Symptom presets (F011✅), Database schema (F003✅), Onboarding flow (F015)',
    specRef: 'Workflow 1: First-Time Setup - Step 3'
  },
  {
    id: 'F017',
    title: 'Medication Selection Screen',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '3-4 hours',
    overview: 'Interactive screen for selecting medications to track from presets with dosage information.',
    requirements: 'Similar to symptom selection but for medications. Includes common medications database with dosage defaults.',
    files: 'app/onboarding/steps/medications.tsx, components/onboarding/MedicationSelector.tsx',
    dbOps: 'Query db.medications where isDefault=true. Enable selected medications. Create custom medications.',
    acceptance: [
      'Display preset medications with dosage info',
      'Search and filter medications',
      'Can add custom medication with name and dosage',
      'Skip option available',
      'Selections persist to database'
    ],
    dependencies: 'Database schema (F003✅), Onboarding flow (F015)',
    specRef: 'Workflow 1: First-Time Setup - Step 3'
  },
  {
    id: 'F018',
    title: 'Trigger Selection Screen',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '3-4 hours',
    overview: 'Screen for selecting environmental, lifestyle, and dietary triggers to monitor from 30+ presets.',
    requirements: 'Select triggers organized by category (Environmental, Lifestyle, Dietary). Search and custom addition supported.',
    files: 'app/onboarding/steps/triggers.tsx',
    dbOps: 'Enable selected triggers from db.triggers presets',
    acceptance: [
      'Triggers organized by category',
      'Search functionality',
      'Add custom triggers',
      'Skip option',
      'Persist selections'
    ],
    dependencies: 'Trigger presets (F012✅), Onboarding flow (F015)',
    specRef: 'Workflow 1: First-Time Setup - Step 3'
  },
  {
    id: 'F019',
    title: 'Food Selection Screen',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '3-4 hours',
    overview: 'Screen for selecting common foods to track from 200+ presets with allergen tags.',
    requirements: 'Food selection with category organization and allergen tag filtering. Users select frequently consumed foods.',
    files: 'app/onboarding/steps/foods.tsx',
    dbOps: 'Enable selected foods from db.foods presets',
    acceptance: [
      'Display foods by category',
      'Filter by allergen tags',
      'Search foods',
      'Add custom foods with allergen tags',
      'Persist selections'
    ],
    dependencies: 'Food presets (F013✅), Onboarding flow (F015)',
    specRef: 'Workflow 1: First-Time Setup - Step 3'
  },

  // Body Map
  {
    id: 'F021',
    title: 'Zoom & Pan Functionality',
    status: 'TODO',
    priority: 'HIGH',
    complexity: 'Medium',
    effort: '4-6 hours',
    overview: 'Implement zoom (1x to 3x) and pan controls for body map. Support pinch-to-zoom on mobile and scroll-wheel on desktop.',
    requirements: 'Zoom controls allow magnification from 1x to 3x. Pan by dragging when zoomed. Pinch-to-zoom on touch devices. Scroll-wheel zoom on desktop.',
    files: 'components/BodyMap/ZoomControls.tsx, lib/bodyMap/zoomPanUtils.ts',
    dbOps: 'No database operations. Client-side only.',
    acceptance: [
      'Zoom in/out buttons work (1x, 1.5x, 2x, 2.5x, 3x)',
      'Pinch-to-zoom works on mobile',
      'Scroll wheel zooms on desktop',
      'Pan by dragging when zoomed > 1x',
      'Zoom centers on cursor/touch point',
      'Pan bounds prevent scrolling off map',
      'Smooth transitions'
    ],
    dependencies: 'Body map SVG (F020)',
    specRef: 'F-001: Precision Body Mapping - Zoom/pan functionality'
  },
  {
    id: 'F022',
    title: 'Coordinate Capture',
    status: 'TODO',
    priority: 'HIGH',
    complexity: 'Medium',
    effort: '3-4 hours',
    overview: 'Capture normalized (0-1) coordinates when user taps body map region. Resolution-independent precision.',
    requirements: 'Convert screen tap coordinates to normalized 0-1 range relative to region bounds. Account for zoom level and pan offset.',
    files: 'lib/bodyMap/coordinateUtils.ts',
    dbOps: 'Store normalized coordinates in Flare.coordinateX and Flare.coordinateY',
    acceptance: [
      'Tap captures coordinates relative to region',
      'Coordinates normalized to 0-1 range',
      'Works at all zoom levels',
      'Works with pan offset',
      'Resolution independent',
      'Touch and mouse both work'
    ],
    dependencies: 'Body map SVG (F020), Zoom & pan (F021)',
    specRef: 'BR-4: Precision Tracking - Coordinate-level precision'
  },
  {
    id: 'F023',
    title: 'Region Selection & Highlighting',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Low',
    effort: '2-3 hours',
    overview: 'Highlight body regions on hover and selection. Show visual feedback when regions contain flares.',
    requirements: 'Regions highlight on hover. Selected region stays highlighted. Regions with flares have distinct styling.',
    files: 'components/BodyMap/BodyRegion.tsx, styles/bodyMap.css',
    dbOps: 'Query db.flares to check which regions have flares',
    acceptance: [
      'Regions highlight on hover',
      'Selected region visually distinct',
      'Regions with flares show indicator',
      'Hover shows region name tooltip',
      'Touch targets ≥ 44px'
    ],
    dependencies: 'Body map SVG (F020)',
    specRef: 'F-001: Precision Body Mapping - Region selection'
  },

  // Flare Management
  {
    id: 'F025',
    title: 'Flare Update Interface',
    status: 'TODO',
    priority: 'HIGH',
    complexity: 'Medium',
    effort: '4-6 hours',
    overview: 'Interface for updating existing flare with new severity, trend, and intervention details.',
    requirements: 'Allow updating flare severity, marking trend (improving/stable/worsening), logging interventions (ice, heat, medication, drainage, rest). Creates FlareEvent of type severity_update or intervention.',
    files: 'components/Flares/FlareUpdateModal.tsx, lib/flares/updateFlare.ts',
    dbOps: 'Create FlareEvent with type severity_update or intervention. Update Flare.currentSeverity and Flare.status.',
    acceptance: [
      'Modal shows current flare details',
      'Can update severity (1-10 slider)',
      'Can select trend (improving/stable/worsening)',
      'Can log interventions with checkboxes',
      'Intervention details text field',
      'Creates immutable FlareEvent',
      'Updates Flare currentSeverity',
      'Updates Flare status based on trend'
    ],
    dependencies: 'Flare creation (F024), Database schema (F003✅)',
    specRef: 'Workflow 3: Updating Flare Progression'
  },
  {
    id: 'F026',
    title: 'Flare Resolution Workflow',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Low',
    effort: '2-3 hours',
    overview: 'Mark flare as resolved with resolution date and notes. Creates final FlareEvent of type resolved.',
    requirements: 'Confirmation modal for marking flare as resolved. Optional resolution notes and final photo.',
    files: 'components/Flares/FlareResolutionModal.tsx, lib/flares/resolveFlare.ts',
    dbOps: 'Create FlareEvent type=resolved. Update Flare.status=resolved, set Flare.endDate.',
    acceptance: [
      'Confirmation dialog before resolving',
      'Resolution date editable (defaults today)',
      'Optional resolution notes',
      'Optional final photo',
      'Creates resolved FlareEvent',
      'Sets Flare.endDate',
      'Flare.status = resolved',
      'Removed from active flares list',
      'Cannot be re-opened after resolution'
    ],
    dependencies: 'Flare creation (F024), Flare update (F025)',
    specRef: 'Workflow 4: Resolving a Flare'
  },
  {
    id: 'F027',
    title: 'Active Flares List View',
    status: 'TODO',
    priority: 'HIGH',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'List view of all active flares with sorting, filtering, and quick actions.',
    requirements: 'Display active flares (status != resolved). Sort by date, severity, location. Filter by body region. Quick update and resolve actions.',
    files: 'app/flares/page.tsx, components/Flares/FlaresList.tsx, components/Flares/FlareCard.tsx',
    dbOps: 'Query db.flares where status != resolved. Join with latest FlareEvent for trend.',
    acceptance: [
      'Shows all active flares',
      'Sort by: start date, severity, location',
      'Filter by body region',
      'Card shows: location, current severity, days active, trend',
      'Click card opens detail view',
      'Quick actions: update, resolve',
      'Empty state when no flares',
      'Pagination for 20+ flares'
    ],
    dependencies: 'Flare creation (F024), Database schema (F003✅)',
    specRef: 'F-002: Flare Lifecycle Management - Active flares dashboard'
  },
  {
    id: 'F028',
    title: 'Flare Detail View',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '5-6 hours',
    overview: 'Detailed view of single flare showing complete event timeline, severity chart, interventions, and photos.',
    requirements: 'Show flare location on mini body map. Chronological event timeline. Severity trend chart. List of interventions. Photo gallery.',
    files: 'app/flares/[id]/page.tsx, components/Flares/FlareTimeline.tsx, components/Flares/SeverityChart.tsx',
    dbOps: 'Query db.flares by GUID. Query db.flareEvents where flareId = guid. Query db.photoAttachments.',
    acceptance: [
      'Shows flare location on mini body map',
      'Displays initial and current severity',
      'Shows days active',
      'Timeline of all FlareEvents',
      'Severity over time chart',
      'List of interventions',
      'Photo gallery (encrypted)',
      'Update and resolve buttons',
      'Export flare report button'
    ],
    dependencies: 'Flare creation (F024), Flare update (F025)',
    specRef: 'F-002: Flare Lifecycle Management - View flare history'
  }
]

// Generate feature documents
const featuresDir = path.join(__dirname, 'features')

features.forEach(feature => {
  const content = `# ${feature.id} - ${feature.title}

**Status:** 🚀 ${feature.status}
**Priority:** ${feature.priority}
**Complexity:** ${feature.complexity}
**Estimated Effort:** ${feature.effort}

---

## Overview

${feature.overview}

---

## Requirements (from spec)

${feature.requirements}

---

## Technical Approach

### File Structure
\`\`\`
${feature.files}
\`\`\`

### Database Operations
${feature.dbOps}

---

## Acceptance Criteria

${feature.acceptance.map(c => `- [ ] ${c}`).join('\n')}

---

## Dependencies

${feature.dependencies}

---

## References

- Specification: ${feature.specRef}
`

  const filename = path.join(featuresDir, `${feature.id}-${feature.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`)
  fs.writeFileSync(filename, content)
  console.log(`Created ${filename}`)
})

console.log(`\n✅ Generated ${features.length} feature documents`)
