#!/usr/bin/env node

/**
 * Complete feature documentation generator
 * Generates all remaining feature docs (F029-F086)
 */

const fs = require('fs')
const path = require('path')

const features = [
  // SYMPTOM TRACKING (F029-F031)
  {
    id: 'F029',
    title: 'Symptom Logging Interface',
    status: 'TODO',
    priority: 'HIGH',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'Interface for logging symptom occurrences with severity rating, optional location, duration, and notes.',
    requirements: 'Quick log symptoms with 1-10 severity scale. Optional body location linking. Track duration and associated triggers. Add notes and photos.',
    files: 'app/symptoms/page.tsx, components/Symptoms/SymptomLogger.tsx, lib/symptoms/logSymptom.ts',
    dbOps: 'Create SymptomInstance with symptomId, timestamp, severity, optional bodyRegion/coordinates, duration, notes, photoIds.',
    acceptance: [
      'Select symptom from active symptoms list',
      'Severity slider (1-10) with labels',
      'Optional body location selector (links to body map)',
      'Optional duration picker (minutes/hours)',
      'Optional trigger associations (multi-select)',
      'Notes field (unlimited text)',
      'Photo attachment option',
      'Timestamp editable (defaults to now)',
      'Creates SymptomInstance in database',
      'Quick log mode (just symptom + severity)',
      'Detailed log mode (all fields)'
    ],
    dependencies: 'Database schema (F003✅), Symptom presets (F011✅), Body map (F020)',
    specRef: 'F-003: Symptom Tracking'
  },
  {
    id: 'F030',
    title: 'Symptom History View',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '3-4 hours',
    overview: 'Timeline view of all symptom instances with filtering, sorting, and trend visualization.',
    requirements: 'List all symptom instances chronologically. Filter by symptom type, date range, severity. Show frequency and severity trends.',
    files: 'app/symptoms/history/page.tsx, components/Symptoms/SymptomTimeline.tsx',
    dbOps: 'Query db.symptomInstances with filters. Aggregate by symptom type for frequency analysis.',
    acceptance: [
      'Chronological list of symptom instances',
      'Filter by symptom type',
      'Filter by date range',
      'Filter by severity range',
      'Sort by date, severity, or symptom',
      'Shows symptom name, severity, location, timestamp',
      'Click to view full details',
      'Frequency chart per symptom',
      'Severity trend line chart',
      'Export symptom history'
    ],
    dependencies: 'Symptom logging (F029), Database schema (F003✅)',
    specRef: 'F-003: Symptom Tracking - Symptom instances timeline'
  },
  {
    id: 'F031',
    title: 'Symptom-Location Linking',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '3-4 hours',
    overview: 'Link symptom instances to precise body map locations. Display symptom markers on body map.',
    requirements: 'When logging symptom, optionally tap body map to specify location. Create BodyMapLocation entity. Display on body map.',
    files: 'components/Symptoms/SymptomLocationPicker.tsx, lib/symptoms/linkLocation.ts',
    dbOps: 'Create BodyMapLocation with symptomId, bodyRegion, coordinates, severity.',
    acceptance: [
      'Optional location picker in symptom logger',
      'Tap body map to specify location',
      'Captures normalized coordinates',
      'Creates BodyMapLocation entity',
      'Symptom markers appear on body map',
      'Color-coded by severity',
      'Click marker shows symptom details',
      'Filter body map by symptom type'
    ],
    dependencies: 'Symptom logging (F029), Body map (F020), Coordinate capture (F022)',
    specRef: 'Domain Entities: BodyMapLocation'
  },

  // MEDICATION MANAGEMENT (F032-F036)
  {
    id: 'F032',
    title: 'Medication Library Management',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'Manage medication library: add custom medications, edit dosages, view side effects, enable/disable medications.',
    requirements: 'CRUD operations for medications. Set dosage, frequency, schedule. Track side effects. Soft delete (set isActive=false).',
    files: 'app/medications/library/page.tsx, components/Medications/MedicationForm.tsx, lib/medications/manageMedication.ts',
    dbOps: 'Create, update Medication entities. Set isActive=false for soft delete. Query active medications.',
    acceptance: [
      'List all medications (active and inactive)',
      'Add custom medication with name, dosage, frequency',
      'Edit medication details',
      'Set medication schedule (times/days)',
      'Add side effects list',
      'Disable medication (soft delete)',
      'Re-enable disabled medication',
      'Search/filter medications',
      'Sort by name, frequency, date added'
    ],
    dependencies: 'Database schema (F003✅)',
    specRef: 'Domain Entities: Medication'
  },
  {
    id: 'F033',
    title: 'Medication Scheduling Interface',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'Define medication schedules with flexible recurring patterns (daily, weekly, custom intervals).',
    requirements: 'Set medication times (e.g., 8am, 8pm). Define days of week. Handle irregular schedules. Support "as needed" medications.',
    files: 'components/Medications/ScheduleEditor.tsx, lib/medications/scheduleUtils.ts',
    dbOps: 'Update Medication.schedule object with times array and optional days.',
    acceptance: [
      'Define daily schedule (times)',
      'Define weekly schedule (specific days)',
      'Custom interval (every N days)',
      'As-needed (PRN) option',
      'Multiple times per day',
      'Time zone aware',
      'Visual schedule preview',
      'Validate schedule conflicts'
    ],
    dependencies: 'Medication library (F032)',
    specRef: 'Domain Entities: Medication - Schedule'
  },
  {
    id: 'F034',
    title: 'Medication Logging (Taken/Skipped)',
    status: 'TODO',
    priority: 'HIGH',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'Log when medication is taken or skipped. Track actual time vs scheduled time. Record dosage overrides.',
    requirements: 'Quick log "taken" or "skipped". Editable timestamp. Dosage override. Notes for why skipped. Timing warnings.',
    files: 'components/Medications/MedicationLogger.tsx, lib/medications/logMedication.ts',
    dbOps: 'Create MedicationEvent with medicationId, timestamp, taken (boolean), dosageOverride, notes, timingWarning.',
    acceptance: [
      'Quick action buttons: Taken / Skipped',
      'Timestamp editable (defaults to now)',
      'Dosage override field (if different from default)',
      'Notes field (especially for skipped)',
      'Timing warning (early/late/on-time)',
      'Creates immutable MedicationEvent',
      'Updates adherence stats',
      'Notification dismiss on log'
    ],
    dependencies: 'Medication library (F032), Database schema (F003✅)',
    specRef: 'Domain Entities: MedicationEvent'
  },
  {
    id: 'F035',
    title: 'Adherence Tracking & Reports',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'Calculate medication adherence percentage. Show missed doses. Trend over time. Export adherence report.',
    requirements: 'Calculate: (doses taken / doses scheduled) × 100. Show weekly/monthly adherence. List missed doses.',
    files: 'app/medications/adherence/page.tsx, lib/medications/calculateAdherence.ts',
    dbOps: 'Query MedicationEvent where taken=true vs taken=false. Group by medication and time period.',
    acceptance: [
      'Overall adherence percentage',
      'Per-medication adherence percentage',
      'Weekly adherence trend chart',
      'Monthly adherence trend',
      'List of missed doses with dates',
      'Reasons for missed doses (from notes)',
      'Export adherence report (PDF/CSV)',
      'Date range selector'
    ],
    dependencies: 'Medication logging (F034)',
    specRef: 'F-004: Medication Management - Adherence tracking'
  },
  {
    id: 'F036',
    title: 'Medication Reminders System',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'High',
    effort: '6-8 hours',
    overview: 'Schedule-based notifications for medication reminders. Snooze functionality. Quick log from notification.',
    requirements: 'Browser notifications at scheduled times. Snooze for 15/30/60 minutes. Mark as taken from notification.',
    files: 'lib/medications/reminderSystem.ts, components/Medications/ReminderSettings.tsx',
    dbOps: 'Query Medication.schedule to determine next reminder time. Create reminder queue.',
    acceptance: [
      'Notifications at scheduled times',
      'Notification shows medication name and dosage',
      'Snooze options (15/30/60 min)',
      'Quick action: Mark as Taken',
      'Quick action: Mark as Skipped',
      'Dismiss notification',
      'Notification permission request',
      'Enable/disable per medication',
      'Works when app is closed (service worker)'
    ],
    dependencies: 'Medication scheduling (F033), Medication logging (F034), Service worker (F074)',
    specRef: 'F-004: Medication Management - Medication reminders'
  },

  // TRIGGER TRACKING (F037-F038)
  {
    id: 'F037',
    title: 'Trigger Logging Interface',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Low',
    effort: '3-4 hours',
    overview: 'Log trigger exposures with intensity levels (low/medium/high). Quick log common triggers.',
    requirements: 'Select trigger from active triggers. Set intensity. Optional notes. Timestamp.',
    files: 'app/triggers/page.tsx, components/Triggers/TriggerLogger.tsx, lib/triggers/logTrigger.ts',
    dbOps: 'Create TriggerEvent with triggerId, timestamp, intensity, notes.',
    acceptance: [
      'Select trigger from active list',
      'Intensity selector (low/medium/high)',
      'Notes field',
      'Timestamp editable (defaults to now)',
      'Quick log mode (just trigger + intensity)',
      'Creates TriggerEvent in database',
      'Used for correlation analysis'
    ],
    dependencies: 'Database schema (F003✅), Trigger presets (F012✅)',
    specRef: 'F-005: Trigger Monitoring'
  },
  {
    id: 'F038',
    title: 'Trigger Library Management',
    status: 'TODO',
    priority: 'LOW',
    complexity: 'Low',
    effort: '2-3 hours',
    overview: 'Manage trigger library: add custom triggers, edit descriptions, categorize, enable/disable.',
    requirements: 'CRUD for triggers. Categorize (environmental/lifestyle/dietary). Soft delete.',
    files: 'app/triggers/library/page.tsx, components/Triggers/TriggerForm.tsx',
    dbOps: 'Create, update Trigger entities. Set isActive=false for soft delete.',
    acceptance: [
      'List all triggers by category',
      'Add custom trigger',
      'Edit trigger name and description',
      'Set category',
      'Disable/enable trigger',
      'Search triggers'
    ],
    dependencies: 'Database schema (F003✅)',
    specRef: 'Domain Entities: Trigger'
  },

  // FOOD JOURNAL (F039-F043)
  {
    id: 'F039',
    title: 'Food Journal Meal Logging',
    status: 'TODO',
    priority: 'HIGH',
    complexity: 'Medium',
    effort: '5-6 hours',
    overview: 'Log meals with multiple foods, portion sizes, meal type, and timestamp. Groups foods by meal ID.',
    requirements: 'Multi-select foods. Set portion per food (small/medium/large). Meal type (breakfast/lunch/dinner/snack). Photo optional.',
    files: 'app/food/page.tsx, components/Food/MealLogger.tsx, lib/food/logMeal.ts',
    dbOps: 'Create FoodEvent with unique mealId, foodIds array, portionSizes object, mealType, timestamp.',
    acceptance: [
      'Select multiple foods for meal',
      'Portion size per food (small/medium/large)',
      'Meal type selector',
      'Timestamp editable',
      'Notes field',
      'Photo attachment optional',
      'All foods share same mealId',
      'Creates FoodEvent in database',
      'Used for correlation analysis'
    ],
    dependencies: 'Database schema (F003✅), Food presets (F013✅)',
    specRef: 'Workflow 5: Logging Food Intake'
  },
  {
    id: 'F040',
    title: 'Portion Size Selection',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Low',
    effort: '2-3 hours',
    overview: 'UI component for selecting portion sizes (small/medium/large) per food item in meal.',
    requirements: 'Visual portion selector. Store in FoodEvent.portionSizes as { foodId: "small"|"medium"|"large" }.',
    files: 'components/Food/PortionSelector.tsx',
    dbOps: 'Store portion sizes in FoodEvent.portionSizes object.',
    acceptance: [
      'Visual portion size buttons (S/M/L)',
      'Default to medium',
      'Per-food portion selection',
      'Visual feedback for selection',
      'Used in dose-response correlation'
    ],
    dependencies: 'Food logging (F039)',
    specRef: 'Data Validation Rules: Portion Sizes'
  },
  {
    id: 'F041',
    title: 'Meal Grouping (Meal IDs)',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Low',
    effort: '2-3 hours',
    overview: 'Group foods eaten together using meal ID for combination analysis.',
    requirements: 'Generate unique meal ID. All foods in same meal share this ID. Used for synergistic combination detection.',
    files: 'lib/food/mealGrouping.ts',
    dbOps: 'FoodEvent.mealId = generateGUID() for foods logged together.',
    acceptance: [
      'Generate unique meal ID when logging',
      'All concurrent foods share meal ID',
      'Separate meals have different IDs',
      'Used in correlation analysis for combinations'
    ],
    dependencies: 'Food logging (F039)',
    specRef: 'Domain Entities: FoodEvent - Meal identifier'
  },
  {
    id: 'F042',
    title: 'Food Library Management',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'Manage food database: add custom foods, edit allergen tags, set preparation methods, enable/disable.',
    requirements: 'CRUD for foods. Set allergen tags (dairy, gluten, nuts, etc.). Preparation method (raw/cooked/fried/baked). Categorize.',
    files: 'app/food/library/page.tsx, components/Food/FoodForm.tsx, lib/food/manageFood.ts',
    dbOps: 'Create, update Food entities. Set allergen tags array. Set preparation method.',
    acceptance: [
      'List all foods by category',
      'Add custom food',
      'Edit food details',
      'Multi-select allergen tags',
      'Set preparation method',
      'Categorize food',
      'Disable/enable food',
      'Search foods',
      'Filter by allergen tag'
    ],
    dependencies: 'Database schema (F003✅), Food presets (F013✅)',
    specRef: 'Domain Entities: Food'
  },
  {
    id: 'F043',
    title: 'Food Search & Filtering',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '3-4 hours',
    overview: 'Real-time search and filtering for foods by name, category, allergen tags.',
    requirements: 'Search by name (fuzzy). Filter by category. Filter by allergen tags. Sort by name, frequency used.',
    files: 'components/Food/FoodSearch.tsx, lib/food/searchFoods.ts',
    dbOps: 'Query db.foods with text search and filters.',
    acceptance: [
      'Real-time search by name',
      'Filter by category (multi-select)',
      'Filter by allergen tags (multi-select)',
      'Sort by name (A-Z)',
      'Sort by frequency used',
      'Clear filters button',
      'Show result count',
      'Fast search (<100ms)'
    ],
    dependencies: 'Food library (F042)',
    specRef: 'F-006: Food Journal & Correlation Analysis - Food database search'
  },

  // DAILY HEALTH REFLECTION (F044-F045)
  {
    id: 'F044',
    title: 'Daily Reflection Form',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'End-of-day comprehensive health entry with overall health, energy, sleep, stress, mood ratings.',
    requirements: 'Single entry per day. Health/energy/sleep/stress scores (1-10). Mood selector. Aggregate symptoms/meds/triggers. Notes.',
    files: 'app/daily/page.tsx, components/Daily/DailyEntryForm.tsx, lib/daily/saveDailyEntry.ts',
    dbOps: 'Create or update DailyEntry with date as unique key. Store scores, mood, notes.',
    acceptance: [
      'One entry per day (unique by date)',
      'Overall health score (1-10)',
      'Energy level (1-10)',
      'Sleep quality (1-10)',
      'Stress level (1-10)',
      'Mood selector (happy/neutral/sad/anxious/stressed)',
      'Auto-populate symptoms/meds from day',
      'Notes field',
      'Can edit existing entry',
      'Shows date prominently'
    ],
    dependencies: 'Database schema (F003✅)',
    specRef: 'F-007: Daily Health Reflection'
  },
  {
    id: 'F045',
    title: 'Calendar View',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'Calendar view of daily entries. Color-coded by health score. Quick navigation.',
    requirements: 'Month/week view. Color code days by health score. Click day to view/edit entry. Pattern visualization.',
    files: 'app/daily/calendar/page.tsx, components/Daily/HealthCalendar.tsx',
    dbOps: 'Query DailyEntry by date range. Aggregate for visualization.',
    acceptance: [
      'Month view calendar',
      'Week view option',
      'Days color-coded by health score',
      'Shows health score on each day',
      'Click day opens entry',
      'Empty days have "add entry" action',
      'Navigate prev/next month',
      'Today indicator',
      'Pattern detection (e.g., worse on Mondays)'
    ],
    dependencies: 'Daily reflection form (F044)',
    specRef: 'F-007: Daily Health Reflection - Calendar view'
  },

  // PHOTO MANAGEMENT (F046-F049)
  {
    id: 'F046',
    title: 'Photo Capture & Upload',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'Capture photos from camera or upload from gallery. Automatic encryption and EXIF stripping.',
    requirements: 'Camera capture (mobile). File upload (desktop/mobile). Auto-encrypt with AES-256-GCM. Strip EXIF metadata.',
    files: 'components/Photos/PhotoCapture.tsx, lib/photos/uploadPhoto.ts',
    dbOps: 'Create PhotoAttachment with encrypted data, encryption key, IV, thumbnail.',
    acceptance: [
      'Camera capture button (mobile)',
      'File upload button',
      'Image preview before saving',
      'Automatic EXIF stripping',
      'Automatic encryption (AES-256-GCM)',
      'Thumbnail generation (200x200)',
      'Thumbnail also encrypted',
      'Unique encryption key per photo',
      'Max file size validation (10MB)',
      'Image format validation (JPEG/PNG)',
      'Progress indicator during upload'
    ],
    dependencies: 'Photo encryption (F007✅), EXIF stripping (F008✅)',
    specRef: 'F-008: Photo Documentation - Photo capture'
  },
  {
    id: 'F047',
    title: 'Photo Gallery (Encrypted)',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '5-6 hours',
    overview: 'Grid gallery view of all photos with encrypted thumbnails. Decrypt on-demand for viewing.',
    requirements: 'Grid layout with encrypted thumbnails. Click to view full size (decrypted). Filter by date, tag, body region.',
    files: 'app/photos/page.tsx, components/Photos/PhotoGallery.tsx, lib/photos/decryptPhoto.ts',
    dbOps: 'Query PhotoAttachment. Decrypt thumbnail for display. Decrypt full image on click.',
    acceptance: [
      'Grid layout of photo thumbnails',
      'Thumbnails decrypted on load',
      'Full image decrypted on click',
      'Modal viewer for full image',
      'Filter by date range',
      'Filter by tags',
      'Filter by body region',
      'Sort by date (newest/oldest)',
      'Shows photo metadata (date, size)',
      'Delete photo option',
      'Performance: lazy load thumbnails'
    ],
    dependencies: 'Photo capture (F046), Photo encryption (F007✅)',
    specRef: 'F-008: Photo Documentation - Photo management'
  },
  {
    id: 'F048',
    title: 'Photo Annotation Interface',
    status: 'TODO',
    priority: 'LOW',
    complexity: 'High',
    effort: '6-8 hours',
    overview: 'Draw annotations on photos (arrows, circles, text). Annotations also encrypted.',
    requirements: 'Canvas-based drawing. Add arrows, circles, text labels. Save annotations as encrypted JSON. Render on photo view.',
    files: 'components/Photos/PhotoAnnotator.tsx, lib/photos/annotationUtils.ts',
    dbOps: 'Store annotations in PhotoAttachment.annotations (encrypted JSON string).',
    acceptance: [
      'Drawing tools: arrow, circle, freehand',
      'Text tool for labels',
      'Color picker',
      'Undo/redo',
      'Clear all annotations',
      'Annotations saved as encrypted JSON',
      'Annotations rendered on photo view',
      'Works on touch and mouse',
      'Export photo with annotations'
    ],
    dependencies: 'Photo gallery (F047)',
    specRef: 'Domain Entities: PhotoAttachment - Annotations (optional, encrypted)'
  },
  {
    id: 'F049',
    title: 'Before/After Comparison Tool',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '3-4 hours',
    overview: 'Link two photos as before/after pair. Side-by-side or slider comparison view.',
    requirements: 'Select two photos. Create PhotoComparison entity. View side-by-side or with slider.',
    files: 'components/Photos/PhotoComparison.tsx, lib/photos/createComparison.ts',
    dbOps: 'Create PhotoComparison with beforePhotoId, afterPhotoId, title, notes.',
    acceptance: [
      'Select before photo',
      'Select after photo',
      'Create comparison with title',
      'Side-by-side view',
      'Slider view (overlay with draggable divider)',
      'Add notes about progress',
      'List of all comparisons',
      'Used for treatment effectiveness tracking'
    ],
    dependencies: 'Photo gallery (F047)',
    specRef: 'Domain Entities: PhotoComparison'
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
