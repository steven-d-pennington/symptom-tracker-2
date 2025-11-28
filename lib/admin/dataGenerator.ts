import { db } from '@/lib/db'
import type { HSLesion, LesionType, LesionStatus } from '@/lib/hs/types'

// Use native crypto API for UUID generation
function uuidv4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Body regions for placement
const BODY_REGIONS = [
  'head', 'neck', 'left-shoulder', 'right-shoulder', 'chest', 'upper-back',
  'left-upper-arm', 'right-upper-arm', 'left-elbow', 'right-elbow',
  'left-forearm', 'right-forearm', 'left-wrist', 'right-wrist',
  'left-hand', 'right-hand', 'abdomen', 'lower-back', 'left-hip', 'right-hip',
  'left-thigh', 'right-thigh', 'left-knee', 'right-knee',
  'left-shin', 'right-shin', 'left-ankle', 'right-ankle', 'left-foot', 'right-foot'
]

// Common problem areas for HS-like conditions
const PROBLEM_AREAS = [
  'left-armpit', 'right-armpit', 'groin', 'left-thigh', 'right-thigh',
  'buttocks', 'under-breast', 'abdomen', 'left-hip', 'right-hip'
]

// HS-Priority regions for lesion generation (26 total from spec)
const HS_PRIORITY_REGIONS = [
  // Axillae (4)
  'left-axilla-central', 'left-axilla-peripheral',
  'right-axilla-central', 'right-axilla-peripheral',
  // Groin (6)
  'left-groin-inguinal', 'left-inner-thigh-upper',
  'right-groin-inguinal', 'right-inner-thigh-upper',
  'mons-pubis', 'perineum',
  // Inframammary (6)
  'left-inframammary-medial', 'left-inframammary-lateral', 'left-inframammary-fold',
  'right-inframammary-medial', 'right-inframammary-lateral', 'right-inframammary-fold',
  // Buttocks (6)
  'left-buttock-upper', 'left-buttock-lower', 'left-gluteal-fold',
  'right-buttock-upper', 'right-buttock-lower', 'right-gluteal-fold',
  // Waistband (4)
  'waistband-left', 'waistband-right', 'waistband-front-center', 'waistband-back-center',
]

// HS Lesion types with their IHS4 weights
const LESION_TYPES: LesionType[] = ['nodule', 'abscess', 'draining_tunnel']
const LESION_TYPE_WEIGHTS = { nodule: 0.6, abscess: 0.3, draining_tunnel: 0.1 } // Probability weights

// Default symptoms for the condition
const DEFAULT_SYMPTOMS = [
  { name: 'Pain', category: 'physical', severityScale: { min: 1, max: 10 } },
  { name: 'Swelling', category: 'physical', severityScale: { min: 1, max: 10 } },
  { name: 'Drainage', category: 'physical', severityScale: { min: 1, max: 5 } },
  { name: 'Itching', category: 'physical', severityScale: { min: 1, max: 10 } },
  { name: 'Fatigue', category: 'systemic', severityScale: { min: 1, max: 10 } },
  { name: 'Brain Fog', category: 'systemic', severityScale: { min: 1, max: 10 } },
  { name: 'Fever', category: 'systemic', severityScale: { min: 1, max: 5 } },
  { name: 'Joint Stiffness', category: 'physical', severityScale: { min: 1, max: 10 } }
]

// Default medications
const DEFAULT_MEDICATIONS = [
  { name: 'Humira', dosage: '40mg', frequency: 'weekly', schedule: { times: ['09:00'], days: [0] } },
  { name: 'Doxycycline', dosage: '100mg', frequency: 'twice daily', schedule: { times: ['08:00', '20:00'] } },
  { name: 'Ibuprofen', dosage: '400mg', frequency: 'as needed', schedule: { times: [] } },
  { name: 'Acetaminophen', dosage: '500mg', frequency: 'as needed', schedule: { times: [] } },
  { name: 'Zinc Supplement', dosage: '50mg', frequency: 'daily', schedule: { times: ['08:00'] } }
]

// Default triggers
const DEFAULT_TRIGGERS = [
  { name: 'Stress', category: 'lifestyle' as const },
  { name: 'Heat/Sweating', category: 'environmental' as const },
  { name: 'Tight Clothing', category: 'lifestyle' as const },
  { name: 'Dairy', category: 'dietary' as const },
  { name: 'Sugar', category: 'dietary' as const },
  { name: 'Nightshades', category: 'dietary' as const },
  { name: 'Gluten', category: 'dietary' as const },
  { name: 'Poor Sleep', category: 'lifestyle' as const },
  { name: 'Humidity', category: 'environmental' as const },
  { name: 'Friction', category: 'lifestyle' as const }
]

// Default foods
const DEFAULT_FOODS = [
  { name: 'Eggs', category: 'protein', allergenTags: ['eggs'] },
  { name: 'Chicken', category: 'protein', allergenTags: [] },
  { name: 'Beef', category: 'protein', allergenTags: [] },
  { name: 'Salmon', category: 'protein', allergenTags: ['fish'] },
  { name: 'Rice', category: 'grain', allergenTags: [] },
  { name: 'Bread', category: 'grain', allergenTags: ['gluten', 'wheat'] },
  { name: 'Pasta', category: 'grain', allergenTags: ['gluten', 'wheat'] },
  { name: 'Broccoli', category: 'vegetable', allergenTags: [] },
  { name: 'Spinach', category: 'vegetable', allergenTags: [] },
  { name: 'Tomatoes', category: 'vegetable', allergenTags: ['nightshades'] },
  { name: 'Potatoes', category: 'vegetable', allergenTags: ['nightshades'] },
  { name: 'Milk', category: 'dairy', allergenTags: ['dairy', 'lactose'] },
  { name: 'Cheese', category: 'dairy', allergenTags: ['dairy', 'lactose'] },
  { name: 'Yogurt', category: 'dairy', allergenTags: ['dairy', 'lactose'] },
  { name: 'Apple', category: 'fruit', allergenTags: [] },
  { name: 'Banana', category: 'fruit', allergenTags: [] },
  { name: 'Orange', category: 'fruit', allergenTags: [] },
  { name: 'Coffee', category: 'beverage', allergenTags: [] },
  { name: 'Tea', category: 'beverage', allergenTags: [] },
  { name: 'Soda', category: 'beverage', allergenTags: [] },
  { name: 'Chocolate', category: 'snack', allergenTags: ['dairy'] },
  { name: 'Chips', category: 'snack', allergenTags: [] },
  { name: 'Ice Cream', category: 'dessert', allergenTags: ['dairy', 'lactose'] }
]

// Utility functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomChoices<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, arr.length))
}

function gaussianRandom(mean: number, stdDev: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return z0 * stdDev + mean
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// Weighted random selection for lesion types
function selectLesionType(): LesionType {
  const rand = Math.random()
  if (rand < LESION_TYPE_WEIGHTS.nodule) return 'nodule'
  if (rand < LESION_TYPE_WEIGHTS.nodule + LESION_TYPE_WEIGHTS.abscess) return 'abscess'
  return 'draining_tunnel'
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Seasonal factor (higher in summer due to heat/sweating)
function getSeasonalFactor(date: Date): number {
  const month = date.getMonth()
  // Higher flare risk in summer (June-Aug) and winter stress (Dec-Feb)
  if (month >= 5 && month <= 7) return 1.4 // Summer
  if (month >= 11 || month <= 1) return 1.2 // Winter stress
  return 1.0
}

// Weekly stress factor (higher mid-week)
function getWeeklyStressFactor(date: Date): number {
  const day = date.getDay()
  if (day === 0 || day === 6) return 0.8 // Weekend
  if (day === 2 || day === 3) return 1.3 // Tue-Wed peak
  return 1.0
}

export interface DataGenerationProgress {
  phase: string
  current: number
  total: number
  message: string
}

export interface DataGenerationOptions {
  years: number
  onProgress?: (progress: DataGenerationProgress) => void
}

export async function generateTestData(options: DataGenerationOptions): Promise<{
  success: boolean
  stats: Record<string, number>
  error?: string
}> {
  const { years, onProgress } = options
  const stats: Record<string, number> = {}

  try {
    const endDate = new Date()
    const startDate = addDays(endDate, -years * 365)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    onProgress?.({ phase: 'init', current: 0, total: 8, message: 'Initializing data generation...' })

    // Phase 1: Create default symptoms
    onProgress?.({ phase: 'symptoms', current: 1, total: 8, message: 'Creating symptoms...' })
    const symptomGuids: string[] = []
    for (const symptom of DEFAULT_SYMPTOMS) {
      const guid = uuidv4()
      symptomGuids.push(guid)
      await db.symptoms.add({
        guid,
        name: symptom.name,
        category: symptom.category,
        severityScale: symptom.severityScale,
        isActive: true,
        isDefault: true,
        createdAt: startDate.getTime(),
        updatedAt: startDate.getTime()
      })
    }
    stats.symptoms = symptomGuids.length

    // Phase 2: Create default medications
    onProgress?.({ phase: 'medications', current: 2, total: 8, message: 'Creating medications...' })
    const medicationGuids: string[] = []
    for (const med of DEFAULT_MEDICATIONS) {
      const guid = uuidv4()
      medicationGuids.push(guid)
      await db.medications.add({
        guid,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        schedule: med.schedule,
        isActive: true,
        isDefault: true,
        createdAt: startDate.getTime(),
        updatedAt: startDate.getTime()
      })
    }
    stats.medications = medicationGuids.length

    // Phase 3: Create default triggers
    onProgress?.({ phase: 'triggers', current: 3, total: 8, message: 'Creating triggers...' })
    const triggerGuids: string[] = []
    for (const trigger of DEFAULT_TRIGGERS) {
      const guid = uuidv4()
      triggerGuids.push(guid)
      await db.triggers.add({
        guid,
        name: trigger.name,
        category: trigger.category,
        isActive: true,
        isDefault: true,
        createdAt: startDate.getTime(),
        updatedAt: startDate.getTime()
      })
    }
    stats.triggers = triggerGuids.length

    // Phase 4: Create default foods
    onProgress?.({ phase: 'foods', current: 4, total: 8, message: 'Creating foods...' })
    const foodGuids: string[] = []
    for (const food of DEFAULT_FOODS) {
      const guid = uuidv4()
      foodGuids.push(guid)
      await db.foods.add({
        guid,
        name: food.name,
        category: food.category,
        allergenTags: food.allergenTags,
        isActive: true,
        isDefault: true,
        createdAt: startDate.getTime(),
        updatedAt: startDate.getTime()
      })
    }
    stats.foods = foodGuids.length

    // Phase 5: Generate daily entries and related data
    onProgress?.({ phase: 'daily', current: 5, total: 8, message: 'Generating daily entries...' })

    let dailyEntryCount = 0
    let symptomInstanceCount = 0
    let medicationEventCount = 0
    let triggerEventCount = 0
    let foodEventCount = 0
    let bodyMapLocationCount = 0

    // Track active flares
    const activeFlares: Map<string, { guid: string; region: string; startDate: number; severity: number }> = new Map()
    let flareCount = 0
    let flareEventCount = 0

    // Track active HS lesions
    interface ActiveHSLesion {
      guid: string
      regionId: string
      lesionType: LesionType
      status: LesionStatus
      startDate: number
    }
    const activeHSLesions: Map<string, ActiveHSLesion> = new Map()
    let hsLesionCount = 0

    // Process each day
    for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
      const currentDate = addDays(startDate, dayOffset)
      const timestamp = currentDate.getTime()
      const dateStr = formatDate(currentDate)

      // Update progress every 30 days
      if (dayOffset % 30 === 0) {
        onProgress?.({
          phase: 'daily',
          current: 5,
          total: 8,
          message: `Processing day ${dayOffset + 1} of ${totalDays}...`
        })
      }

      const seasonalFactor = getSeasonalFactor(currentDate)
      const weeklyFactor = getWeeklyStressFactor(currentDate)
      const combinedFactor = seasonalFactor * weeklyFactor

      // Determine if user logs today (95% chance - very active user)
      if (Math.random() > 0.95) continue

      // Generate base health metrics with some variation
      const baseHealth = gaussianRandom(6, 1.5)
      const overallHealthScore = clamp(Math.round(baseHealth - (activeFlares.size * 0.5)), 1, 10)
      const energyLevel = clamp(Math.round(gaussianRandom(6, 1.5) - (activeFlares.size * 0.3)), 1, 10)
      const sleepQuality = clamp(Math.round(gaussianRandom(7, 1.5)), 1, 10)
      const stressLevel = clamp(Math.round(gaussianRandom(4, 2) * weeklyFactor), 1, 10)

      const moods: Array<'happy' | 'neutral' | 'sad' | 'anxious' | 'stressed'> = ['happy', 'neutral', 'sad', 'anxious', 'stressed']
      const moodIndex = Math.min(4, Math.max(0, Math.floor((10 - overallHealthScore) / 2)))
      const mood = moods[moodIndex]

      // Create daily entry
      const dailyEntryGuid = uuidv4()
      const dailySymptomIds: string[] = []
      const dailyMedicationIds: string[] = []
      const dailyTriggerIds: string[] = []

      // Process active flares - update or resolve
      for (const [flareKey, flare] of activeFlares.entries()) {
        const flareDuration = (timestamp - flare.startDate) / (1000 * 60 * 60 * 24)

        // Flares typically last 3-21 days
        const resolveChance = flareDuration > 7 ? 0.15 : (flareDuration > 3 ? 0.05 : 0.02)

        if (Math.random() < resolveChance) {
          // Resolve the flare
          await db.flares.where('guid').equals(flare.guid).modify({
            endDate: timestamp,
            status: 'resolved',
            currentSeverity: 1,
            updatedAt: timestamp
          })

          await db.flareEvents.add({
            guid: uuidv4(),
            flareId: flare.guid,
            eventType: 'resolved',
            timestamp,
            timezoneOffset: new Date().getTimezoneOffset(),
            severity: 1,
            trend: 'improving',
            resolutionDate: timestamp,
            resolutionNotes: 'Flare resolved naturally',
            createdAt: timestamp
          })
          flareEventCount++

          activeFlares.delete(flareKey)
        } else {
          // Update severity with random walk
          const severityChange = gaussianRandom(0, 1)
          const newSeverity = clamp(Math.round(flare.severity + severityChange), 1, 10)
          const trend = severityChange < -0.5 ? 'improving' : (severityChange > 0.5 ? 'worsening' : 'stable')

          flare.severity = newSeverity

          // Add severity update event (30% chance)
          if (Math.random() < 0.3) {
            const status = trend === 'improving' ? 'improving' : (trend === 'worsening' ? 'worsening' : 'active')
            await db.flares.where('guid').equals(flare.guid).modify({
              currentSeverity: newSeverity,
              status,
              updatedAt: timestamp
            })

            await db.flareEvents.add({
              guid: uuidv4(),
              flareId: flare.guid,
              eventType: 'severity_update',
              timestamp,
              timezoneOffset: new Date().getTimezoneOffset(),
              severity: newSeverity,
              trend: trend as 'improving' | 'stable' | 'worsening',
              createdAt: timestamp
            })
            flareEventCount++
          }

          // Add intervention (20% chance when severity > 5)
          if (newSeverity > 5 && Math.random() < 0.2) {
            const interventions: Array<'ice' | 'heat' | 'medication' | 'rest' | 'drainage' | 'other'> =
              ['ice', 'heat', 'medication', 'rest', 'drainage']
            const intervention = randomChoice(interventions)

            await db.flareEvents.add({
              guid: uuidv4(),
              flareId: flare.guid,
              eventType: 'intervention',
              timestamp,
              timezoneOffset: new Date().getTimezoneOffset(),
              interventionType: intervention,
              interventionDetails: `Applied ${intervention} treatment`,
              createdAt: timestamp
            })
            flareEventCount++
          }
        }
      }

      // Chance of new flare (higher with combined factors)
      const newFlareChance = 0.03 * combinedFactor
      if (Math.random() < newFlareChance) {
        const region = randomChoice(PROBLEM_AREAS)
        const flareGuid = uuidv4()
        const initialSeverity = randomInt(3, 8)

        await db.flares.add({
          guid: flareGuid,
          startDate: timestamp,
          status: 'active',
          bodyRegion: region,
          coordinateX: randomFloat(0.3, 0.7),
          coordinateY: randomFloat(0.3, 0.7),
          initialSeverity,
          currentSeverity: initialSeverity,
          createdAt: timestamp,
          updatedAt: timestamp
        })
        flareCount++

        await db.flareEvents.add({
          guid: uuidv4(),
          flareId: flareGuid,
          eventType: 'created',
          timestamp,
          timezoneOffset: new Date().getTimezoneOffset(),
          severity: initialSeverity,
          notes: 'New flare detected',
          createdAt: timestamp
        })
        flareEventCount++

        activeFlares.set(`${region}-${timestamp}`, {
          guid: flareGuid,
          region,
          startDate: timestamp,
          severity: initialSeverity
        })
      }

      // ═══════════════════════════════════════════════════════════════════════════
      // HS LESION TRACKING
      // ═══════════════════════════════════════════════════════════════════════════

      // Process existing HS lesions - update status or resolve
      for (const [lesionKey, lesion] of activeHSLesions.entries()) {
        const lesionDuration = (timestamp - lesion.startDate) / (1000 * 60 * 60 * 24)

        // Lesions typically last 5-30 days depending on type
        // Tunnels last longer, nodules heal faster
        const baseResolveChance = lesion.lesionType === 'draining_tunnel' ? 0.02 :
                                  lesion.lesionType === 'abscess' ? 0.05 : 0.08
        const resolveChance = lesionDuration > 14 ? baseResolveChance * 2 :
                              lesionDuration > 7 ? baseResolveChance * 1.5 : baseResolveChance

        if (Math.random() < resolveChance) {
          // Lesion heals
          await db.hsLesions.where('guid').equals(lesion.guid).modify({
            status: 'healed' as LesionStatus,
            healedDate: formatDate(currentDate),
            updatedAt: timestamp
          })
          activeHSLesions.delete(lesionKey)
        } else if (lesion.status === 'active' && Math.random() < 0.1) {
          // 10% chance active lesion transitions to healing
          lesion.status = 'healing'
          await db.hsLesions.where('guid').equals(lesion.guid).modify({
            status: 'healing' as LesionStatus,
            updatedAt: timestamp
          })
        } else if (lesion.lesionType === 'nodule' && Math.random() < 0.03) {
          // 3% chance nodule evolves to abscess
          lesion.lesionType = 'abscess'
          await db.hsLesions.where('guid').equals(lesion.guid).modify({
            lesionType: 'abscess' as LesionType,
            typeHistory: [{
              date: formatDate(currentDate),
              fromType: 'nodule' as LesionType,
              toType: 'abscess' as LesionType
            }],
            updatedAt: timestamp
          })
        }
      }

      // Chance of new HS lesion (higher with combined stress/seasonal factors)
      // About 1-3 new lesions per month for moderate HS
      const newHSLesionChance = 0.04 * combinedFactor
      if (Math.random() < newHSLesionChance) {
        const regionId = randomChoice(HS_PRIORITY_REGIONS)
        const lesionGuid = uuidv4()
        const lesionType = selectLesionType()

        const hsLesion: HSLesion = {
          guid: lesionGuid,
          regionId,
          coordinates: {
            x: randomFloat(0.2, 0.8),
            y: randomFloat(0.2, 0.8)
          },
          lesionType,
          status: 'active',
          onsetDate: formatDate(currentDate),
          createdAt: timestamp,
          updatedAt: timestamp
        }

        await db.hsLesions.add(hsLesion)
        hsLesionCount++

        activeHSLesions.set(`${regionId}-${timestamp}`, {
          guid: lesionGuid,
          regionId,
          lesionType,
          status: 'active',
          startDate: timestamp
        })
      }

      // Generate symptom instances based on active flares and random symptoms
      const numSymptoms = activeFlares.size > 0
        ? randomInt(2, 5)
        : randomInt(0, 2)

      if (numSymptoms > 0) {
        const selectedSymptoms = randomChoices(symptomGuids, numSymptoms)

        for (const symptomGuid of selectedSymptoms) {
          const symptomData = DEFAULT_SYMPTOMS[symptomGuids.indexOf(symptomGuid)]
          const severity = clamp(
            Math.round(gaussianRandom(5, 2) * (activeFlares.size > 0 ? 1.3 : 1)),
            symptomData.severityScale.min,
            symptomData.severityScale.max
          )

          const instanceGuid = uuidv4()
          const region = activeFlares.size > 0
            ? Array.from(activeFlares.values())[0].region
            : randomChoice(BODY_REGIONS)

          await db.symptomInstances.add({
            guid: instanceGuid,
            symptomId: symptomGuid,
            timestamp: timestamp + randomInt(0, 12) * 60 * 60 * 1000,
            timezoneOffset: new Date().getTimezoneOffset(),
            severity,
            bodyRegion: region,
            coordinateX: randomFloat(0.2, 0.8),
            coordinateY: randomFloat(0.2, 0.8),
            durationMinutes: randomInt(30, 480),
            notes: Math.random() < 0.3 ? 'Logged symptom' : undefined,
            createdAt: timestamp
          })
          symptomInstanceCount++
          dailySymptomIds.push(symptomGuid)

          // Add body map location
          await db.bodyMapLocations.add({
            guid: uuidv4(),
            dailyEntryId: dailyEntryGuid,
            symptomId: symptomGuid,
            bodyRegion: region,
            coordinateX: randomFloat(0.2, 0.8),
            coordinateY: randomFloat(0.2, 0.8),
            severity,
            timestamp,
            createdAt: timestamp
          })
          bodyMapLocationCount++
        }
      }

      // Generate medication events
      const scheduledMeds = medicationGuids.filter((_, i) =>
        DEFAULT_MEDICATIONS[i].schedule.times.length > 0
      )
      const asNeededMeds = medicationGuids.filter((_, i) =>
        DEFAULT_MEDICATIONS[i].schedule.times.length === 0
      )

      // Scheduled medications (85% adherence)
      for (const medGuid of scheduledMeds) {
        const taken = Math.random() < 0.85
        const timing = taken
          ? (Math.random() < 0.7 ? 'on-time' : (Math.random() < 0.5 ? 'early' : 'late'))
          : undefined

        await db.medicationEvents.add({
          guid: uuidv4(),
          medicationId: medGuid,
          timestamp: timestamp + randomInt(6, 10) * 60 * 60 * 1000,
          timezoneOffset: new Date().getTimezoneOffset(),
          taken,
          timingWarning: timing as 'early' | 'late' | 'on-time' | undefined,
          createdAt: timestamp
        })
        medicationEventCount++
        dailyMedicationIds.push(medGuid)
      }

      // As-needed medications (more likely when flares active)
      if (activeFlares.size > 0 && Math.random() < 0.4) {
        const med = randomChoice(asNeededMeds)
        await db.medicationEvents.add({
          guid: uuidv4(),
          medicationId: med,
          timestamp: timestamp + randomInt(8, 20) * 60 * 60 * 1000,
          timezoneOffset: new Date().getTimezoneOffset(),
          taken: true,
          notes: 'Taken for flare management',
          createdAt: timestamp
        })
        medicationEventCount++
        dailyMedicationIds.push(med)
      }

      // Generate trigger events (more on high-factor days)
      const numTriggers = Math.floor(randomInt(0, 3) * combinedFactor)
      if (numTriggers > 0) {
        const selectedTriggers = randomChoices(triggerGuids, numTriggers)
        for (const triggerGuid of selectedTriggers) {
          await db.triggerEvents.add({
            guid: uuidv4(),
            triggerId: triggerGuid,
            timestamp: timestamp + randomInt(0, 18) * 60 * 60 * 1000,
            timezoneOffset: new Date().getTimezoneOffset(),
            intensity: randomChoice(['low', 'medium', 'high']),
            createdAt: timestamp
          })
          triggerEventCount++
          dailyTriggerIds.push(triggerGuid)
        }
      }

      // Generate food events (3-4 meals per day)
      const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack']
      const mealTimes = [8, 12, 18, 15]

      for (let mealIndex = 0; mealIndex < 4; mealIndex++) {
        // Skip some meals randomly
        if (mealIndex === 3 && Math.random() < 0.5) continue // 50% chance of snack
        if (Math.random() < 0.1) continue // 10% chance of skipping any meal

        const numFoods = randomInt(2, 5)
        const selectedFoods = randomChoices(foodGuids, numFoods)
        const portionSizes: Record<string, 'small' | 'medium' | 'large'> = {}

        for (const foodGuid of selectedFoods) {
          portionSizes[foodGuid] = randomChoice(['small', 'medium', 'large'])
        }

        await db.foodEvents.add({
          guid: uuidv4(),
          mealId: uuidv4(),
          foodIds: selectedFoods,
          timestamp: timestamp + mealTimes[mealIndex] * 60 * 60 * 1000,
          timezoneOffset: new Date().getTimezoneOffset(),
          mealType: mealTypes[mealIndex],
          portionSizes,
          createdAt: timestamp
        })
        foodEventCount++
      }

      // Create daily entry
      await db.dailyEntries.add({
        guid: dailyEntryGuid,
        date: dateStr,
        overallHealthScore,
        energyLevel,
        sleepQuality,
        stressLevel,
        mood,
        symptomIds: [...new Set(dailySymptomIds)],
        medicationIds: [...new Set(dailyMedicationIds)],
        triggerIds: [...new Set(dailyTriggerIds)],
        notes: Math.random() < 0.2 ? `Daily log for ${dateStr}` : undefined,
        completedAt: timestamp + 22 * 60 * 60 * 1000,
        createdAt: timestamp,
        updatedAt: timestamp
      })
      dailyEntryCount++
    }

    stats.dailyEntries = dailyEntryCount
    stats.symptomInstances = symptomInstanceCount
    stats.medicationEvents = medicationEventCount
    stats.triggerEvents = triggerEventCount
    stats.foodEvents = foodEventCount
    stats.bodyMapLocations = bodyMapLocationCount
    stats.flares = flareCount
    stats.flareEvents = flareEventCount
    stats.hsLesions = hsLesionCount

    // Phase 6: Generate food correlations
    onProgress?.({ phase: 'correlations', current: 6, total: 8, message: 'Generating food correlations...' })

    // Create some realistic correlations
    const correlationFoods = [
      { foods: ['dairy', 'lactose'], symptom: 'Pain', score: 0.65, synergistic: true },
      { foods: ['nightshades'], symptom: 'Swelling', score: 0.55, synergistic: false },
      { foods: ['gluten', 'wheat'], symptom: 'Fatigue', score: 0.45, synergistic: true },
      { foods: ['dairy'], symptom: 'Drainage', score: 0.50, synergistic: false }
    ]

    let correlationCount = 0
    for (const corr of correlationFoods) {
      const symptomIndex = DEFAULT_SYMPTOMS.findIndex(s => s.name === corr.symptom)
      if (symptomIndex === -1) continue

      const matchingFoods = foodGuids.filter((_, i) =>
        DEFAULT_FOODS[i].allergenTags.some(tag => corr.foods.includes(tag))
      )

      if (matchingFoods.length > 0) {
        await db.foodCombinationCorrelations.add({
          guid: uuidv4(),
          foodIds: matchingFoods.slice(0, 3),
          symptomId: symptomGuids[symptomIndex],
          correlationScore: corr.score,
          individualMaxCorrelation: corr.score - 0.1,
          isSynergistic: corr.synergistic,
          pValue: 0.05 - (corr.score * 0.03),
          confidenceLevel: corr.score > 0.5 ? 'high' : 'medium',
          consistencyScore: corr.score + 0.1,
          sampleSize: Math.floor(totalDays * 0.3),
          lastAnalyzedAt: endDate.getTime()
        })
        correlationCount++
      }
    }
    stats.foodCorrelations = correlationCount

    // Phase 7: Generate UX events
    onProgress?.({ phase: 'uxEvents', current: 7, total: 8, message: 'Generating UX events...' })

    let uxEventCount = 0
    const uxEventTypes = ['page_view', 'feature_used', 'error_occurred', 'settings_changed']

    for (let i = 0; i < Math.min(1000, totalDays * 2); i++) {
      const eventTimestamp = startDate.getTime() + randomInt(0, totalDays) * 24 * 60 * 60 * 1000
      await db.uxEvents.add({
        guid: uuidv4(),
        eventType: randomChoice(uxEventTypes),
        metadata: {
          screen: randomChoice(['home', 'flares', 'symptoms', 'medications', 'analytics']),
          duration: randomInt(1000, 60000)
        },
        timestamp: eventTimestamp
      })
      uxEventCount++
    }
    stats.uxEvents = uxEventCount

    // Phase 8: Complete
    onProgress?.({ phase: 'complete', current: 8, total: 8, message: 'Data generation complete!' })

    return { success: true, stats }

  } catch (error) {
    console.error('Data generation error:', error)
    return {
      success: false,
      stats,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function clearAllData(): Promise<{ success: boolean; error?: string }> {
  try {
    // Clear all tables except users
    await db.symptoms.clear()
    await db.symptomInstances.clear()
    await db.medications.clear()
    await db.medicationEvents.clear()
    await db.triggers.clear()
    await db.triggerEvents.clear()
    await db.foods.clear()
    await db.foodEvents.clear()
    await db.foodCombinationCorrelations.clear()
    await db.flares.clear()
    await db.flareEvents.clear()
    await db.flareBodyLocations.clear()
    await db.dailyEntries.clear()
    await db.bodyMapLocations.clear()
    await db.photoAttachments.clear()
    await db.photoComparisons.clear()
    await db.uxEvents.clear()
    // HS-specific tables
    await db.hsLesions.clear()

    return { success: true }
  } catch (error) {
    console.error('Clear data error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getDataStats(): Promise<Record<string, number>> {
  const stats: Record<string, number> = {}

  stats.users = await db.users.count()
  stats.symptoms = await db.symptoms.count()
  stats.symptomInstances = await db.symptomInstances.count()
  stats.medications = await db.medications.count()
  stats.medicationEvents = await db.medicationEvents.count()
  stats.triggers = await db.triggers.count()
  stats.triggerEvents = await db.triggerEvents.count()
  stats.foods = await db.foods.count()
  stats.foodEvents = await db.foodEvents.count()
  stats.foodCorrelations = await db.foodCombinationCorrelations.count()
  stats.flares = await db.flares.count()
  stats.flareEvents = await db.flareEvents.count()
  stats.flareBodyLocations = await db.flareBodyLocations.count()
  stats.dailyEntries = await db.dailyEntries.count()
  stats.bodyMapLocations = await db.bodyMapLocations.count()
  stats.photoAttachments = await db.photoAttachments.count()
  stats.photoComparisons = await db.photoComparisons.count()
  stats.uxEvents = await db.uxEvents.count()
  // HS-specific stats
  stats.hsLesions = await db.hsLesions.count()

  return stats
}
