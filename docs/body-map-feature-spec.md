# Enhanced Body Map Feature Specification
## Optimized for Hidradenitis Suppurativa (HS) Tracking

---

## Overview

The Body Map is a core feature enabling users to visually document the precise location of HS lesions and symptoms on an anatomical representation of the human body. This specification details an enhanced version that provides a more natural appearance, finer-grained region selection, precise marker placement within zoomed regions, and **clinically-validated HS tracking aligned with IHS4, Hurley staging, and patient-reported outcome measures used by healthcare providers**.

---

## Clinical Foundation

This specification incorporates established clinical assessment tools to ensure tracked data is meaningful and useful for healthcare provider discussions:

| Tool | Purpose | How We Use It |
|------|---------|---------------|
| **IHS4** (International HS Severity Score System) | Dynamic severity scoring | Auto-calculate from lesion counts |
| **Hurley Staging** | Static severity classification | User self-assessment + guidance |
| **HSSD** (HS Symptom Daily Diary) | Patient-reported symptoms | Daily symptom capture |
| **HiSQOL** | Quality of life domains | Impact tracking over time |

---

## Goals

1. **Natural Appearance**: Replace the basic geometric SVG with a more anatomically accurate, aesthetically pleasing body illustration
2. **Increased Precision**: Expand from ~26 regions to 50+ clickable zones for more specific symptom localization
3. **Zoom-to-Region**: Allow users to tap a body region to expand it and fill the viewport for detailed marker placement
4. **HS-Specific Lesion Tracking**: Track the specific lesion types (nodules, abscesses, draining tunnels) required for IHS4 scoring
5. **Clinical Utility**: Capture data that healthcare providers need to assess disease severity and treatment response
6. **Low Friction**: Maintain ease of use during flares when users may have limited dexterity or cognitive capacity

---

## User Stories

### Primary User Stories

1. **As a user**, I want to tap on a body region to zoom into it, so I can place a marker at the exact location of my lesion.

2. **As a user**, I want to classify my lesions by type (nodule, abscess, draining tunnel), so I can accurately track my IHS4 score over time.

3. **As a user**, I want to see my current IHS4 score calculated automatically, so I can understand my disease severity and share it with my doctor.

4. **As a user**, I want to track symptoms like pain, drainage, and odor for each lesion, so I can give my healthcare provider complete information.

5. **As a user**, I want to view front and back views of the body with emphasis on HS-prone areas, so I can quickly access the regions where I typically have flares.

6. **As a user**, I want to record prodromal symptoms (burning, itching, warmth) before a lesion appears, so I can identify early warning signs.

### Secondary User Stories

7. **As a user**, I want to see a history of my IHS4 scores over time, so I can track whether my treatment is working.

8. **As a user**, I want to generate a summary report for my dermatologist, so they can quickly understand my disease status.

9. **As a user**, I want to track my Hurley stage for each affected area, so I can discuss disease progression with my doctor.

10. **As a user**, I want to note quality of life impacts (activities affected, emotional state), so I have a complete picture of my disease burden.

---

## Detailed Requirements

### 1. Body Map Illustration

#### 1.1 Visual Design
- **Style**: Clean, modern anatomical silhouette—detailed enough to be recognizable but not overly realistic (avoid medical diagram aesthetic)
- **Gender**: Provide gender-neutral default with optional male/female body type selection in settings
- **Skin Tone**: Use a neutral, accessible color (e.g., soft gray or muted tone) that works in both light and dark mode
- **HS-Prone Highlighting**: Subtle visual emphasis on common HS areas (axillae, groin, inframammary, buttocks) to aid quick navigation
- **Dimensions**: SVG should be responsive, scaling smoothly from 320px to 1200px+ viewport widths

#### 1.2 Views
- **Front View**: Primary view showing anterior body
- **Back View**: Secondary view showing posterior body
- **Toggle**: Clear, accessible toggle button to switch between views
- **State Persistence**: Remember last-viewed side within a session
- **Quick Access**: Floating action buttons or shortcuts to jump to common HS regions

#### 1.3 Region Definitions

The body should be divided into clickable regions with **HS-priority areas** receiving finer granularity:

**HS-Priority Regions (High Granularity)**

*Axillae / Armpits (4 regions)*
- Left Axilla (central)
- Left Axilla (peripheral)
- Right Axilla (central)
- Right Axilla (peripheral)

*Groin / Inguinal (6 regions)*
- Left Groin (inguinal fold)
- Left Inner Thigh (upper)
- Right Groin (inguinal fold)
- Right Inner Thigh (upper)
- Mons Pubis
- Perineum

*Inframammary / Chest (6 regions)*
- Left Inframammary Fold
- Right Inframammary Fold
- Left Breast/Chest
- Right Breast/Chest
- Intermammary (between breasts/chest)
- Submammary (below breast tissue)

*Buttocks / Gluteal (6 regions)*
- Left Buttock (upper)
- Left Buttock (lower)
- Right Buttock (upper)
- Right Buttock (lower)
- Gluteal Cleft (intergluteal)
- Perianal

*Waistband / Belt Line (4 regions)*
- Left Waist/Flank
- Right Waist/Flank
- Lower Abdomen (suprapubic)
- Lower Back (sacral)

**Standard Regions**

*Head & Neck (6 regions)*
- Head/Face (front)
- Head/Scalp (back)
- Neck (front)
- Neck (back)
- Left Ear area
- Right Ear area

*Torso - Front (4 regions)*
- Upper Chest (left)
- Upper Chest (right)
- Upper Abdomen
- Mid Abdomen

*Torso - Back (4 regions)*
- Upper Back (left)
- Upper Back (right)
- Mid Back (left)
- Mid Back (right)

*Arms (12 regions - 6 per arm)*
- Shoulder (left/right)
- Upper Arm inner (left/right)
- Upper Arm outer (left/right)
- Elbow (left/right)
- Forearm (left/right)
- Hand (left/right)

*Legs (12 regions - 6 per leg)*
- Hip (left/right)
- Thigh (front, left/right)
- Thigh (back, left/right)
- Knee (left/right)
- Shin/Calf (left/right)
- Ankle/Foot (left/right)

**Total: ~58 regions** (26 HS-priority + 32 standard)

#### 1.4 Region Interaction States
- **Default**: Subtle fill or no fill, visible boundary
- **HS-Priority Region**: Slightly emphasized border or icon indicator
- **Hover** (desktop): Slight highlight, cursor change to pointer
- **Tap/Press**: Brief highlight animation
- **Has Active Lesions**: Visual indicator showing region contains current lesions
- **Has History**: Different indicator for regions with past (healed) lesions
- **Selected/Zoomed**: Clear indication this is the active region

---

### 2. HS Lesion Tracking (IHS4-Aligned)

#### 2.1 Lesion Types

The app must distinguish between the three lesion types used in IHS4 scoring:

| Lesion Type | IHS4 Weight | Visual Identifier | Description |
|-------------|-------------|-------------------|-------------|
| **Inflammatory Nodule** | ×1 | 🔴 Solid circle | Firm, painful bump under skin; not draining |
| **Abscess** | ×2 | 🟡 Circle with center dot | Pus-filled; may be fluctuant; often very painful |
| **Draining Tunnel** | ×4 | 🟣 Circle with line | Sinus tract; actively draining; may connect lesions |

#### 2.2 IHS4 Score Calculation

```
IHS4 = (Nodule Count × 1) + (Abscess Count × 2) + (Draining Tunnel Count × 4)
```

| Score | Severity | Display |
|-------|----------|---------|
| ≤3 | Mild | Green indicator |
| 4-10 | Moderate | Yellow/Orange indicator |
| ≥11 | Severe | Red indicator |

**Implementation Notes:**
- Calculate and display IHS4 score in real-time as user adds/removes lesions
- Show score prominently on body map overview
- Track score history over time for trend visualization
- Allow export of IHS4 scores with dates for healthcare provider

#### 2.3 Data Model Overview

The data model uses **three separate entities** to cleanly handle lesions that persist across multiple days:

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA RELATIONSHIPS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   HSLesion (persistent)                                         │
│   ══════════════════════                                        │
│   Lives for days/weeks until healed                             │
│   Stores: location, type, onset date, status                    │
│                                                                  │
│        │                                                         │
│        │ one-to-many                                            │
│        ▼                                                         │
│   LesionObservation (daily snapshot)                            │
│   ══════════════════════════════════                            │
│   Created each day user logs this lesion                        │
│   Stores: today's pain, drainage, size, photos                  │
│                                                                  │
│        │                                                         │
│        │ many-to-one                                            │
│        ▼                                                         │
│   DailyHSEntry (daily summary)                                  │
│   ════════════════════════════                                  │
│   One per calendar day                                          │
│   Stores: overall symptoms, IHS4, QoL, triggers                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Example: A nodule that lasts 5 days**

```
Day 1: User notices nodule in left axilla
       → Creates HSLesion (id: "lesion-abc", onsetDate: "Nov 10")
       → Creates LesionObservation (pain: 4, size: small)
       → DailyHSEntry includes this in IHS4 calculation

Day 2: Nodule is worse
       → Same HSLesion (no new lesion created)
       → New LesionObservation (pain: 6, size: medium)
       → New DailyHSEntry with updated IHS4

Day 5: Nodule is healing
       → Same HSLesion (status updated to 'healing')
       → New LesionObservation (pain: 2, size: small)
       → DailyHSEntry still counts it (until fully healed)

Day 8: Nodule healed
       → HSLesion updated (status: 'healed', healedDate: "Nov 17")
       → No longer counted in IHS4
```

---

#### 2.4 HSLesion (Persistent Entity)

A lesion exists independently and persists until healed. It stores **stable properties** that don't change day-to-day.

```typescript
interface HSLesion {
  id: string;                          // UUID - stable across lifetime
  
  // Location (set once when created)
  regionId: string;                    // e.g., "left-axilla-central"
  coordinates: {
    x: number;                         // 0-100 percentage within region
    y: number;                         // 0-100 percentage within region
  };
  
  // Classification (may evolve - e.g., nodule → abscess)
  lesionType: 'nodule' | 'abscess' | 'draining_tunnel';
  
  // Lifecycle
  status: 'active' | 'healing' | 'healed' | 'scarred';
  onsetDate: string;                   // ISO date when first appeared
  healedDate?: string;                 // ISO date when resolved (null if active)
  
  // History tracking
  typeHistory?: {                      // If lesion evolved
    date: string;
    fromType: string;
    toType: string;
  }[];
  
  // Recurrence tracking
  recurrenceOf?: string;               // ID of previous lesion in same spot
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}
```

---

#### 2.5 LesionObservation (Daily Snapshot)

Each time a user logs information about a lesion, they create an observation. This captures **how the lesion is doing TODAY**.

```typescript
interface LesionObservation {
  id: string;                          // UUID
  lesionId: string;                    // → HSLesion.id
  entryId: string;                     // → DailyHSEntry.id
  date: string;                        // ISO date of observation
  
  // Current State
  size: 'small' | 'medium' | 'large'; // <1cm, 1-3cm, >3cm
  
  // Symptom Scores (0-10 scale, aligned with HSSD)
  symptoms: {
    pain: number;                      // 0-10 worst pain today
    tenderness: number;                // 0-10 pain when touched
    swelling: number;                  // 0-10
    heat: number;                      // 0-10 warmth/inflammation
    itch: number;                      // 0-10
    pressure: number;                  // 0-10 feeling of pressure
  };
  
  // Drainage Assessment (for abscesses and tunnels)
  drainage: {
    amount: 'none' | 'minimal' | 'moderate' | 'heavy';
    type?: 'clear' | 'blood-tinged' | 'purulent' | 'mixed';
    odor: 'none' | 'mild' | 'moderate' | 'severe';
  };
  
  // Pain Characterization
  painType?: {
    nociceptive: boolean;              // Aching, throbbing, gnawing
    neuropathic: boolean;              // Burning, electric, shooting
  };
  
  // Documentation
  photos?: string[];                   // Photo IDs taken this observation
  notes?: string;
  
  // Status change (if user marks lesion as healing/healed)
  statusChange?: {
    newStatus: 'healing' | 'healed' | 'scarred';
    note?: string;
  };
  
  createdAt: string;
}
```

---

#### 2.6 DailyHSEntry (Daily Summary)

One entry per calendar day. Stores **overall state** and **calculated aggregates**.

```typescript
interface DailyHSEntry {
  id: string;                          // UUID
  date: string;                        // ISO date (unique per user)
  
  // ═══════════════════════════════════════════════════════════
  // IHS4 CALCULATION (auto-computed from active lesions)
  // ═══════════════════════════════════════════════════════════
  
  ihs4: {
    score: number;                     // Calculated: (N×1)+(A×2)+(T×4)
    severity: 'mild' | 'moderate' | 'severe';
    breakdown: {
      nodules: number;                 // Count of active nodules
      abscesses: number;               // Count of active abscesses
      drainingTunnels: number;         // Count of active tunnels
    };
    // IDs of lesions counted (for audit trail)
    lesionIds: string[];
  };
  
  // ═══════════════════════════════════════════════════════════
  // OVERALL SYMPTOMS (worst/average across all lesions + general)
  // ═══════════════════════════════════════════════════════════
  
  overallSymptoms: {
    worstPain: number;                 // 0-10, highest pain today
    averagePain: number;               // 0-10, typical pain level
    overallDrainage: 'none' | 'minimal' | 'moderate' | 'heavy';
    odor: 'none' | 'mild' | 'moderate' | 'severe';
    fatigue: number;                   // 0-10, general fatigue level
  };
  
  // ═══════════════════════════════════════════════════════════
  // QUALITY OF LIFE (HiSQOL-inspired)
  // ═══════════════════════════════════════════════════════════
  
  qualityOfLife: {
    // Activities affected today
    activitiesAffected: {
      mobility: boolean;               // Walking, sitting, moving
      dressing: boolean;               // Clothing choices
      sleep: boolean;
      workOrSchool: boolean;
      exercise: boolean;
      intimacy: boolean;
      socialActivities: boolean;
    };
    
    // Emotional state (0=none, 4=extreme)
    emotional: {
      embarrassment: 0 | 1 | 2 | 3 | 4;
      anxiety: 0 | 1 | 2 | 3 | 4;
      depression: 0 | 1 | 2 | 3 | 4;
      frustration: 0 | 1 | 2 | 3 | 4;
    };
  };
  
  // ═══════════════════════════════════════════════════════════
  // FLARE TRACKING
  // ═══════════════════════════════════════════════════════════
  
  flare: {
    isFlareDay: boolean;               // User considers this a flare
    flareId?: string;                  // Groups consecutive flare days
    newLesionsToday: number;           // Count of lesions with onset today
  };
  
  // ═══════════════════════════════════════════════════════════
  // TRIGGERS & CONTEXT
  // ═══════════════════════════════════════════════════════════
  
  triggers?: {
    menstruation: boolean;
    stress: 'none' | 'mild' | 'moderate' | 'severe';
    poorSleep: boolean;
    dietaryFactors?: string[];         // e.g., ["dairy", "sugar"]
    heatExposure: boolean;
    friction: boolean;                 // Tight clothing, exercise
    shaving: boolean;
    illness: boolean;
    other?: string;
  };
  
  // ═══════════════════════════════════════════════════════════
  // TREATMENTS USED TODAY
  // ═══════════════════════════════════════════════════════════
  
  treatments?: {
    warmCompress: boolean;
    coolCompress: boolean;
    topicalTreatments?: string[];      // e.g., ["clindamycin", "benzoyl peroxide"]
    oralMedications?: string[];        // e.g., ["doxycycline", "ibuprofen"]
    biologicInjection?: {
      medication: string;              // e.g., "adalimumab"
      injectionSite?: string;
    };
    incisionDrainage: boolean;         // Medical or self
    woundCare: boolean;
    other?: string;
  };
  
  // ═══════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════
  
  notes?: string;                      // General notes for the day
  mood?: 1 | 2 | 3 | 4 | 5;           // Quick mood rating
  
  createdAt: string;
  updatedAt: string;
}
```

---

#### 2.7 ProdromalMarker (Pre-Lesion Warning)

Tracks warning symptoms before a visible lesion appears. Can be converted to a full lesion.

```typescript
interface ProdromalMarker {
  id: string;
  regionId: string;
  coordinates: { x: number; y: number };
  date: string;                        // When symptoms noticed
  
  symptoms: {
    burning: boolean;
    stinging: boolean;
    itching: boolean;
    warmth: boolean;
    hyperhidrosis: boolean;            // Excess sweating
    tightness: boolean;
    "something feels off": boolean;    // Hard to describe feeling
  };
  
  // Conversion tracking
  convertedToLesionId?: string;        // If this became a lesion
  conversionDate?: string;
  
  // If it resolved without becoming a lesion
  resolvedWithoutLesion?: boolean;
  resolvedDate?: string;
  
  createdAt: string;
}
```

---

#### 2.8 IHS4 Calculation Logic

```typescript
function calculateIHS4ForDate(
  lesions: HSLesion[], 
  date: string
): DailyHSEntry['ihs4'] {
  
  // Get lesions that were active on this date
  const activeLesions = lesions.filter(lesion => {
    const onsetDate = new Date(lesion.onsetDate);
    const targetDate = new Date(date);
    const healedDate = lesion.healedDate ? new Date(lesion.healedDate) : null;
    
    // Lesion must have started on or before this date
    const hasStarted = onsetDate <= targetDate;
    
    // Lesion must not have healed before this date
    const notYetHealed = !healedDate || healedDate >= targetDate;
    
    // Must be in countable status
    const isCountable = ['active', 'healing'].includes(lesion.status);
    
    return hasStarted && notYetHealed && isCountable;
  });
  
  // Count by type
  const nodules = activeLesions.filter(l => l.lesionType === 'nodule').length;
  const abscesses = activeLesions.filter(l => l.lesionType === 'abscess').length;
  const tunnels = activeLesions.filter(l => l.lesionType === 'draining_tunnel').length;
  
  // Calculate score
  const score = (nodules * 1) + (abscesses * 2) + (tunnels * 4);
  
  // Determine severity
  const severity = score <= 3 ? 'mild' 
    : score <= 10 ? 'moderate' 
    : 'severe';
  
  return {
    score,
    severity,
    breakdown: { nodules, abscesses, drainingTunnels: tunnels },
    lesionIds: activeLesions.map(l => l.id)
  };
}
```

---

#### 2.9 Common Operations

**Creating a new lesion:**
```typescript
// 1. Create the persistent lesion
const lesion: HSLesion = {
  id: generateUUID(),
  regionId: "left-axilla-central",
  coordinates: { x: 45, y: 62 },
  lesionType: "nodule",
  status: "active",
  onsetDate: "2024-11-15",
  createdAt: now(),
  updatedAt: now()
};

// 2. Create today's observation
const observation: LesionObservation = {
  id: generateUUID(),
  lesionId: lesion.id,
  entryId: todaysEntry.id,
  date: "2024-11-15",
  size: "small",
  symptoms: { pain: 5, tenderness: 4, swelling: 3, heat: 2, itch: 1, pressure: 2 },
  drainage: { amount: "none", odor: "none" },
  createdAt: now()
};

// 3. Recalculate today's IHS4
todaysEntry.ihs4 = calculateIHS4ForDate(allLesions, "2024-11-15");
```

**Updating an existing lesion:**
```typescript
// Just create a new observation - don't modify the lesion itself
const observation: LesionObservation = {
  id: generateUUID(),
  lesionId: existingLesion.id,  // Same lesion
  entryId: todaysEntry.id,       // Today's entry
  date: "2024-11-16",            // New date
  size: "medium",                // Size changed
  symptoms: { pain: 7, ... },    // Pain increased
  drainage: { amount: "minimal", type: "purulent", odor: "mild" },
  createdAt: now()
};
```

**Marking a lesion as healed:**
```typescript
// 1. Update the lesion status
existingLesion.status = "healed";
existingLesion.healedDate = "2024-11-20";
existingLesion.updatedAt = now();

// 2. Create final observation with status change
const observation: LesionObservation = {
  ...baseObservation,
  statusChange: {
    newStatus: "healed",
    note: "Finally closed up after 5 days"
  }
};

// 3. Future IHS4 calculations will exclude this lesion
```

**Lesion type evolution (nodule → abscess):**
```typescript
// Update the lesion type and track history
existingLesion.lesionType = "abscess";
existingLesion.typeHistory = [
  ...(existingLesion.typeHistory || []),
  { 
    date: "2024-11-17", 
    fromType: "nodule", 
    toType: "abscess" 
  }
];
existingLesion.updatedAt = now();

// IHS4 weight changes from ×1 to ×2
```

---

### 3. Hurley Staging Integration

#### 3.1 Per-Region Hurley Stage

Each affected body region can have its own Hurley stage:

| Stage | Criteria | Visual Indicator |
|-------|----------|------------------|
| **Stage I** | Single or multiple abscesses; no sinus tracts or scarring | ● (single dot) |
| **Stage II** | Recurrent abscesses with sinus tract formation OR scarring; lesions widely separated | ●● (double dot) |
| **Stage III** | Diffuse involvement; multiple interconnected sinus tracts and abscesses | ●●● (triple dot) |

#### 3.2 Hurley Stage Data Model

```typescript
interface RegionHurleyStatus {
  regionId: string;
  hurleyStage: 1 | 2 | 3 | null;
  hasScarring: boolean;
  hasSinusTracts: boolean;
  lesionsInterconnected: boolean;
  lastAssessedDate: string;
  notes?: string;
}
```

#### 3.3 Guided Hurley Assessment

Provide a simple wizard to help users determine their Hurley stage per region:

```
Q1: Do you have sinus tracts (tunnels under the skin) in this area?
    → No → Likely Stage I
    → Yes → Continue

Q2: Are multiple lesions connected by tunnels?
    → No, tunnels are between isolated lesions → Likely Stage II
    → Yes, widespread interconnected tunnels → Likely Stage III

Q3: Is there significant scarring in this area?
    → Records for tracking progression
```

---

### 4. Patient-Reported Symptoms (HSSD-Aligned)

#### 4.1 Daily Symptom Capture

The `DailyHSEntry` (defined in Section 2.6) captures overall daily symptoms beyond individual lesion tracking. Key fields include:

- **IHS4 calculation** — Auto-computed from active lesions
- **Overall symptoms** — Worst pain, average pain, drainage, odor, fatigue
- **Quality of life** — Activities affected, emotional state
- **Triggers** — Menstruation, stress, diet, heat, friction
- **Treatments** — What was used today

See Section 2.6 for the complete `DailyHSEntry` interface.

#### 4.2 Quick Daily Check-In

For low-friction daily tracking, provide a minimal entry option:

```
┌─────────────────────────────────────┐
│  Daily Check-In - Nov 15           │
├─────────────────────────────────────┤
│                                     │
│  How are you feeling today?         │
│                                     │
│  😊  😐  😟  😢  😭                │
│  Great  OK  Rough Painful Bad      │
│                                     │
│  Any new lesions today?             │
│  [Yes - Add to Map]  [No]          │
│                                     │
│  Overall pain (0-10):               │
│  ○○○○○●○○○○○  (5)                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Save Quick Entry       │   │
│  └─────────────────────────────┘   │
│                                     │
│  [+ Add More Details]              │
│                                     │
└─────────────────────────────────────┘
```

---

### 5. Zoom-to-Region Functionality

#### 5.1 Trigger
- **Action**: Single tap/click on any defined region
- **Response Time**: Transition should begin within 100ms of tap

#### 5.2 Transition Animation
- **Type**: Smooth zoom + pan animation
- **Duration**: 300-400ms (respect reduced-motion preferences)
- **Easing**: Ease-out curve for natural deceleration
- **Effect**: Selected region scales up and centers in viewport

#### 5.3 Zoomed View Layout

```
┌─────────────────────────────────────┐
│  ← Back       Left Axilla    [⚙️]  │  <- Header with region & Hurley indicator
│               Hurley Stage II       │
├─────────────────────────────────────┤
│                                     │
│     ┌───────────────────────┐       │
│     │                       │       │
│     │   [Zoomed Region      │       │
│     │    SVG]               │       │
│     │      🔴 nodule        │       │
│     │           🟡 abscess  │       │
│     │      🟣 tunnel        │       │
│     │                       │       │
│     └───────────────────────┘       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [+ Add Lesion] [📷 Photo] │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Active Lesions (3)                 │
│  ├─ 🔴 Nodule - Pain: 6/10         │
│  ├─ 🟡 Abscess - Draining          │
│  └─ 🟣 Tunnel - Moderate odor      │
│                                     │
│  [View History] [Update Hurley]    │
└─────────────────────────────────────┘
```

#### 5.4 Zoomed Region SVG
- HS-priority regions should have more detailed SVGs showing skin folds, creases
- Show existing lesions with appropriate icons
- Indicate scarred areas with subtle texture/shading

#### 5.5 Navigation
- **Back Button**: Prominent back arrow in top-left returns to full body view
- **Swipe Gesture**: Swipe right to go back (optional)
- **Hardware Back**: Support Android/browser back button
- **Adjacent Navigation**: Quick-nav to other HS-priority regions

---

### 6. Lesion Entry Modal

#### 6.1 Layout (Bottom Sheet Pattern)

```
┌─────────────────────────────────────┐
│ ═══════════                         │  <- Drag handle
│                                     │
│  New Lesion - Left Axilla      [X]  │
│                                     │
│  What type of lesion?               │
│  ┌─────────────────────────────┐    │
│  │ 🔴 Nodule    │ 🟡 Abscess  │    │
│  │  (×1 IHS4)   │  (×2 IHS4)  │    │
│  ├──────────────┼─────────────┤    │
│  │ 🟣 Draining  │ ⚪ Prodromal │    │
│  │   Tunnel     │  (warning)   │    │
│  │  (×4 IHS4)   │              │    │
│  └─────────────────────────────┘    │
│                                     │
│  Size                               │
│  ○ Small (<1cm)  ● Medium  ○ Large │
│                                     │
│  Pain Level                         │
│  0 ───────●───────── 10             │
│           6                         │
│                                     │
│  Is it draining?                    │
│  ○ No  ○ Minimal  ● Moderate  ○ Heavy│
│                                     │
│  [+ More Details]                   │
│                                     │
│  ┌─────────────────────────────┐    │
│  │        Save Lesion          │    │
│  └─────────────────────────────┘    │
│                                     │
│  IHS4 Impact: +2 → Score: 8 (Mod)  │
│                                     │
└─────────────────────────────────────┘
```

#### 6.2 Expanded Details (Optional)

```
┌─────────────────────────────────────┐
│  Additional Details                 │
├─────────────────────────────────────┤
│                                     │
│  Symptoms (0-10)                    │
│  Tenderness: ○○○○●○○○○○○  (4)      │
│  Swelling:   ○○○○○○●○○○○  (6)      │
│  Heat:       ○○○●○○○○○○○  (3)      │
│  Itch:       ○○●○○○○○○○○  (2)      │
│                                     │
│  Drainage Type (if applicable)      │
│  ○ Clear  ○ Blood-tinged           │
│  ● Purulent  ○ Foul-smelling       │
│                                     │
│  Pain Character                     │
│  ☑ Aching/throbbing (nociceptive)  │
│  ☐ Burning/shooting (neuropathic)  │
│                                     │
│  Is this a new lesion?              │
│  ● Yes, appeared today/recently    │
│  ○ No, existing lesion update      │
│                                     │
│  Notes                              │
│  ┌─────────────────────────────┐    │
│  │ Started as bump 2 days ago, │    │
│  │ now draining...             │    │
│  └─────────────────────────────┘    │
│                                     │
│  [📷 Add Photo]                     │
│                                     │
└─────────────────────────────────────┘
```

#### 6.3 Quick Entry Mode (Flare-Friendly)

For users experiencing cognitive difficulties or limited dexterity during flares:
- Large tap targets (minimum 56px) for lesion type selection
- Single-tap severity selection (no sliders)
- Pre-filled defaults based on user's common patterns
- Voice input option for notes
- Save with minimal required fields (just lesion type + region)

---

### 7. Overview State (Full Body with IHS4)

#### 7.1 IHS4 Dashboard Header

```
┌─────────────────────────────────────┐
│  Today's Status                     │
│  ┌─────────────────────────────┐   │
│  │  IHS4 Score: 8              │   │
│  │  ████████░░ MODERATE        │   │
│  │                             │   │
│  │  🔴 3 Nodules               │   │
│  │  🟡 1 Abscess               │   │
│  │  🟣 1 Tunnel                │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│        [Body Map Below]             │
└─────────────────────────────────────┘
```

#### 7.2 Body Map Indicators

When viewing the full body map:

- **No lesions**: Region appears in default state
- **Active lesions**: Show lesion type icons scaled down
- **Multiple lesions**: Show count badge with predominant type color
- **HS-Priority regions**: Subtle highlight even when empty
- **Hurley Stage indicator**: Small stage badge on affected regions

#### 7.3 Legend

Show a collapsible legend explaining markers:

```
Legend:
🔴 Nodule (×1)  🟡 Abscess (×2)  🟣 Tunnel (×4)
⬜ Stage I  ⬜⬜ Stage II  ⬜⬜⬜ Stage III
```

---

### 8. Healthcare Provider Reports

#### 8.1 Exportable Summary

Generate shareable reports for doctor visits:

```
┌─────────────────────────────────────────────────┐
│  HS Status Report                               │
│  Generated: November 15, 2024                   │
│  Patient: [Name]                                │
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
│  POTENTIAL TRIGGERS IDENTIFIED                  │
│  ────────────────────────────                   │
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
└─────────────────────────────────────────────────┘
```

#### 8.2 Export Formats
- PDF (for printing/emailing)
- CSV (for data portability)
- FHIR-compatible JSON (future enhancement)

---

### 9. Data Persistence & Integration

#### 9.1 Storage
- Store all data in local IndexedDB (following app's local-first architecture)
- Each lesion links to a daily entry via `entryId`
- Support offline creation and editing
- Automatic local backup

#### 9.2 Sync
- Lesions and entries should sync with future cloud backend
- Include conflict resolution for data edited on multiple devices
- Support selective sync (user controls what syncs)

#### 9.3 Integration Points
- **Daily Entry**: Body map accessible from daily symptom entry screen
- **History View**: View historical lesions and IHS4 scores for any past date
- **Trend Dashboard**: Charts showing IHS4 progression, flare frequency
- **Calendar View**: See flare days, treatment days at a glance
- **Export**: Generate reports for healthcare providers

---

### 10. Accessibility Requirements

#### 10.1 Screen Reader Support
- All regions must have descriptive labels (e.g., "Left axilla region, 2 active lesions, Hurley Stage II")
- Lesions announce type, severity, and key symptoms when focused
- IHS4 score announced on body map load
- Modal announces when opened/closed

#### 10.2 Motor Accessibility
- Minimum 44x44px touch targets (56px for lesion type selection in flare mode)
- Support for switch access / keyboard navigation
- No time-limited interactions
- Provide alternative to drag gestures (use tap-to-place as primary)

#### 10.3 Visual Accessibility
- Color should not be sole indicator (use icons/shapes with color)
- Support high contrast mode
- Respect system font size settings
- Support reduced motion preferences
- Colorblind-safe palette for lesion indicators

#### 10.4 Cognitive Accessibility
- Clear, simple labels
- Consistent interaction patterns
- Undo available for lesion deletion
- Progress auto-saved
- Flare-friendly quick entry mode

---

### 11. Technical Implementation Notes

#### 11.1 SVG Structure

```
/assets/body-map/
  ├── body-front.svg          # Full front view with region paths
  ├── body-back.svg           # Full back view with region paths
  └── regions/
      ├── hs-priority/
      │   ├── left-axilla.svg
      │   ├── right-axilla.svg
      │   ├── left-groin.svg
      │   ├── right-groin.svg
      │   ├── left-inframammary.svg
      │   ├── right-inframammary.svg
      │   ├── left-buttock.svg
      │   ├── right-buttock.svg
      │   ├── perianal.svg
      │   └── gluteal-cleft.svg
      └── standard/
          ├── head-front.svg
          ├── left-hand.svg
          └── ... (one per region)
```

#### 11.2 Region Path Requirements
- Each clickable region should be a `<path>` or `<g>` element
- Must have unique `id` attribute matching `regionId` in data model
- Should have `data-region-name` attribute for display name
- Should have `data-hs-priority="true"` for HS-prone areas
- Paths should be optimized (simplified) but smooth

#### 11.3 Coordinate System
- Lesion coordinates stored as percentages (0-100) relative to region bounding box
- This allows lesions to scale correctly across device sizes
- When placing: `x = (tapX - regionLeft) / regionWidth * 100`

#### 11.4 State Management

```typescript
interface BodyMapState {
  // View State
  view: 'front' | 'back';
  mode: 'overview' | 'zoomed';
  selectedRegionId: string | null;
  
  // ═══════════════════════════════════════════════════════════
  // PERSISTENT DATA (synced to storage)
  // ═══════════════════════════════════════════════════════════
  
  // All lesions (including healed for history)
  lesions: HSLesion[];
  
  // Observations keyed by lesionId for quick lookup
  observations: Record<string, LesionObservation[]>;
  
  // Daily entries keyed by date string (YYYY-MM-DD)
  dailyEntries: Record<string, DailyHSEntry>;
  
  // Prodromal markers (pre-lesion warnings)
  prodromalMarkers: ProdromalMarker[];
  
  // Hurley stages per region
  regionHurleyStages: Record<string, RegionHurleyStatus>;
  
  // ═══════════════════════════════════════════════════════════
  // COMPUTED (derived from persistent data)
  // ═══════════════════════════════════════════════════════════
  
  // Active lesions only (status = 'active' | 'healing')
  activeLesions: HSLesion[];
  
  // Today's calculated IHS4
  currentIHS4: {
    score: number;
    severity: 'mild' | 'moderate' | 'severe';
    breakdown: { nodules: number; abscesses: number; drainingTunnels: number };
  };
  
  // Lesions grouped by region for map display
  lesionsByRegion: Record<string, HSLesion[]>;
  
  // ═══════════════════════════════════════════════════════════
  // UI STATE (not persisted)
  // ═══════════════════════════════════════════════════════════
  
  editingLesionId: string | null;
  pendingLesionPosition: { x: number; y: number } | null;
  showQuickEntryMode: boolean;
  selectedDate: string;                // For viewing historical data
}
```

**State Update Patterns:**

```typescript
// When user adds a new lesion
function addLesion(state: BodyMapState, newLesion: HSLesion, observation: LesionObservation) {
  // 1. Add to lesions array
  state.lesions.push(newLesion);
  
  // 2. Add observation
  state.observations[newLesion.id] = [observation];
  
  // 3. Recalculate active lesions
  state.activeLesions = state.lesions.filter(l => 
    ['active', 'healing'].includes(l.status)
  );
  
  // 4. Recalculate IHS4
  state.currentIHS4 = calculateIHS4ForDate(state.lesions, state.selectedDate);
  
  // 5. Update today's entry
  const today = state.selectedDate;
  state.dailyEntries[today] = {
    ...state.dailyEntries[today],
    ihs4: state.currentIHS4
  };
  
  // 6. Rebuild region grouping
  state.lesionsByRegion = groupLesionsByRegion(state.activeLesions);
}
```

#### 11.5 IHS4 Calculation

See Section 2.8 for the complete `calculateIHS4ForDate()` implementation.

#### 11.6 Performance Considerations
- Lazy-load detailed region SVGs (only load when zooming)
- Use CSS transforms for zoom animation (GPU accelerated)
- Debounce IHS4 recalculation during rapid edits
- Virtualize lesion list if >20 lesions in a region
- Cache region SVGs after first load

---

### 12. Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| User taps between regions | Ignore tap, no region selected |
| User places lesion and navigates away before saving | Prompt to save or discard |
| User converts prodromal marker to lesion | Update marker type, preserve location |
| Region has >20 lesions | Show "zoom to see all" and cluster markers |
| User on very small screen (<320px) | Ensure minimum usable zoom level |
| SVG fails to load | Show error state with retry button |
| Data sync conflict | Keep most recent, flag for user review |
| Lesion heals, then recurs in same location | Create new lesion, link to history |
| User reports lesion in non-HS area | Allow but note it's atypical location |

---

### 13. Future Enhancements (Out of Scope for V1)

- **Photo Comparison**: Side-by-side comparison of lesion photos over time
- **AI Pattern Detection**: Identify trigger correlations, predict flares
- **3D Body Model**: Optional WebGL-based 3D rotating model
- **Ultrasound Integration**: Import ultrasound images for tunnel mapping
- **Provider Portal**: Direct data sharing with dermatologist's system
- **Clinical Trial Features**: Export in formats suitable for research studies
- **Community Benchmarking**: Anonymous comparison with others (opt-in)
- **Apple Health / Google Fit Integration**: Correlate with activity, sleep data
- **Medication Reminders**: Tie to lesion tracking for treatment adherence

---

## Acceptance Criteria

### Must Have (P0)
- [ ] Body map with front/back views and 50+ regions
- [ ] HS-priority regions (axillae, groin, inframammary, buttocks, perianal) with higher detail
- [ ] Three lesion types: nodule, abscess, draining tunnel
- [ ] Automatic IHS4 score calculation and display
- [ ] Tap region to zoom in with smooth animation
- [ ] Place lesions at precise coordinates in zoomed view
- [ ] Pain level (0-10) capture per lesion
- [ ] Drainage assessment for abscesses/tunnels
- [ ] Visual indicators on overview showing lesion distribution
- [ ] Edit and delete existing lesions
- [ ] Data persists in local storage
- [ ] Basic accessibility (touch targets, labels, keyboard navigation)

### Should Have (P1)
- [ ] Hurley stage tracking per region
- [ ] Full HSSD-aligned symptom capture (tenderness, swelling, heat, itch, odor)
- [ ] Prodromal symptom tracking
- [ ] Quick daily check-in mode
- [ ] IHS4 score history and trend chart
- [ ] Lesion color-coding by type
- [ ] Quick entry mode for flare-friendly input
- [ ] Export summary report (PDF)

### Nice to Have (P2)
- [ ] Quality of life impact tracking (HiSQOL-inspired)
- [ ] Trigger tracking and correlation suggestions
- [ ] Treatment logging
- [ ] Photo attachment to lesions
- [ ] Guided Hurley stage assessment wizard
- [ ] Adjacent region navigation when zoomed
- [ ] Calendar view of flare days
- [ ] CSV export for data portability

---

## Resolved Questions

Based on research into HS clinical requirements:

1. **Gender/Body Type Options**: Start with gender-neutral. Breast/inframammary regions should be present for all body types as HS can occur there regardless of gender presentation.

2. **Region Granularity**: 58 regions with extra granularity in HS-prone areas (axillae, groin, inframammary, buttocks/perianal) is appropriate. These areas need subdivision due to complex skin fold anatomy.

3. **Lesion Limit**: No hard limit per region—HS can produce many lesions in severe cases. Implement UI clustering when >10 lesions to maintain usability.

4. **Lesion Types**: Use the IHS4 classification (nodule, abscess, draining tunnel) as primary types, plus prodromal markers. This directly maps to clinical severity scoring.

5. **History Visualization**: Show only current day's lesions by default, with option to overlay historical lesions (dimmed/outlined) for pattern recognition.

---

## Appendix A: Lesion Type Visual Guide

For user education, include illustrations showing:

| Type | Visual | Description |
|------|--------|-------------|
| **Nodule** | [illustration] | Firm bump under skin; painful; not open; may feel like a pea to marble |
| **Abscess** | [illustration] | Swollen, pus-filled; very painful; may feel "squishy"; red/inflamed |
| **Draining Tunnel** | [illustration] | Open area with persistent drainage; may have multiple openings; often connects lesions |
| **Prodromal** | [illustration] | No visible lesion yet; area feels warm, itchy, or "off"; warning sign of coming lesion |

---

## Appendix B: HS-Specific Body Regions Reference

Common HS locations by frequency (based on clinical literature):

| Location | Prevalence | Priority |
|----------|------------|----------|
| Axillae (armpits) | 70-90% | ★★★ |
| Groin/Inguinal | 50-80% | ★★★ |
| Perianal/Perineal | 15-30% | ★★★ |
| Inframammary | 15-30% (higher in women) | ★★★ |
| Buttocks/Gluteal | 20-40% | ★★★ |
| Inner thighs | 20-30% | ★★☆ |
| Waist/Belt line | 10-20% | ★★☆ |
| Pubic area | 10-20% | ★★☆ |
| Nape of neck | 5-15% | ★☆☆ |
| Other (rare) | <5% | ★☆☆ |

---

## Appendix C: Color Palette for Lesion Indicators

Using a colorblind-safe palette with distinct shapes:

| Lesion Type | Primary Color | Shape | Icon |
|-------------|---------------|-------|------|
| Nodule | #E69F00 (Orange) | Solid Circle | ● |
| Abscess | #CC79A7 (Pink/Magenta) | Circle with dot | ⊙ |
| Draining Tunnel | #882255 (Purple) | Circle with tail | ◉→ |
| Prodromal | #44AA99 (Teal) | Dashed circle | ◌ |
| Healing | #999999 (Gray) | Faded version | ○ |
| Scarred | #666666 (Dark Gray) | X mark | ✕ |

---

## Appendix D: IHS4 Score Reference Card

```
IHS4 = (Nodules × 1) + (Abscesses × 2) + (Tunnels × 4)

┌─────────────────────────────────────────────────┐
│  Score     Severity    Typical Presentation     │
├─────────────────────────────────────────────────┤
│  ≤3        MILD        Few nodules, no tunnels  │
│  4-10      MODERATE    Multiple lesions, some   │
│                        drainage                  │
│  ≥11       SEVERE      Many lesions, tunnels,   │
│                        significant drainage      │
└─────────────────────────────────────────────────┘

Examples:
- 3 nodules only = 3 (Mild)
- 2 nodules + 1 abscess = 4 (Moderate)  
- 1 nodule + 2 tunnels = 9 (Moderate)
- 1 abscess + 3 tunnels = 14 (Severe)
```

---

## Appendix E: Glossary

| Term | Definition |
|------|------------|
| **IHS4** | International Hidradenitis Suppurativa Severity Score System - validated tool for dynamic severity assessment |
| **Hurley Staging** | 3-stage classification system (I, II, III) based on sinus tract and scarring presence |
| **Nodule** | Firm, deep-seated inflammatory lump under the skin |
| **Abscess** | Collection of pus; often painful and may drain |
| **Draining Tunnel** | Sinus tract or fistula; channel under skin connecting lesions or to surface |
| **Prodromal** | Early warning symptoms before a lesion becomes visible |
| **Nociceptive Pain** | Pain from tissue damage (aching, throbbing) |
| **Neuropathic Pain** | Pain from nerve involvement (burning, shooting) |
| **HSSD** | Hidradenitis Suppurativa Symptom Diary - patient-reported symptom assessment |
| **HiSQOL** | Hidradenitis Suppurativa Quality of Life questionnaire |
| **Flare** | Period of increased disease activity with new or worsening lesions |
