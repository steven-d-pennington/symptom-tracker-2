# Pocket Symptom Tracker - Tech-Agnostic Rebuild Specification

**Purpose**: Complete system specification for rebuilding this application with any technology stack
**Generated**: 2025-11-12
**Version**: 1.0.0
**Original System**: Next.js 15 + React 19 + IndexedDB (Dexie)

---

## Document Purpose

This document describes **WHAT** the Pocket Symptom Tracker does and **WHY**, without prescribing **HOW** it should be implemented. Use this specification to rebuild the application in any programming language, framework, or architecture while preserving the core business logic, user experience, and privacy guarantees.

---

## Table of Contents

1. [Business Domain](#business-domain)
2. [Core Business Requirements](#core-business-requirements)
3. [Domain Entities](#domain-entities)
4. [Business Rules & Validation](#business-rules--validation)
5. [User Workflows](#user-workflows)
6. [Feature Requirements](#feature-requirements)
7. [Privacy & Security Requirements](#privacy--security-requirements)
8. [Data Integrity Requirements](#data-integrity-requirements)
9. [Performance Requirements](#performance-requirements)
10. [User Experience Requirements](#user-experience-requirements)

---

## Business Domain

### Problem Space

**Target Users**: Individuals living with chronic autoimmune conditions, specifically Hidradenitis Suppurativa (HS), who need to:
- Track symptoms, medications, triggers, and food intake
- Monitor flare progression over time
- Identify patterns and correlations in their health data
- Document their condition for medical consultations
- Maintain complete privacy and control over their health data

### Core Value Proposition

A **privacy-first health tracking system** that:
1. **Keeps data 100% local** - No cloud storage, no servers, no data mining
2. **Works offline** - Full functionality without network connectivity
3. **Tracks precision** - Exact body locations, severity scales, time-series data
4. **Discovers patterns** - Statistical correlation analysis to identify triggers
5. **Empowers medical consultation** - Exportable, comprehensive health records

---

## Core Business Requirements

### BR-1: Privacy & Data Sovereignty
**Requirement**: User owns and controls 100% of their health data.

**Implications**:
- All data storage must be local to the user's device
- No external data transmission except user-initiated export
- No analytics, tracking, or telemetry without explicit opt-in
- Photo encryption to protect sensitive medical imagery
- Metadata stripping from photos (GPS, device info, timestamps)

### BR-2: Offline-First Operation
**Requirement**: System must function without network connectivity.

**Implications**:
- All core features available offline
- Local data storage (not dependent on cloud/servers)
- Graceful handling of network unavailability
- Background sync queue for future cloud features (opt-in)

### BR-3: Medical-Grade Data Integrity
**Requirement**: Health data must be accurate, complete, and tamper-evident.

**Implications**:
- Append-only event history for medical audit trails
- No destructive operations on historical data
- Soft deletes (mark as inactive, don't delete records)
- Timestamp all events with millisecond precision
- Support data export for medical professionals

### BR-4: Precision Tracking
**Requirement**: Enable accurate, detailed tracking of symptoms and locations.

**Implications**:
- Body map with 93+ distinct anatomical regions
- Coordinate-level precision (x,y) for exact flare locations
- Zoom/pan capabilities for precise marker placement
- Severity scales (1-10) with configurable definitions
- Time-series tracking with timezone support

### BR-5: Pattern Recognition & Analytics
**Requirement**: Help users discover correlations between triggers and symptoms.

**Implications**:
- Statistical correlation analysis (e.g., Spearman's Ï)
- Time-delayed correlation (15 minutes to 72 hours lag)
- Food combination analysis (synergistic effects)
- Trend detection (improving vs worsening patterns)
- Statistical significance testing (p-value < 0.05)

---

## Domain Entities

### User
**Purpose**: Represents the individual using the application.

**Core Attributes**:
- Unique identifier
- Preferences (theme, notification settings, export formats)
- Privacy settings
- Created/updated timestamps

**Business Rules**:
- Single-user system (one user per device/browser)
- User can customize symptom categories and scales
- User controls data retention and export policies

### Symptom
**Purpose**: Definition of a trackable symptom type.

**Core Attributes**:
- Unique identifier
- Name (e.g., "Pain", "Swelling", "Redness")
- Category (e.g., "Physical", "Cognitive", "Emotional")
- Description (optional)
- Severity scale definition (1-10 with labels)
- Common triggers (optional reference list)
- Active status (enabled/disabled)
- Default/custom flag (preset vs user-created)

**Business Rules**:
- System provides 50+ preset symptoms
- Users can create custom symptoms
- Symptoms can be disabled (soft delete) but not removed
- Each symptom has configurable severity scale

### Symptom Instance
**Purpose**: A recorded occurrence of a symptom at a specific time.

**Core Attributes**:
- Unique identifier
- Symptom reference (which symptom)
- Timestamp (when it occurred)
- Severity (1-10 rating)
- Location (body region, optional coordinates)
- Duration (optional, in minutes/hours)
- Associated triggers (optional list)
- Notes (free text)
- Photo attachments (optional list)

**Business Rules**:
- Immutable after creation (append-only pattern)
- Must reference an active symptom
- Severity must match symptom's configured scale
- Timestamps stored with timezone information

### Medication
**Purpose**: Definition of a prescribed or OTC medication.

**Core Attributes**:
- Unique identifier
- Name (e.g., "Ibuprofen", "Humira")
- Dosage (e.g., "200mg", "40mg/0.8mL")
- Frequency (e.g., "2x daily", "weekly")
- Schedule (list of times/days)
- Side effects (optional list)
- Active status
- Default/custom flag

**Business Rules**:
- System provides common medication presets
- Users can create custom medications
- Schedule supports flexible recurring patterns
- Medications can be paused/resumed, not deleted

### Medication Event
**Purpose**: Record of taking (or skipping) a medication dose.

**Core Attributes**:
- Unique identifier
- Medication reference
- Timestamp (when taken/skipped)
- Taken status (true/false)
- Dosage override (optional)
- Notes (optional)
- Timing warning (early/late/on-time)

**Business Rules**:
- Immutable after creation
- Timing warning calculated based on schedule
- Adherence metrics derived from event history
- Support retroactive logging (backdated entries)

### Trigger
**Purpose**: Environmental, lifestyle, or dietary factors that may affect symptoms.

**Core Attributes**:
- Unique identifier
- Name (e.g., "Stress", "Heat", "Lack of sleep")
- Category (e.g., "Environmental", "Lifestyle", "Dietary")
- Description (optional)
- Active status
- Default/custom flag

**Business Rules**:
- System provides 30+ preset triggers
- Users can create custom triggers
- Triggers support intensity levels (low/medium/high)
- Soft delete only (preserve historical correlations)

### Trigger Event
**Purpose**: Record of exposure to a trigger.

**Core Attributes**:
- Unique identifier
- Trigger reference
- Timestamp
- Intensity (low/medium/high)
- Notes (optional)

**Business Rules**:
- Immutable after creation
- Used for correlation analysis with symptoms
- Support time-delayed correlation (lag windows)

### Food
**Purpose**: Consumable food/beverage item with allergen metadata.

**Core Attributes**:
- Unique identifier
- Name (e.g., "Almonds", "Milk", "Tomato")
- Category (e.g., "Protein", "Dairy", "Vegetable")
- Allergen tags (dairy, gluten, nuts, shellfish, nightshades, soy, eggs, fish)
- Preparation method (optional: raw, cooked, fried)
- Active status
- Default/custom flag

**Business Rules**:
- System provides 200+ preset foods
- Users can create custom foods
- Allergen tags enable category-level correlation
- Preparation method affects correlation analysis

### Food Event
**Purpose**: Record of consuming food/beverages.

**Core Attributes**:
- Unique identifier
- Meal identifier (groups foods eaten together)
- List of food references
- Timestamp
- Meal type (breakfast/lunch/dinner/snack)
- Portion sizes (small/medium/large per food)
- Notes (optional)
- Photo attachments (optional)

**Business Rules**:
- Foods logged together share meal ID (for combination analysis)
- Portion size affects dose-response correlation
- Immutable after creation
- Used for food-symptom correlation analysis

### Food Combination Correlation
**Purpose**: Auto-generated statistical correlation between foods and symptoms.

**Core Attributes**:
- Unique identifier
- List of food references (sorted for consistency)
- Symptom reference
- Correlation score (0-1 percentage)
- Individual maximum correlation (baseline)
- Synergistic flag (combination > individual + threshold)
- P-value (statistical significance)
- Confidence level (high/medium/low)
- Consistency score (0-1 decimal)
- Sample size
- Last analyzed timestamp

**Business Rules**:
- Auto-calculated in background
- Requires minimum sample size (e.g., 5+ occurrences)
- Synergistic if combination correlation > max individual + 0.15
- Invalidated and recalculated when new data added
- Cached for performance

### Flare
**Purpose**: Persistent entity representing an individual flare episode.

**Core Attributes**:
- Unique identifier (persistent throughout lifecycle)
- Start date
- End date (nullable until resolved)
- Status (active/improving/worsening/resolved)
- Body region reference
- Coordinates (x,y normalized 0-1)
- Initial severity (1-10)
- Current severity (1-10, updated via events)
- Created/updated timestamps

**Business Rules**:
- Unique persistent ID assigned at creation
- Current severity derived from latest event
- Status changes tracked in event history
- Cannot be deleted, only marked resolved
- Supports multi-location tracking (one flare, multiple body regions)

### Flare Event
**Purpose**: Append-only history of flare lifecycle changes.

**Core Attributes**:
- Unique identifier
- Flare reference
- Event type (created/severity_update/trend_change/intervention/resolved)
- Timestamp
- Severity (for severity updates)
- Trend (improving/stable/worsening)
- Notes (optional)
- Intervention type (ice/heat/medication/rest/drainage/other)
- Intervention details (free text)
- Resolution date (for resolved events)
- Resolution notes (optional)

**Business Rules**:
- **IMMUTABLE** - never modified or deleted after creation
- Chronological ordering enforced by timestamp
- Current flare state derived by aggregating events
- Medical-grade audit trail for healthcare providers
- Support multiple interventions per event

### Flare Body Location
**Purpose**: Track flares that span multiple body regions.

**Core Attributes**:
- Unique identifier
- Flare reference
- Body region reference
- Coordinates (x,y normalized 0-1)
- Created/updated timestamps

**Business Rules**:
- One flare can have multiple body locations
- Used for tunneling/connected flares
- Each location independently tracked
- Coordinates relative to specific region

### Daily Entry
**Purpose**: Comprehensive end-of-day health reflection.

**Core Attributes**:
- Unique identifier
- Date (YYYY-MM-DD, unique per user)
- Overall health score (1-10)
- Energy level (1-10)
- Sleep quality (1-10)
- Stress level (1-10)
- Mood (optional: happy/neutral/sad/anxious/stressed)
- List of symptoms for the day
- List of medications taken
- List of triggers encountered
- Notes (free text)
- Weather data (optional)
- Location (optional)
- Duration (time spent logging, in ms)
- Completion timestamp

**Business Rules**:
- One entry per day maximum
- Date is unique constraint
- Aggregates data from throughout the day
- Optional but recommended for trend analysis
- Can be edited after creation (not append-only)

### Body Map Location
**Purpose**: Link symptoms to precise body locations.

**Core Attributes**:
- Unique identifier
- Daily entry reference (optional)
- Symptom reference
- Body region reference
- Coordinates (x,y normalized 0-1)
- Severity (1-10)
- Notes (optional)
- Timestamp

**Business Rules**:
- Links symptoms to anatomical locations
- Coordinates normalized (0-1 range)
- Supports zoom-based precision marking
- Used for problem area analysis

### Photo Attachment
**Purpose**: Encrypted medical photo documentation.

**Core Attributes**:
- Unique identifier
- Daily entry reference (optional)
- Symptom reference (optional)
- Body region reference (optional)
- File name
- Original file name
- MIME type
- Size in bytes
- Width, height (pixels)
- Encrypted data (blob)
- Thumbnail data (blob)
- Encryption IV (initialization vector)
- Thumbnail IV (optional)
- Encryption key (unique per photo)
- Capture timestamp
- Tags (list of strings)
- Notes (optional)
- Metadata (EXIF stripped)
- Annotations (optional, encrypted)

**Business Rules**:
- **EVERY photo encrypted** with AES-256-GCM
- Unique encryption key per photo
- EXIF metadata automatically stripped
- Original filename preserved for reference
- Annotations encrypted same as photo data
- Secure deletion requires key destruction
- Thumbnail generated for performance

### Photo Comparison
**Purpose**: Before/after photo pairs for treatment tracking.

**Core Attributes**:
- Unique identifier
- Before photo reference
- After photo reference
- Title
- Notes (optional)
- Created timestamp

**Business Rules**:
- Links two photo attachments
- Used for visual treatment effectiveness
- Both photos must exist and be accessible
- Deletion of either photo breaks comparison

### UX Event
**Purpose**: Optional on-device usage analytics.

**Core Attributes**:
- Unique identifier
- Event type (e.g., "button_click", "page_view")
- Metadata (JSON payload)
- Timestamp

**Business Rules**:
- **OPT-IN ONLY** - disabled by default
- Remains on-device (never transmitted)
- Used for local UX analysis
- Exportable by user for debugging
- No personally identifiable information

---

## Business Rules & Validation

### Data Validation Rules

**Severity Scales**:
- All severity values: integers 1-10 inclusive
- 1 = minimal/none, 10 = severe/unbearable
- Custom scales can define label mappings (e.g., 1="Mild", 5="Moderate", 10="Severe")

**Timestamps**:
- All timestamps in UTC with timezone offset
- Millisecond precision required for event ordering
- Support retroactive entries (backdated timestamps)
- Future timestamps rejected (cannot log future events)

**Portion Sizes**:
- Small/medium/large enumeration
- Used for dose-response correlation
- Default to medium if not specified

**Coordinates**:
- Normalized to 0-1 range (independent of display size)
- 0,0 = top-left corner of region
- 1,1 = bottom-right corner of region
- Enables resolution-independent precision

**Text Fields**:
- Names: 1-100 characters, no special validation
- Notes: unlimited length, plain text
- Descriptions: 500 characters max
- No HTML or script tags allowed (XSS prevention)

### Correlation Analysis Rules

**Spearman's Rank Correlation**:
- Correlation coefficient (Ï): -1 to +1 range
- Positive correlation: food increases symptom severity
- Negative correlation: food decreases symptom severity
- Minimum sample size: 5 occurrences
- Significance threshold: p-value < 0.05

**Lag Window Analysis**:
- Test correlation at multiple time delays
- Windows: 15min, 30min, 1hr, 2hr, 4hr, 8hr, 12hr, 24hr, 48hr, 72hr
- Find lag window with strongest correlation
- Account for delayed food reactions (common in autoimmune conditions)

**Food Combination Analysis**:
- Test individual foods vs combined foods
- Synergistic effect: combination correlation > max(individual) + 0.15
- Example: Tomato alone = 0.3, Egg alone = 0.2, Together = 0.6 (synergistic)
- Requires minimum occurrences of combination (5+)

**Confidence Levels**:
- High: p-value < 0.01, sample size â¥ 20
- Medium: p-value < 0.05, sample size â¥ 10
- Low: p-value < 0.05, sample size â¥ 5

### Flare Lifecycle Rules

**Status Transitions**:
- Active â Improving: user marks trend as improving
- Active â Worsening: user marks trend as worsening
- Improving â Worsening: allowed (flare can regress)
- Worsening â Improving: allowed (flare can improve)
- Any status â Resolved: user marks as resolved
- Resolved â Any: NOT allowed (resolved is final state)

**Severity Rules**:
- Initial severity set at flare creation
- Current severity updated via events
- Severity changes tracked chronologically
- System calculates severity trend (increasing/decreasing/stable)

**Intervention Tracking**:
- Multiple interventions can be logged per event
- Intervention types: ice, heat, medication, rest, drainage, other
- Effectiveness calculated by comparing pre/post intervention severity
- Used for treatment effectiveness analysis

### Data Retention Rules

**Soft Deletes**:
- User definitions (symptoms, medications, triggers, foods) use soft delete
- Mark as "inactive" instead of deleting
- Preserves historical data integrity
- Correlation analysis includes inactive items from past

**Hard Deletes**:
- User can permanently delete photo attachments
- User can permanently delete entire user account
- Requires explicit confirmation
- No recovery after hard delete

**Export & Backup**:
- Full data export in JSON format
- CSV export for specific data types
- PDF export for medical reports (formatted)
- Backup includes encryption keys for photos
- User controls export frequency and retention

---

## User Workflows

### Workflow 1: First-Time Setup (Onboarding)

**Trigger**: User installs/opens app for first time

**Steps**:
1. Welcome screen explains privacy-first architecture
2. User creates profile (name optional, no email required)
3. Interactive selection screens:
   - Select symptoms to track (from 50+ presets + custom)
   - Select medications (from presets + custom)
   - Select triggers to monitor (from 30+ presets + custom)
   - Select common foods (from 200+ presets + custom)
4. Each selection screen includes:
   - Real-time search/filter
   - Category organization (collapsible)
   - "Add custom" option
   - "Skip" option
5. Configure preferences:
   - Theme (light/dark/system)
   - Notification settings (reminder times)
   - Export format default
6. Quick tutorial (optional):
   - How to log symptoms
   - How to track flares on body map
   - How to view analytics
7. Dashboard tour (tooltips highlight key features)

**Success Criteria**:
- User has profile with GUID identifier
- User has selected initial tracking items
- User understands privacy guarantees
- User ready to begin logging

### Workflow 2: Logging a New Flare

**Trigger**: User notices new flare/lesion

**Steps**:
1. Navigate to body map interface
2. Select body view (front/back/side)
3. Tap body region where flare is located
4. Body map zooms to selected region (2-3x magnification)
5. User taps precise location within region
6. System captures normalized coordinates (x,y)
7. Flare creation modal opens:
   - Initial severity slider (1-10)
   - Optional notes field
   - Optional photo attachment
   - Timestamp (defaults to now, editable)
8. User submits flare creation
9. System:
   - Creates flare entity with unique ID
   - Creates initial flare event (type: created)
   - Updates body map with flare marker
   - Adds flare to "Active Flares" list

**Success Criteria**:
- Flare has unique persistent ID
- Location captured with precision
- Initial severity recorded
- Flare visible on body map
- Flare appears in active list

### Workflow 3: Updating Flare Progression

**Trigger**: User checks existing flare, notices change

**Steps**:
1. Navigate to "Active Flares" list
2. Select flare to update
3. Flare detail view shows:
   - Current severity
   - Trend (improving/worsening/stable)
   - Days active
   - Historical timeline
   - Body map location
4. User taps "Update" button
5. Update modal opens:
   - New severity slider (current value pre-selected)
   - Trend selector (improving/stable/worsening)
   - Intervention options (checkboxes):
     - Ice
     - Heat
     - Medication (specify which)
     - Rest
     - Drainage
     - Other (free text)
   - Notes field
   - Timestamp (defaults to now)
6. User submits update
7. System:
   - Creates new flare event (type: severity_update or intervention)
   - Updates flare's currentSeverity
   - Recalculates trend
   - Updates timeline visualization

**Success Criteria**:
- New event appended to flare history
- Current severity updated
- Trend accurately reflects changes
- Timeline shows progression
- Intervention logged if applicable

### Workflow 4: Resolving a Flare

**Trigger**: User's flare has healed

**Steps**:
1. Navigate to active flare detail
2. Tap "Mark as Resolved" button
3. Confirmation modal:
   - Resolution date (defaults to today, editable)
   - Optional resolution notes
   - Optional final photo
4. User confirms resolution
5. System:
   - Creates flare event (type: resolved)
   - Sets flare status to "resolved"
   - Sets flare endDate
   - Moves flare to "Resolved" list
   - Updates body map (resolved marker style)
   - Updates problem area calculations

**Success Criteria**:
- Flare marked resolved with timestamp
- Flare removed from active list
- Body map updated
- Analytics reflect resolved status
- Historical data preserved

### Workflow 5: Logging Food Intake

**Trigger**: User eats meal or snack

**Steps**:
1. Navigate to "Quick Actions" or "Food Journal"
2. Select "Log Food"
3. Food logging interface:
   - Meal type selector (breakfast/lunch/dinner/snack)
   - Timestamp (defaults to now, editable)
   - Food search/selector:
     - Real-time search across 200+ foods
     - Category filtering
     - "Add custom food" option
     - Multi-select (for meals with multiple foods)
   - Portion size selector (small/medium/large per food)
   - Optional notes field
   - Optional photo
4. User adds foods and portions
5. User submits food log
6. System:
   - Creates food event with unique meal ID
   - Groups all foods with same meal ID
   - Queues correlation recalculation (background)
   - Shows confirmation toast

**Success Criteria**:
- All foods logged with portions
- Meal ID groups concurrent foods
- Timestamp recorded
- Data available for correlation analysis

### Workflow 6: Discovering Food-Symptom Correlations

**Trigger**: User has logged 5+ occurrences of food and symptom

**Steps** (system background process):
1. Correlation engine runs periodically (e.g., daily at 2 AM)
2. For each symptom:
   - Extract symptom instances (last 90 days)
   - Extract food events (last 90 days)
3. For each food or food combination:
   - Test correlation at multiple lag windows (15min to 72hrs)
   - Calculate Spearman's Ï
   - Calculate p-value
   - Determine statistical significance
4. For food combinations:
   - Compare combination correlation to individual correlations
   - Flag synergistic effects (combination > individual + 0.15)
5. Store correlation results
6. Calculate confidence level (high/medium/low)
7. Update analytics dashboard

**User Discovery** (on-demand):
1. Navigate to "Insights" or "Analytics"
2. Select "Food Correlations"
3. System displays:
   - Top positive correlations (foods that increase symptoms)
   - Top negative correlations (foods that decrease symptoms)
   - Synergistic combinations
   - Correlation strength visualization
   - Sample size and confidence level
4. User can drill down:
   - View timeline of food events vs symptom instances
   - See lag window with strongest correlation
   - Filter by symptom type
   - Filter by confidence level
5. User can export results for medical consultation

**Success Criteria**:
- Statistically significant correlations identified
- Lag windows optimize detection
- Synergistic combinations flagged
- Results actionable and exportable

### Workflow 7: Identifying Problem Areas

**Trigger**: User navigates to analytics dashboard

**Steps**:
1. User selects "Problem Areas" view
2. System analyzes flare history (last 90 days):
   - Count flares per body region
   - Calculate recurrence rate
   - Calculate average flare duration per region
   - Calculate average severity per region
3. Display results:
   - Heat map on body map (color-coded by frequency)
   - Ranked list of problem regions:
     - Region name
     - Flare count
     - Average duration
     - Average severity
     - Last flare date
4. User can drill down into specific region:
   - View all flares in that region (historical list)
   - See timeline of flare occurrences
   - View severity trends for region
   - Compare intervention effectiveness in region
5. User can export region report for doctor

**Success Criteria**:
- Problem areas accurately identified
- Visual heat map intuitive
- Drill-down provides actionable insights
- Data exportable for medical use

### Workflow 8: Exporting Data for Medical Consultation

**Trigger**: User has doctor appointment, needs health data

**Steps**:
1. Navigate to "Export" or "Settings â Data"
2. Select export type:
   - **Full Export**: All data (JSON format)
   - **Medical Report**: Formatted PDF
   - **Flare Summary**: PDF with flare history
   - **Correlation Report**: PDF with food-symptom correlations
   - **Custom Export**: User selects date range and data types
3. For medical reports:
   - Select date range (e.g., last 90 days)
   - Include/exclude options:
     - Symptom logs
     - Medication adherence
     - Flare progression charts
     - Problem area analysis
     - Food correlations
     - Photos (encrypted separately)
4. User generates report
5. System:
   - Compiles data
   - Formats for readability
   - Generates PDF or JSON file
   - Offers download or share
6. User downloads report
7. User can email/print report for doctor

**Success Criteria**:
- Report generated successfully
- Data accurate and complete
- Format professional and readable
- Privacy maintained (user-controlled export only)

---

## Feature Requirements

### F-001: Precision Body Mapping

**Description**: Interactive body map with 93+ anatomical regions for precise flare location tracking.

**Capabilities**:
- Front, back, and side body views
- 93+ distinct regions including:
  - Standard regions: head, neck, shoulders, chest, abdomen, back, arms, legs
  - Groin-specific: left groin, right groin, center groin
  - Detailed subdivisions: upper arm, lower arm, hand, thigh, calf, foot
- Zoom/pan functionality:
  - 1x to 3x magnification
  - Pinch-to-zoom (mobile)
  - Scroll-wheel zoom (desktop)
  - Pan by dragging
- Coordinate capture:
  - Tap/click to place marker
  - Normalized coordinates (0-1 range)
  - Resolution-independent precision
- Marker display:
  - Active flares (color-coded by severity)
  - Resolved flares (optional toggle)
  - Status indicators (improving/worsening arrows)
- Accessibility:
  - Keyboard navigation (tab, arrow keys, enter to select)
  - Screen reader support (region announcements)
  - High contrast mode compatible
  - Touch target size â¥ 44x44px

**Business Value**: Enables precise medical-grade location tracking for healthcare consultation.

### F-002: Flare Lifecycle Management

**Description**: Track individual flares from onset through resolution.

**Capabilities**:
- Create flare:
  - From body map (tap region â zoom â tap location)
  - Manual entry (select region, enter coordinates)
  - Initial severity (1-10)
  - Optional notes and photos
- Update flare:
  - Severity changes (1-10 scale)
  - Trend marking (improving/stable/worsening)
  - Intervention logging (ice, heat, meds, drainage, rest)
  - Notes and photos
- Resolve flare:
  - Mark as resolved
  - Resolution date (backdated if needed)
  - Resolution notes
  - Final photo
- View flare history:
  - Chronological event timeline
  - Severity trend chart
  - Intervention effectiveness
  - Photo progression
- Active flares dashboard:
  - List view (sortable by date, severity, location)
  - Card view (visual summaries)
  - Filter by status, region, date range
  - Quick update actions

**Business Value**: Complete flare documentation for treatment effectiveness tracking.

### F-003: Symptom Tracking

**Description**: Log and monitor diverse symptoms with configurable severity scales.

**Capabilities**:
- Symptom library:
  - 50+ presets (pain, swelling, redness, fatigue, etc.)
  - User-defined custom symptoms
  - Category organization (physical, cognitive, emotional)
  - Severity scale definitions
- Log symptom occurrence:
  - Select symptom from library
  - Rate severity (1-10)
  - Optional location (body region + coordinates)
  - Optional duration (minutes/hours)
  - Associated triggers
  - Notes and photos
  - Timestamp (defaults to now, editable)
- Symptom instances:
  - Timeline visualization
  - Frequency analysis
  - Severity trends
  - Location patterns
- Symptom categories:
  - User-defined groupings
  - Color coding
  - Custom icons

**Business Value**: Comprehensive symptom documentation for pattern recognition.

### F-004: Medication Management

**Description**: Track medications and adherence.

**Capabilities**:
- Medication library:
  - Common medication presets
  - User-defined custom medications
  - Dosage information
  - Frequency and schedule
  - Side effects list
- Log medication event:
  - Mark as taken or skipped
  - Timestamp (actual time taken)
  - Dosage override (if different from default)
  - Notes
  - Timing warning (early/late)
- Medication reminders:
  - Schedule-based notifications
  - Customizable reminder times
  - Snooze functionality
  - Quick log from notification
- Adherence tracking:
  - Percentage adherence by medication
  - Missed doses report
  - Adherence trend over time
  - Export for medical review

**Business Value**: Improve medication adherence and effectiveness tracking.

### F-005: Trigger Monitoring

**Description**: Track environmental, lifestyle, and dietary triggers.

**Capabilities**:
- Trigger library:
  - 30+ presets (stress, heat, lack of sleep, tight clothing, etc.)
  - Categories: environmental, lifestyle, dietary
  - User-defined custom triggers
- Log trigger exposure:
  - Select trigger from library
  - Intensity rating (low/medium/high)
  - Timestamp
  - Notes
- Trigger analysis:
  - Frequency of exposure
  - Correlation with symptom flares
  - Most impactful triggers
  - Trigger combination effects

**Business Value**: Identify avoidable triggers to reduce symptom occurrence.

### F-006: Food Journal & Correlation Analysis

**Description**: Track food intake and discover food-symptom correlations.

**Capabilities**:
- Food database:
  - 200+ preset foods with allergen tags
  - User-defined custom foods
  - Allergen categories: dairy, gluten, nuts, shellfish, nightshades, soy, eggs, fish
  - Preparation methods: raw, cooked, fried, baked
- Log food intake:
  - Meal type (breakfast/lunch/dinner/snack)
  - Multiple foods per meal (grouped by meal ID)
  - Portion size per food (small/medium/large)
  - Timestamp
  - Notes and photos
- Correlation analysis:
  - Automatic statistical correlation (Spearman's Ï)
  - Time-delayed analysis (15min to 72hr lag windows)
  - Food combination synergy detection
  - Dose-response patterns (portion size vs severity)
  - Statistical significance (p-value)
  - Confidence levels
- Correlation insights:
  - Top positive correlations (foods that worsen symptoms)
  - Top negative correlations (foods that improve symptoms)
  - Synergistic combinations
  - Recommended avoidance list
  - Timeline visualization

**Business Value**: Data-driven dietary modifications to reduce symptoms.

### F-007: Daily Health Reflection

**Description**: End-of-day comprehensive health entry.

**Capabilities**:
- Daily entry form:
  - Overall health score (1-10)
  - Energy level (1-10)
  - Sleep quality (1-10)
  - Stress level (1-10)
  - Mood selector (happy/neutral/sad/anxious/stressed)
  - Today's symptoms (summary)
  - Medications taken (summary)
  - Triggers encountered (summary)
  - Notes (free text)
- Calendar view:
  - Month/week/day views
  - Color-coded by overall health
  - Quick navigation to entries
  - Pattern visualization (e.g., worse on Mondays)
- Trend analysis:
  - Health score trend over time
  - Energy/sleep/stress correlations
  - Mood patterns
  - Best/worst days

**Business Value**: Holistic health tracking beyond isolated events.

### F-008: Photo Documentation

**Description**: Encrypted medical photo attachments with EXIF stripping.

**Capabilities**:
- Photo capture:
  - Camera capture (device camera)
  - Photo upload (from gallery)
  - Attach to: symptom, flare, daily entry
- Photo encryption:
  - AES-256-GCM encryption
  - Unique encryption key per photo
  - Automatic EXIF stripping (removes GPS, device info)
  - Thumbnail generation (also encrypted)
- Photo management:
  - Gallery view (grid/list)
  - Filter by date, location, tag
  - Annotations (draw on photos, encrypted)
  - Tags (user-defined labels)
- Before/after comparisons:
  - Link two photos as comparison pair
  - Side-by-side view
  - Timeline slider view
  - Progress annotations
- Photo timeline:
  - Chronological photo progression per flare
  - Visual treatment effectiveness
  - Exportable for medical consultation

**Business Value**: Visual documentation for medical consultation and treatment tracking.

### F-009: Analytics Dashboard

**Description**: Insights and pattern recognition across all health data.

**Capabilities**:
- Problem areas analysis:
  - Body map heat map (flare frequency by region)
  - Ranked list of problem regions
  - Region drill-down (history, trends)
- Flare metrics:
  - Total flares (active vs resolved)
  - Average flare duration
  - Severity trends
  - Intervention effectiveness
- Symptom analytics:
  - Most frequent symptoms
  - Severity trends
  - Location patterns
  - Time-of-day patterns
- Medication insights:
  - Adherence percentage
  - Effectiveness analysis (symptom correlation)
  - Side effects tracking
- Trigger impact:
  - Most impactful triggers
  - Trigger-symptom correlations
  - Avoidance recommendations
- Trend visualizations:
  - Line charts (severity over time)
  - Bar charts (frequency comparisons)
  - Heat maps (problem areas, time patterns)
  - Scatter plots (correlations)

**Business Value**: Data-driven insights for self-management and medical consultation.

### F-010: Data Export & Sharing

**Description**: Export health data in multiple formats for medical use.

**Capabilities**:
- Export formats:
  - **JSON**: Complete data export (for backup/migration)
  - **CSV**: Tabular data (per entity type)
  - **PDF**: Formatted medical reports
- Report types:
  - Full health report (all data, date range)
  - Flare summary report (flare history, progression charts)
  - Correlation report (food-symptom analysis)
  - Medication adherence report
  - Problem areas report
- Export options:
  - Date range selection
  - Entity type selection (symptoms, medications, etc.)
  - Include/exclude photos
  - Anonymization options (remove identifiers)
- Sharing:
  - Download to device
  - Email report (encrypted)
  - Print report
  - Cloud backup (opt-in, encrypted)

**Business Value**: Enable medical consultation with comprehensive data.

---

## Privacy & Security Requirements

### PS-001: Local-First Data Storage

**Requirement**: All user data stored locally on device, no cloud dependency.

**Implementation Requirements**:
- Use client-side storage (e.g., IndexedDB, SQLite, local filesystem)
- No external API calls for data storage
- No background data transmission
- Data accessible offline

**Verification**:
- Network inspector shows zero data transmission (except user-initiated export)
- App fully functional in airplane mode

### PS-002: No User Authentication Required

**Requirement**: No account creation, email, or password required.

**Implementation Requirements**:
- Single-user system (one user per device)
- Local user ID generation (e.g., GUID/UUID)
- No external authentication providers
- No user tracking across devices

**Verification**:
- App usable without any sign-up process
- No email or password fields in UI

### PS-003: Photo Encryption

**Requirement**: All photos encrypted at rest with military-grade encryption.

**Implementation Requirements**:
- AES-256-GCM encryption algorithm
- Unique encryption key per photo (not shared across photos)
- Initialization vector (IV) stored separately
- Encryption key stored separately from encrypted data
- Thumbnail also encrypted

**Verification**:
- Raw storage inspection shows encrypted blobs
- Photos inaccessible without decryption key
- Benchmark: encrypt/decrypt 5MB photo in <500ms

### PS-004: EXIF Metadata Stripping

**Requirement**: Remove location and device metadata from photos automatically.

**Implementation Requirements**:
- Strip EXIF data before storage:
  - GPS coordinates
  - Device make/model
  - Capture timestamp (preserve in app metadata separately)
  - Camera settings
- Preserve only image dimensions

**Verification**:
- EXIF analysis tools show no metadata in stored photos
- GPS coordinates not recoverable

### PS-005: No Analytics or Telemetry

**Requirement**: No usage tracking, analytics, or telemetry without explicit opt-in.

**Implementation Requirements**:
- No third-party analytics libraries (Google Analytics, Mixpanel, etc.)
- No error tracking services (Sentry, Rollbar) unless opt-in
- UX events remain on-device (if opt-in enabled)
- Clear opt-in UI with explanation

**Verification**:
- Network inspector shows zero tracking requests
- Third-party script scan shows no analytics libraries

### PS-006: Secure Data Deletion

**Requirement**: User can permanently delete data with no recovery.

**Implementation Requirements**:
- Hard delete operations:
  - Delete all user data
  - Delete encryption keys (photos unrecoverable)
  - Clear local storage completely
- Confirmation dialog with warning
- No cloud residue (no data sent to cloud)

**Verification**:
- Storage inspection shows no residual data
- App resets to onboarding state

### PS-007: Export Encryption

**Requirement**: Exported data protected during transmission.

**Implementation Requirements**:
- Encrypted export file option (e.g., password-protected ZIP)
- Secure email transmission (TLS required)
- User-defined encryption password
- Export includes encryption keys for photos (separately encrypted)

**Verification**:
- Exported file encrypted at rest
- Transmission over TLS (HTTPS)

---

## Data Integrity Requirements

### DI-001: Append-Only Event History

**Requirement**: Critical health events never modified or deleted after creation.

**Applies To**:
- Flare events
- Medication events
- Trigger events
- Food events
- Symptom instances

**Implementation Requirements**:
- No UPDATE operations on event tables
- No DELETE operations on event tables
- Immutable records (read-only after creation)
- Timestamps cannot be changed
- Current state derived by aggregating events

**Verification**:
- Attempt to modify event returns error
- Database schema enforces immutability (e.g., triggers, constraints)

### DI-002: Soft Deletes for Entity Definitions

**Requirement**: User-defined entities (symptoms, medications, etc.) use soft delete.

**Implementation Requirements**:
- Add `isActive` boolean field
- Set to `false` instead of deleting record
- Preserve historical references
- UI hides inactive entities by default
- Analytics include inactive entities from past

**Verification**:
- Deleted entity still in database
- Historical references remain valid

### DI-003: Timestamp Precision

**Requirement**: All timestamps stored with millisecond precision.

**Implementation Requirements**:
- Timestamp format: Unix epoch milliseconds (integer)
- Timezone offset stored separately
- UTC normalization for consistency
- No DST ambiguity

**Verification**:
- Event ordering is deterministic
- Millisecond precision preserved in exports

### DI-004: Transaction Consistency

**Requirement**: Related data changes commit atomically.

**Implementation Requirements**:
- Database transactions for multi-record operations
- Rollback on failure (all-or-nothing)
- Example: creating flare + initial event must both succeed or both fail

**Verification**:
- Partial writes not possible
- Database remains consistent after crash

### DI-005: Data Validation

**Requirement**: Invalid data rejected before storage.

**Implementation Requirements**:
- Severity values: 1-10 integers only
- Timestamps: past or present (no future)
- Required fields enforced
- Referential integrity (e.g., flare event references valid flare)

**Verification**:
- Invalid inputs rejected with error message
- Database constraints enforce rules

---

## Performance Requirements

### P-001: Response Time

**Requirement**: User interactions feel instant.

**Targets**:
- Body map interactions: <100ms from tap to visual feedback
- Database queries: <50ms average for common operations
- Page loads: <1.5s First Contentful Paint
- Analytics calculations: <3s for 90-day correlation analysis

**Implementation Requirements**:
- Database indexing on common query patterns
- Query optimization (avoid full table scans)
- Lazy loading for large datasets
- Background calculation for analytics
- UI feedback before backend completes (optimistic updates)

### P-002: Offline Performance

**Requirement**: Full functionality offline without degradation.

**Implementation Requirements**:
- All features available offline
- Local storage sufficient for all operations
- Background sync queue for future cloud features
- No loading spinners for network requests (because no network)

### P-003: Storage Efficiency

**Requirement**: Efficient data storage to support years of tracking.

**Implementation Requirements**:
- Photo compression (JPEG quality 85-90%)
- Thumbnail generation (max 200x200px)
- Incremental data exports (not full export every time)
- Pagination for large lists
- Old data archival (optional, user-controlled)

**Targets**:
- 1 year of daily tracking: <50MB (excluding photos)
- 100 photos: <150MB (with encryption overhead)

### P-004: Battery Efficiency

**Requirement**: Minimal battery impact on mobile devices.

**Implementation Requirements**:
- No continuous background processing
- Analytics calculated on-demand or scheduled (e.g., overnight)
- Service worker caching reduces network use
- Throttled/debounced user input handlers

---

## User Experience Requirements

### UX-001: Mobile-First Design

**Requirement**: Primary design for mobile touch interfaces.

**Implementation Requirements**:
- Touch targets â¥ 44x44px
- Thumb-friendly navigation (bottom navigation bar)
- Swipe gestures (e.g., swipe to delete, swipe between views)
- Pinch-to-zoom (body map)
- No hover-dependent interactions
- Large text inputs (mobile keyboards)

**Verification**:
- Usability testing on mobile devices
- Accessibility audit (WCAG 2.1 AA)

### UX-002: Progressive Disclosure

**Requirement**: Minimize cognitive load by hiding complexity until needed.

**Implementation Requirements**:
- Default views show essential information
- Details expand on demand (accordions, modals)
- Advanced features hidden in "More" menus
- Tooltips for first-time users (dismissible)
- Clean, uncluttered interfaces

**Example**:
- Body map default view: overview with active flares
- Zoom reveals detail only when needed
- Flare detail: expandable history timeline

### UX-003: Immediate Feedback

**Requirement**: User actions provide instant visual feedback.

**Implementation Requirements**:
- Optimistic UI updates (update UI before database confirms)
- Loading states for long operations (>500ms)
- Toast notifications for confirmations
- Animations for state transitions (smooth, not distracting)
- Haptic feedback (mobile vibration) on important actions

**Example**:
- Tap body map â marker appears immediately
- Severity slider â number updates in real-time

### UX-004: Accessibility

**Requirement**: Usable by individuals with disabilities.

**Implementation Requirements**:
- WCAG 2.1 AA compliance
- Keyboard navigation (all features accessible via keyboard)
- Screen reader support (semantic HTML, ARIA labels)
- High contrast mode compatible
- Adjustable text size
- No color-only indicators (use icons/patterns too)
- Focus indicators visible

**Verification**:
- Automated accessibility scan (Lighthouse, axe)
- Manual testing with screen reader
- Keyboard-only navigation test

### UX-005: Error Handling

**Requirement**: Graceful error handling with clear recovery paths.

**Implementation Requirements**:
- User-friendly error messages (no technical jargon)
- Suggest corrective actions
- Validation errors shown inline (near input field)
- Confirmation dialogs for destructive actions
- Undo functionality where possible

**Example**:
- Invalid severity value: "Please enter a number between 1 and 10"
- Delete confirmation: "Are you sure? This cannot be undone."

---

## Appendix: Body Region Definitions

### Standard Body Regions (Front View)

1. Head
2. Neck (front)
3. Left shoulder
4. Right shoulder
5. Left upper arm
6. Right upper arm
7. Left elbow
8. Right elbow
9. Left forearm
10. Right forearm
11. Left wrist
12. Right wrist
13. Left hand
14. Right hand
15. Chest (upper)
16. Chest (lower)
17. Abdomen (upper)
18. Abdomen (lower)
19. **Groin (left)** â­
20. **Groin (right)** â­
21. **Groin (center)** â­
22. Left hip
23. Right hip
24. Left thigh (upper)
25. Right thigh (upper)
26. Left thigh (lower)
27. Right thigh (lower)
28. Left knee
29. Right knee
30. Left shin
31. Right shin
32. Left calf
33. Right calf
34. Left ankle
35. Right ankle
36. Left foot (top)
37. Right foot (top)

### Standard Body Regions (Back View)

38. Head (back)
39. Neck (back)
40. Left shoulder (back)
41. Right shoulder (back)
42. Upper back
43. Mid back
44. Lower back
45. Left upper arm (back)
46. Right upper arm (back)
47. Left elbow (back)
48. Right elbow (back)
49. Left forearm (back)
50. Right forearm (back)
51. Left hand (back)
52. Right hand (back)
53. Left buttock
54. Right buttock
55. Left thigh (back upper)
56. Right thigh (back upper)
57. Left thigh (back lower)
58. Right thigh (back lower)
59. Left knee (back)
60. Right knee (back)
61. Left calf (back)
62. Right calf (back)
63. Left ankle (back)
64. Right ankle (back)
65. Left foot (bottom)
66. Right foot (bottom)

### Specialized Regions

67. Armpits (left)
68. Armpits (right)
69. Under breast (left)
70. Under breast (right)
71. Between breasts
72. Navel region
73. Waistline (left)
74. Waistline (right)
75. Inner thigh (left upper)
76. Inner thigh (right upper)
77. Inner thigh (left lower)
78. Inner thigh (right lower)

### Additional Regions (Face/Head Detail)

79. Forehead
80. Left temple
81. Right temple
82. Left eye
83. Right eye
84. Nose
85. Left cheek
86. Right cheek
87. Mouth
88. Chin
89. Left ear
90. Right ear
91. Scalp (front)
92. Scalp (back)
93. Scalp (left)
94. Scalp (right)

**Note**: â­ denotes groin-specific regions added for HS tracking (primary requirement from PRD).

---

## Appendix: Correlation Analysis Algorithm

### Statistical Method: Spearman's Rank Correlation

**Why Spearman's Ï (not Pearson's r)**:
- Does not assume linear relationship
- Resistant to outliers
- Works with ordinal data (severity scales)
- Detects monotonic relationships (food consistently affects symptom, even if not proportionally)

### Algorithm Steps

**Input**:
- Symptom instances (list of {timestamp, severity})
- Food events (list of {timestamp, foodIds, portionSizes})
- Lag window (time delay to test, e.g., 2 hours)

**Process**:

1. **Time-Series Alignment**:
   - For each food event at time T
   - Find symptom instances in window [T + lag, T + lag + window_size]
   - Example: Food at 12:00 PM, lag = 2hr, window = 4hr â symptoms 2:00-6:00 PM

2. **Pair Creation**:
   - Create (food_portion, symptom_severity) pairs
   - Multiple symptom instances in window â multiple pairs
   - No symptom in window â exclude this food event

3. **Rank Transformation**:
   - Convert portions to ranks: small=1, medium=2, large=3
   - Convert severities to ranks: 1-10 scale preserved
   - Rank both variables independently

4. **Spearman's Ï Calculation**:
   ```
   Ï = 1 - (6 * Î£dÂ²) / (n * (nÂ² - 1))
   where:
   - d = difference between ranks
   - n = number of pairs
   ```

5. **P-Value Calculation**:
   - t-statistic: t = Ï * sqrt((n-2) / (1-ÏÂ²))
   - Degrees of freedom: df = n - 2
   - Two-tailed t-test to get p-value
   - Significance threshold: p < 0.05

6. **Confidence Level**:
   - High: p < 0.01 AND n â¥ 20
   - Medium: p < 0.05 AND n â¥ 10
   - Low: p < 0.05 AND n â¥ 5
   - Insufficient: n < 5 (do not display)

**Output**:
- Correlation coefficient (Ï): -1 to +1
- P-value: statistical significance
- Sample size (n): number of pairs
- Confidence level: high/medium/low

### Lag Window Testing

**Approach**: Test multiple lag windows to find strongest correlation.

**Lag Windows** (typical):
- 15 minutes
- 30 minutes
- 1 hour
- 2 hours
- 4 hours
- 8 hours
- 12 hours
- 24 hours
- 48 hours
- 72 hours

**Process**:
1. Run correlation analysis for each lag window
2. Identify lag with highest |Ï| (absolute value)
3. Report best lag window with correlation

**Rationale**: Food reactions vary by individual and allergen type. Some are immediate (15min), others delayed (24-72hr).

### Food Combination Analysis

**Approach**: Test if eating foods together has synergistic effect.

**Process**:
1. Identify meal groups (foods with same meal ID)
2. For each combination of 2+ foods:
   - Calculate combination correlation (as above)
   - Calculate individual food correlations
   - Compare: synergistic if `Ï_combination > max(Ï_individual) + 0.15`

**Example**:
- Tomato alone: Ï = 0.30 (p < 0.05, n=15)
- Egg alone: Ï = 0.25 (p < 0.05, n=12)
- Tomato + Egg: Ï = 0.62 (p < 0.01, n=10)
- Synergistic? YES (0.62 > 0.30 + 0.15)

**Rationale**: Some trigger combinations amplify each other (e.g., nightshades + eggs common in HS).

---

## Appendix: Privacy-First Architecture Principles

### Principle 1: Data Minimization

**What It Means**: Collect only data necessary for functionality.

**Implementation**:
- No email, phone, address, or personal identifiers required
- Optional fields remain optional (no forced data entry)
- No background data collection
- User controls what data to log

### Principle 2: User-Controlled Data

**What It Means**: User has complete control over their data.

**Implementation**:
- User decides when to export
- User decides what to share
- User can permanently delete all data
- No automatic backups without consent
- No cloud sync without opt-in

### Principle 3: Encryption at Rest

**What It Means**: Sensitive data encrypted in storage.

**Implementation**:
- Photos encrypted with AES-256-GCM
- Unique key per photo
- Database encryption (if supported by storage layer)
- Encryption keys protected by platform (OS keychain)

### Principle 4: No Third-Party Data Sharing

**What It Means**: Zero data transmission to external services.

**Implementation**:
- No analytics libraries (Google, Mixpanel, etc.)
- No advertising networks
- No social media integrations
- No error tracking services (unless opt-in)
- No external APIs for data storage

### Principle 5: Transparency

**What It Means**: User understands data handling.

**Implementation**:
- Privacy policy in plain language
- Onboarding explains local-first architecture
- Opt-in dialogs for any data transmission
- Open-source code (if applicable) for auditing
- Export functionality to review all stored data

---

## Appendix: Implementation Notes

### Recommended Storage Options

**Client-Side Storage**:
- **Web/PWA**: IndexedDB (via library like Dexie, idb, or PouchDB)
- **Mobile Native**: SQLite (iOS/Android), Realm, or Core Data (iOS)
- **Desktop Native**: SQLite, LevelDB, or filesystem JSON

**Requirements**:
- Support for structured data (tables/collections)
- Indexed queries (userId + timestamp, userId + status, etc.)
- Transactions (atomic multi-record operations)
- Blob storage (for encrypted photos)
- Schema migrations (versioning)

### Recommended Photo Encryption

**Algorithm**: AES-256-GCM

**Libraries**:
- **JavaScript**: Web Crypto API (native browser), crypto-js
- **iOS/Swift**: CryptoKit (iOS 13+), CommonCrypto
- **Android/Kotlin**: Javax.crypto, Android Keystore
- **Python**: cryptography library, PyCryptodome

**Key Management**:
- Generate unique key per photo (256-bit random)
- Store keys separately from encrypted data
- Use OS keychain/keystore for key protection (iOS Keychain, Android Keystore)
- Include keys in encrypted backup exports

### Recommended UI Frameworks

**Web/PWA**:
- React, Vue, Svelte, Angular
- Tailwind CSS, Bootstrap, Material UI
- Chart.js, D3.js, Recharts (for analytics)

**Mobile Native**:
- iOS: SwiftUI, UIKit
- Android: Jetpack Compose, XML layouts
- Cross-platform: React Native, Flutter

**Desktop Native**:
- Electron (web tech wrapper)
- Tauri (Rust-based, lighter than Electron)
- Qt (C++), Gtk (Linux), Cocoa (macOS)

### Recommended Testing Strategy

**Unit Tests**:
- Correlation algorithm (verify Spearman's Ï calculation)
- Data validation (severity ranges, timestamp formats)
- Encryption/decryption (verify AES-256-GCM)

**Integration Tests**:
- Flare lifecycle workflows (create â update â resolve)
- Food-symptom correlation pipeline
- Data export/import

**E2E Tests**:
- User workflows (onboarding, logging flare, viewing analytics)
- Cross-device compatibility (if multi-platform)

**Performance Tests**:
- Query performance (<50ms target)
- Photo encryption/decryption (<500ms for 5MB photo)
- Analytics calculation (<3s for 90-day correlation)

---

## Appendix: Future Enhancements (Out of Scope)

These features are **NOT required** for initial implementation but may be added later:

### Phase 2: Intelligence Layer

- **Predictive analytics**: ML model to predict flare likelihood based on patterns
- **Cyclical detection**: Identify menstrual cycle, seasonal, or other cyclical patterns
- **Treatment recommendation**: Suggest interventions based on past effectiveness
- **AI-powered insights**: Natural language summaries of health patterns

### Phase 3: Advanced Collaboration

- **Healthcare provider portal**: Secure sharing with doctors (HIPAA-compliant)
- **Peer-to-peer sync**: Encrypted sync across user's own devices
- **Encrypted cloud backup**: Optional cloud storage with zero-knowledge encryption
- **Community anonymized data**: Opt-in aggregated research data (fully anonymized)

### Phase 4: Wearable Integration

- **Fitness tracker data**: Import sleep, activity, heart rate data
- **Smart scale integration**: Weight tracking correlations
- **Continuous glucose monitor**: Blood sugar correlations (relevant for some autoimmune conditions)

### Phase 5: Advanced Analytics

- **Medical-grade PDF reports**: Formatted reports for insurance/disability claims
- **Statistical report generation**: Cohort analysis, survival curves
- **Research export**: De-identified data in research-ready formats (CSV, SPSS)

---

## Conclusion

This specification provides a complete, technology-agnostic blueprint for rebuilding the Pocket Symptom Tracker application. The focus is on:

1. **Business logic**: What the system does, not how it's implemented
2. **User workflows**: Real-world usage patterns
3. **Privacy guarantees**: Non-negotiable privacy and security requirements
4. **Data integrity**: Medical-grade data handling
5. **Extensibility**: Foundation for future enhancements

Implementers can choose any technology stack (web, mobile, desktop) while preserving the core value proposition: **privacy-first, offline-capable, precision health tracking for individuals with chronic conditions**.

---

**Generated**: 2025-11-12
**Source Project**: Pocket Symptom Tracker (Next.js 15 + React 19 + Dexie)
**Purpose**: Technology-agnostic rebuild specification
**License**: MIT (preserve attribution)