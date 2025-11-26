import Dexie, { Table } from 'dexie'
import type {
  HSLesion,
  LesionObservation,
  DailyHSEntry,
  ProdromalMarker,
  RegionHurleyStatus,
} from './hs/types'

// Domain Entities

export interface User {
  id?: number
  guid: string
  name?: string
  theme: 'light' | 'dark' | 'system'
  notificationSettings: Record<string, unknown>
  privacySettings: Record<string, unknown>
  onboardingCompleted?: boolean
  onboardingCompletedAt?: number
  createdAt: number
  updatedAt: number
}

export interface Symptom {
  id?: number
  guid: string
  name: string
  category: string
  description?: string
  severityScale: { min: number; max: number; labels?: Record<number, string> }
  isActive: boolean
  isDefault: boolean
  createdAt: number
  updatedAt: number
}

export interface SymptomInstance {
  id?: number
  guid: string
  symptomId: string
  timestamp: number
  timezoneOffset: number
  severity: number
  bodyRegion?: string
  coordinateX?: number
  coordinateY?: number
  durationMinutes?: number
  associatedTriggers?: string[]
  notes?: string
  photoIds?: string[]
  createdAt: number
}

export interface Medication {
  id?: number
  guid: string
  name: string
  dosage: string
  frequency: string
  schedule: { times: string[]; days?: number[] }
  sideEffects?: string[]
  isActive: boolean
  isDefault: boolean
  createdAt: number
  updatedAt: number
}

export interface MedicationEvent {
  id?: number
  guid: string
  medicationId: string
  timestamp: number
  timezoneOffset: number
  taken: boolean
  dosageOverride?: string
  notes?: string
  timingWarning?: 'early' | 'late' | 'on-time'
  createdAt: number
}

export interface Trigger {
  id?: number
  guid: string
  name: string
  category: 'environmental' | 'lifestyle' | 'dietary'
  description?: string
  isActive: boolean
  isDefault: boolean
  createdAt: number
  updatedAt: number
}

export interface TriggerEvent {
  id?: number
  guid: string
  triggerId: string
  timestamp: number
  timezoneOffset: number
  intensity: 'low' | 'medium' | 'high'
  notes?: string
  createdAt: number
}

export interface Food {
  id?: number
  guid: string
  name: string
  category: string
  allergenTags: string[]
  preparationMethod?: 'raw' | 'cooked' | 'fried' | 'baked'
  isActive: boolean
  isDefault: boolean
  createdAt: number
  updatedAt: number
}

export interface FoodEvent {
  id?: number
  guid: string
  mealId: string
  foodIds: string[]
  timestamp: number
  timezoneOffset: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  portionSizes: Record<string, 'small' | 'medium' | 'large'>
  notes?: string
  photoIds?: string[]
  createdAt: number
}

export interface FoodCombinationCorrelation {
  id?: number
  guid: string
  foodIds: string[]
  symptomId: string
  correlationScore: number
  individualMaxCorrelation: number
  isSynergistic: boolean
  pValue: number
  confidenceLevel: 'high' | 'medium' | 'low'
  consistencyScore: number
  sampleSize: number
  lastAnalyzedAt: number
}

export interface Flare {
  id?: number
  guid: string
  startDate: number
  endDate?: number
  status: 'active' | 'improving' | 'worsening' | 'resolved'
  bodyRegion: string
  coordinateX: number
  coordinateY: number
  initialSeverity: number
  currentSeverity: number
  createdAt: number
  updatedAt: number
}

export interface FlareEvent {
  id?: number
  guid: string
  flareId: string
  eventType: 'created' | 'severity_update' | 'trend_change' | 'intervention' | 'resolved'
  timestamp: number
  timezoneOffset: number
  severity?: number
  trend?: 'improving' | 'stable' | 'worsening'
  notes?: string
  interventionType?: 'ice' | 'heat' | 'medication' | 'rest' | 'drainage' | 'other'
  interventionDetails?: string
  resolutionDate?: number
  resolutionNotes?: string
  createdAt: number
}

export interface FlareBodyLocation {
  id?: number
  guid: string
  flareId: string
  bodyRegion: string
  coordinateX: number
  coordinateY: number
  createdAt: number
  updatedAt: number
}

export interface DailyEntry {
  id?: number
  guid: string
  date: string // YYYY-MM-DD
  overallHealthScore: number
  energyLevel: number
  sleepQuality: number
  stressLevel: number
  mood?: 'happy' | 'neutral' | 'sad' | 'anxious' | 'stressed'
  symptomIds: string[]
  medicationIds: string[]
  triggerIds: string[]
  notes?: string
  weatherData?: Record<string, unknown>
  location?: string
  durationMs?: number
  completedAt: number
  createdAt: number
  updatedAt: number
}

export interface BodyMapLocation {
  id?: number
  guid: string
  dailyEntryId?: string
  symptomId: string
  bodyRegion: string
  coordinateX: number
  coordinateY: number
  severity: number
  notes?: string
  timestamp: number
  createdAt: number
}

export interface PhotoAttachment {
  id?: number
  guid: string
  dailyEntryId?: string
  symptomId?: string
  bodyRegion?: string
  fileName: string
  originalFileName: string
  mimeType: string
  sizeBytes: number
  width: number
  height: number
  encryptedData: ArrayBuffer
  thumbnailData?: ArrayBuffer
  encryptionIV: string
  thumbnailIV?: string
  encryptionKey: string
  captureTimestamp: number
  tags: string[]
  notes?: string
  annotations?: string // Encrypted JSON string
  createdAt: number
}

export interface PhotoComparison {
  id?: number
  guid: string
  beforePhotoId: string
  afterPhotoId: string
  title: string
  notes?: string
  createdAt: number
}

export interface UXEvent {
  id?: number
  guid: string
  eventType: string
  metadata: Record<string, unknown>
  timestamp: number
}

// Database class
export class SymptomTrackerDB extends Dexie {
  users!: Table<User>
  symptoms!: Table<Symptom>
  symptomInstances!: Table<SymptomInstance>
  medications!: Table<Medication>
  medicationEvents!: Table<MedicationEvent>
  triggers!: Table<Trigger>
  triggerEvents!: Table<TriggerEvent>
  foods!: Table<Food>
  foodEvents!: Table<FoodEvent>
  foodCombinationCorrelations!: Table<FoodCombinationCorrelation>
  flares!: Table<Flare>
  flareEvents!: Table<FlareEvent>
  flareBodyLocations!: Table<FlareBodyLocation>
  dailyEntries!: Table<DailyEntry>
  bodyMapLocations!: Table<BodyMapLocation>
  photoAttachments!: Table<PhotoAttachment>
  photoComparisons!: Table<PhotoComparison>
  uxEvents!: Table<UXEvent>

  // HS-specific tables
  hsLesions!: Table<HSLesion>
  lesionObservations!: Table<LesionObservation>
  dailyHSEntries!: Table<DailyHSEntry>
  prodromalMarkers!: Table<ProdromalMarker>
  regionHurleyStatuses!: Table<RegionHurleyStatus>

  constructor() {
    super('SymptomTrackerDB')

    // Version 1: Original schema
    this.version(1).stores({
      users: '++id, guid, createdAt',
      symptoms: '++id, guid, name, category, isActive, isDefault',
      symptomInstances: '++id, guid, symptomId, timestamp, severity',
      medications: '++id, guid, name, isActive, isDefault',
      medicationEvents: '++id, guid, medicationId, timestamp, taken',
      triggers: '++id, guid, name, category, isActive, isDefault',
      triggerEvents: '++id, guid, triggerId, timestamp',
      foods: '++id, guid, name, category, isActive, isDefault',
      foodEvents: '++id, guid, mealId, timestamp, mealType',
      foodCombinationCorrelations: '++id, guid, symptomId, lastAnalyzedAt',
      flares: '++id, guid, status, startDate, endDate, bodyRegion',
      flareEvents: '++id, guid, flareId, timestamp, eventType',
      flareBodyLocations: '++id, guid, flareId, bodyRegion',
      dailyEntries: '++id, guid, date, completedAt',
      bodyMapLocations: '++id, guid, dailyEntryId, symptomId, bodyRegion, timestamp',
      photoAttachments: '++id, guid, dailyEntryId, symptomId, bodyRegion, captureTimestamp',
      photoComparisons: '++id, guid, beforePhotoId, afterPhotoId',
      uxEvents: '++id, guid, eventType, timestamp',
    })

    // Version 2: HS-specific tables for enhanced body map
    this.version(2).stores({
      users: '++id, guid, createdAt',
      symptoms: '++id, guid, name, category, isActive, isDefault',
      symptomInstances: '++id, guid, symptomId, timestamp, severity',
      medications: '++id, guid, name, isActive, isDefault',
      medicationEvents: '++id, guid, medicationId, timestamp, taken',
      triggers: '++id, guid, name, category, isActive, isDefault',
      triggerEvents: '++id, guid, triggerId, timestamp',
      foods: '++id, guid, name, category, isActive, isDefault',
      foodEvents: '++id, guid, mealId, timestamp, mealType',
      foodCombinationCorrelations: '++id, guid, symptomId, lastAnalyzedAt',
      flares: '++id, guid, status, startDate, endDate, bodyRegion',
      flareEvents: '++id, guid, flareId, timestamp, eventType',
      flareBodyLocations: '++id, guid, flareId, bodyRegion',
      dailyEntries: '++id, guid, date, completedAt',
      bodyMapLocations: '++id, guid, dailyEntryId, symptomId, bodyRegion, timestamp',
      photoAttachments: '++id, guid, dailyEntryId, symptomId, bodyRegion, captureTimestamp',
      photoComparisons: '++id, guid, beforePhotoId, afterPhotoId',
      uxEvents: '++id, guid, eventType, timestamp',
      // HS-specific tables
      hsLesions: '++id, guid, regionId, lesionType, status, onsetDate, healedDate',
      lesionObservations: '++id, guid, lesionId, entryId, date',
      dailyHSEntries: '++id, guid, date',
      prodromalMarkers: '++id, guid, regionId, date, convertedToLesionId',
      regionHurleyStatuses: '++id, guid, regionId, hurleyStage',
    })
  }
}

export const db = new SymptomTrackerDB()
