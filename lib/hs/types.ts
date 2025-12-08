/**
 * HS (Hidradenitis Suppurativa) specific type definitions
 * Based on clinical standards: IHS4, Hurley staging, HSSD
 */

// ═══════════════════════════════════════════════════════════════════════════════
// LESION TYPES & ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export type LesionType = 'nodule' | 'abscess' | 'draining_tunnel'
export type LesionStatus = 'active' | 'healing' | 'healed' | 'scarred'
export type LesionSize = 'small' | 'medium' | 'large' // <1cm, 1-3cm, >3cm

export type DrainageAmount = 'none' | 'minimal' | 'moderate' | 'heavy'
export type DrainageType = 'clear' | 'blood-tinged' | 'purulent' | 'mixed'
export type OdorLevel = 'none' | 'mild' | 'moderate' | 'severe'

export type HurleyStage = 1 | 2 | 3
export type IHS4Severity = 'mild' | 'moderate' | 'severe'

// ═══════════════════════════════════════════════════════════════════════════════
// LESION COORDINATES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lesion coordinates supporting both 2D and 3D positioning
 */
export interface LesionCoordinates {
  // 2D coordinates (always present - primary)
  x: number                       // 0-100 percentage within 2D region
  y: number                       // 0-100 percentage within 2D region

  // 3D coordinates (optional - for 3D display)
  position3D?: {
    x: number                     // Model space X (-0.89 to 0.89)
    y: number                     // Model space Y (-0.19 to 0.18, positive = front)
    z: number                     // Model space Z (0 to 2.0, 0 = feet, 2 = head)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// IHS4 SCORING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * IHS4 Score weights per lesion type
 * IHS4 = (Nodules × 1) + (Abscesses × 2) + (Draining Tunnels × 4)
 */
export const IHS4_WEIGHTS: Record<LesionType, number> = {
  nodule: 1,
  abscess: 2,
  draining_tunnel: 4,
}

/**
 * IHS4 severity thresholds
 * ≤3: Mild, 4-10: Moderate, ≥11: Severe
 */
export const IHS4_THRESHOLDS = {
  mild: { max: 3 },
  moderate: { min: 4, max: 10 },
  severe: { min: 11 },
} as const

export interface IHS4Result {
  score: number
  severity: IHS4Severity
  breakdown: {
    nodules: number
    abscesses: number
    drainingTunnels: number
  }
  lesionIds: string[]
}

export interface IHS4HistoryPoint {
  date: string
  score: number
  severity: IHS4Severity
}

// ═══════════════════════════════════════════════════════════════════════════════
// HSLESION - Persistent Lesion Entity
// ═══════════════════════════════════════════════════════════════════════════════

export interface HSLesion {
  id?: number                     // Auto-increment (local only)
  guid: string                    // UUID - stable across lifetime

  // Location (set once when created)
  regionId: string                // e.g., 'left-axilla-central'
  coordinates: LesionCoordinates

  // Classification (may evolve - e.g., nodule → abscess)
  lesionType: LesionType

  // Lifecycle
  status: LesionStatus
  onsetDate: string               // ISO date when first appeared
  healedDate?: string             // ISO date when resolved (null if active)

  // History tracking
  typeHistory?: LesionTypeChange[]

  // Recurrence tracking
  recurrenceOf?: string           // GUID of previous lesion in same spot

  // Metadata
  createdAt: number               // Timestamp
  updatedAt: number               // Timestamp
}

export interface LesionTypeChange {
  date: string
  fromType: LesionType
  toType: LesionType
}

// ═══════════════════════════════════════════════════════════════════════════════
// LESION OBSERVATION - Daily Snapshot
// ═══════════════════════════════════════════════════════════════════════════════

export interface LesionObservation {
  id?: number
  guid: string
  lesionId: string                // → HSLesion.guid
  entryId: string                 // → DailyHSEntry.guid
  date: string                    // ISO date of observation

  // Current State
  size: LesionSize

  // Symptom Scores (0-10 scale, aligned with HSSD)
  symptoms: LesionSymptoms

  // Drainage Assessment (for abscesses and tunnels)
  drainage: DrainageAssessment

  // Pain Characterization
  painType?: PainCharacterization

  // Documentation
  photoIds?: string[]             // Photo IDs taken this observation
  notes?: string

  // Status change (if user marks lesion as healing/healed)
  statusChange?: {
    newStatus: LesionStatus
    note?: string
  }

  createdAt: number
}

export interface LesionSymptoms {
  pain: number                    // 0-10 worst pain today
  tenderness: number              // 0-10 pain when touched
  swelling: number                // 0-10
  heat: number                    // 0-10 warmth/inflammation
  itch: number                    // 0-10
  pressure: number                // 0-10 feeling of pressure
}

export interface DrainageAssessment {
  amount: DrainageAmount
  type?: DrainageType
  odor: OdorLevel
}

export interface PainCharacterization {
  nociceptive: boolean            // Aching, throbbing, gnawing
  neuropathic: boolean            // Burning, electric, shooting
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAILY HS ENTRY - Daily Summary
// ═══════════════════════════════════════════════════════════════════════════════

export interface DailyHSEntry {
  id?: number
  guid: string
  date: string                    // ISO date (unique per user)

  // IHS4 CALCULATION (auto-computed from active lesions)
  ihs4: IHS4Result

  // OVERALL SYMPTOMS (worst/average across all lesions + general)
  overallSymptoms: OverallSymptoms

  // QUALITY OF LIFE (HiSQOL-inspired)
  qualityOfLife: QualityOfLifeAssessment

  // FLARE TRACKING
  flare: FlareTracking

  // TRIGGERS & CONTEXT
  triggers?: TriggerContext

  // TREATMENTS USED TODAY
  treatments?: TreatmentRecord

  // METADATA
  notes?: string
  mood?: 1 | 2 | 3 | 4 | 5        // Quick mood rating

  createdAt: number
  updatedAt: number
}

export interface OverallSymptoms {
  worstPain: number               // 0-10, highest pain today
  averagePain: number             // 0-10, typical pain level
  overallDrainage: DrainageAmount
  odor: OdorLevel
  fatigue: number                 // 0-10, general fatigue level
}

export interface QualityOfLifeAssessment {
  // Activities affected today
  activitiesAffected: {
    mobility: boolean             // Walking, sitting, moving
    dressing: boolean             // Clothing choices
    sleep: boolean
    workOrSchool: boolean
    exercise: boolean
    intimacy: boolean
    socialActivities: boolean
  }

  // Emotional state (0=none, 4=extreme)
  emotional: {
    embarrassment: 0 | 1 | 2 | 3 | 4
    anxiety: 0 | 1 | 2 | 3 | 4
    depression: 0 | 1 | 2 | 3 | 4
    frustration: 0 | 1 | 2 | 3 | 4
  }
}

export interface FlareTracking {
  isFlareDay: boolean             // User considers this a flare
  flareId?: string                // Groups consecutive flare days
  newLesionsToday: number         // Count of lesions with onset today
}

export interface TriggerContext {
  menstruation: boolean
  stress: 'none' | 'mild' | 'moderate' | 'severe'
  poorSleep: boolean
  dietaryFactors?: string[]       // e.g., ['dairy', 'sugar']
  heatExposure: boolean
  friction: boolean               // Tight clothing, exercise
  shaving: boolean
  illness: boolean
  other?: string
}

export interface TreatmentRecord {
  warmCompress: boolean
  coolCompress: boolean
  topicalTreatments?: string[]    // e.g., ['clindamycin', 'benzoyl peroxide']
  oralMedications?: string[]      // e.g., ['doxycycline', 'ibuprofen']
  biologicInjection?: {
    medication: string            // e.g., 'adalimumab'
    injectionSite?: string
  }
  incisionDrainage: boolean       // Medical or self
  woundCare: boolean
  other?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODROMAL MARKER - Pre-Lesion Warning
// ═══════════════════════════════════════════════════════════════════════════════

export interface ProdromalMarker {
  id?: number
  guid: string
  regionId: string
  coordinates: LesionCoordinates
  date: string                    // When symptoms noticed

  symptoms: ProdromalSymptoms

  // Conversion tracking
  convertedToLesionId?: string    // If this became a lesion
  conversionDate?: string

  // If it resolved without becoming a lesion
  resolvedWithoutLesion?: boolean
  resolvedDate?: string

  createdAt: number
}

export interface ProdromalSymptoms {
  burning: boolean
  stinging: boolean
  itching: boolean
  warmth: boolean
  hyperhidrosis: boolean          // Excess sweating
  tightness: boolean
  somethingFeelsOff: boolean      // Hard to describe feeling
}

// ═══════════════════════════════════════════════════════════════════════════════
// HURLEY STAGING
// ═══════════════════════════════════════════════════════════════════════════════

export interface RegionHurleyStatus {
  id?: number
  guid: string
  regionId: string
  hurleyStage: HurleyStage | null
  hasScarring: boolean
  hasSinusTracts: boolean
  lesionsInterconnected: boolean
  lastAssessedDate: string
  notes?: string
  createdAt: number
  updatedAt: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// BODY MAP STATE
// ═══════════════════════════════════════════════════════════════════════════════

export interface BodyMapState {
  // View State
  view: 'front' | 'back'
  mode: 'overview' | 'zoomed'
  selectedRegionId: string | null

  // Persistent Data (synced to storage)
  lesions: HSLesion[]
  observations: Record<string, LesionObservation[]>
  dailyEntries: Record<string, DailyHSEntry>
  prodromalMarkers: ProdromalMarker[]
  regionHurleyStages: Record<string, RegionHurleyStatus>

  // Computed (derived from persistent data)
  activeLesions: HSLesion[]
  currentIHS4: IHS4Result
  lesionsByRegion: Record<string, HSLesion[]>

  // UI State (not persisted)
  editingLesionId: string | null
  pendingLesionPosition: { x: number; y: number } | null
  showQuickEntryMode: boolean
  selectedDate: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// LESION DISPLAY CONFIG (for UI)
// ═══════════════════════════════════════════════════════════════════════════════

export interface LesionDisplayConfig {
  type: LesionType
  name: string
  shortName: string
  icon: string                    // Emoji or icon name
  color: string                   // Hex color (colorblind-safe)
  shape: 'circle' | 'circle-dot' | 'circle-line' | 'dashed'
  ihs4Weight: number
  description: string
}

export const LESION_DISPLAY_CONFIG: Record<LesionType, LesionDisplayConfig> = {
  nodule: {
    type: 'nodule',
    name: 'Inflammatory Nodule',
    shortName: 'Nodule',
    icon: '●',
    color: '#E69F00',             // Orange (colorblind-safe)
    shape: 'circle',
    ihs4Weight: 1,
    description: 'Firm, painful bump under skin; not draining',
  },
  abscess: {
    type: 'abscess',
    name: 'Abscess',
    shortName: 'Abscess',
    icon: '⊙',
    color: '#CC79A7',             // Pink/Magenta (colorblind-safe)
    shape: 'circle-dot',
    ihs4Weight: 2,
    description: 'Pus-filled; may be fluctuant; often very painful',
  },
  draining_tunnel: {
    type: 'draining_tunnel',
    name: 'Draining Tunnel',
    shortName: 'Tunnel',
    icon: '◉→',
    color: '#882255',             // Purple (colorblind-safe)
    shape: 'circle-line',
    ihs4Weight: 4,
    description: 'Sinus tract; actively draining; may connect lesions',
  },
}

export const PRODROMAL_DISPLAY_CONFIG = {
  name: 'Prodromal Warning',
  shortName: 'Prodromal',
  icon: '◌',
  color: '#44AA99',               // Teal (colorblind-safe)
  shape: 'dashed',
  description: 'Early warning symptoms before a lesion appears',
} as const
