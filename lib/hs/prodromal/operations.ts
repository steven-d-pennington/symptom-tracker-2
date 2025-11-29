/**
 * Prodromal Marker CRUD Operations
 *
 * Prodromal markers track warning symptoms before visible lesions appear.
 * They can be converted to full lesions or resolved without lesion development.
 */

import { db } from '@/lib/db'
import { generateGUID, getCurrentTimestamp, formatDateISO } from '@/lib/utils'
import type { ProdromalMarker, ProdromalSymptoms, HSLesion, LesionType } from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateProdromalMarkerInput {
  regionId: string
  coordinates: { x: number; y: number }
  symptoms: ProdromalSymptoms
}

/**
 * Creates a new prodromal marker
 */
export async function createProdromalMarker(
  input: CreateProdromalMarkerInput
): Promise<ProdromalMarker> {
  const now = getCurrentTimestamp()
  const today = formatDateISO(new Date())

  const marker: ProdromalMarker = {
    guid: generateGUID(),
    regionId: input.regionId,
    coordinates: input.coordinates,
    date: today,
    symptoms: input.symptoms,
    createdAt: now,
  }

  await db.prodromalMarkers.add(marker)
  return marker
}

// ═══════════════════════════════════════════════════════════════════════════════
// READ OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Gets all active (unconverted, unresolved) prodromal markers
 */
export async function getActiveProdromalMarkers(): Promise<ProdromalMarker[]> {
  return db.prodromalMarkers
    .filter(
      (marker) =>
        !marker.convertedToLesionId && !marker.resolvedWithoutLesion
    )
    .toArray()
}

/**
 * Gets all prodromal markers (including converted/resolved)
 */
export async function getAllProdromalMarkers(): Promise<ProdromalMarker[]> {
  return db.prodromalMarkers.toArray()
}

/**
 * Gets a prodromal marker by ID
 */
export async function getProdromalMarker(
  guid: string
): Promise<ProdromalMarker | undefined> {
  return db.prodromalMarkers.where('guid').equals(guid).first()
}

/**
 * Gets prodromal markers for a specific region
 */
export async function getProdromalMarkersForRegion(
  regionId: string
): Promise<ProdromalMarker[]> {
  return db.prodromalMarkers.where('regionId').equals(regionId).toArray()
}

/**
 * Gets active prodromal markers for a specific region
 */
export async function getActiveProdromalMarkersForRegion(
  regionId: string
): Promise<ProdromalMarker[]> {
  return db.prodromalMarkers
    .where('regionId')
    .equals(regionId)
    .filter(
      (marker) =>
        !marker.convertedToLesionId && !marker.resolvedWithoutLesion
    )
    .toArray()
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface UpdateProdromalMarkerInput {
  symptoms?: ProdromalSymptoms
}

/**
 * Updates a prodromal marker's symptoms
 */
export async function updateProdromalMarker(
  guid: string,
  input: UpdateProdromalMarkerInput
): Promise<ProdromalMarker | null> {
  const existing = await getProdromalMarker(guid)
  if (!existing) return null

  const updated: ProdromalMarker = {
    ...existing,
    symptoms: input.symptoms ?? existing.symptoms,
  }

  await db.prodromalMarkers.update(existing.id!, updated)
  return updated
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSION OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConvertToLesionInput {
  lesionType: LesionType
}

/**
 * Converts a prodromal marker to a full lesion
 * Links the marker to the new lesion and preserves history
 */
export async function convertProdromalToLesion(
  markerGuid: string,
  input: ConvertToLesionInput
): Promise<{ marker: ProdromalMarker; lesion: HSLesion } | null> {
  const marker = await getProdromalMarker(markerGuid)
  if (!marker) return null

  // Already converted or resolved
  if (marker.convertedToLesionId || marker.resolvedWithoutLesion) {
    return null
  }

  const now = getCurrentTimestamp()
  const today = formatDateISO(new Date())
  const lesionGuid = generateGUID()

  // Create the new lesion
  const lesion: HSLesion = {
    guid: lesionGuid,
    regionId: marker.regionId,
    coordinates: marker.coordinates,
    lesionType: input.lesionType,
    status: 'active',
    onsetDate: today, // Lesion onset is today (when it became visible)
    createdAt: now,
    updatedAt: now,
  }

  // Update the marker with conversion info
  const updatedMarker: ProdromalMarker = {
    ...marker,
    convertedToLesionId: lesionGuid,
    conversionDate: today,
  }

  // Perform both operations
  await Promise.all([
    db.hsLesions.add(lesion),
    db.prodromalMarkers.update(marker.id!, updatedMarker),
  ])

  return { marker: updatedMarker, lesion }
}

/**
 * Marks a prodromal marker as resolved without becoming a lesion
 */
export async function resolveProdromalMarker(
  markerGuid: string
): Promise<ProdromalMarker | null> {
  const marker = await getProdromalMarker(markerGuid)
  if (!marker) return null

  // Already converted or resolved
  if (marker.convertedToLesionId || marker.resolvedWithoutLesion) {
    return null
  }

  const today = formatDateISO(new Date())

  const updatedMarker: ProdromalMarker = {
    ...marker,
    resolvedWithoutLesion: true,
    resolvedDate: today,
  }

  await db.prodromalMarkers.update(marker.id!, updatedMarker)
  return updatedMarker
}

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Deletes a prodromal marker (use with caution - prefer resolve)
 */
export async function deleteProdromalMarker(guid: string): Promise<boolean> {
  const marker = await getProdromalMarker(guid)
  if (!marker) return false

  await db.prodromalMarkers.delete(marker.id!)
  return true
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ProdromalConversionStats {
  totalMarkers: number
  converted: number
  resolved: number
  active: number
  conversionRate: number
  averageDaysToConversion: number | null
  mostCommonSymptoms: Array<{ symptom: string; count: number }>
}

/**
 * Gets statistics about prodromal marker conversions
 */
export async function getProdromalConversionStats(): Promise<ProdromalConversionStats> {
  const allMarkers = await getAllProdromalMarkers()

  const converted = allMarkers.filter((m) => m.convertedToLesionId)
  const resolved = allMarkers.filter((m) => m.resolvedWithoutLesion)
  const active = allMarkers.filter(
    (m) => !m.convertedToLesionId && !m.resolvedWithoutLesion
  )

  // Calculate conversion rate
  const totalCompleted = converted.length + resolved.length
  const conversionRate =
    totalCompleted > 0 ? (converted.length / totalCompleted) * 100 : 0

  // Calculate average days to conversion
  let averageDaysToConversion: number | null = null
  if (converted.length > 0) {
    const daysArray = converted
      .filter((m) => m.conversionDate)
      .map((m) => {
        const start = new Date(m.date)
        const end = new Date(m.conversionDate!)
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      })

    if (daysArray.length > 0) {
      averageDaysToConversion =
        daysArray.reduce((a, b) => a + b, 0) / daysArray.length
    }
  }

  // Count symptoms
  const symptomCounts: Record<string, number> = {
    burning: 0,
    stinging: 0,
    itching: 0,
    warmth: 0,
    hyperhidrosis: 0,
    tightness: 0,
    somethingFeelsOff: 0,
  }

  for (const marker of allMarkers) {
    if (marker.symptoms.burning) symptomCounts.burning++
    if (marker.symptoms.stinging) symptomCounts.stinging++
    if (marker.symptoms.itching) symptomCounts.itching++
    if (marker.symptoms.warmth) symptomCounts.warmth++
    if (marker.symptoms.hyperhidrosis) symptomCounts.hyperhidrosis++
    if (marker.symptoms.tightness) symptomCounts.tightness++
    if (marker.symptoms.somethingFeelsOff) symptomCounts.somethingFeelsOff++
  }

  const mostCommonSymptoms = Object.entries(symptomCounts)
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count)

  return {
    totalMarkers: allMarkers.length,
    converted: converted.length,
    resolved: resolved.length,
    active: active.length,
    conversionRate: Math.round(conversionRate * 10) / 10,
    averageDaysToConversion:
      averageDaysToConversion !== null
        ? Math.round(averageDaysToConversion * 10) / 10
        : null,
    mostCommonSymptoms,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISPLAY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export const PRODROMAL_SYMPTOM_LABELS: Record<keyof ProdromalSymptoms, string> = {
  burning: 'Burning sensation',
  stinging: 'Stinging',
  itching: 'Itching',
  warmth: 'Warmth',
  hyperhidrosis: 'Excess sweating',
  tightness: 'Tightness',
  somethingFeelsOff: '"Something feels off"',
}

/**
 * Gets display labels for active symptoms
 */
export function getActiveSymptomLabels(symptoms: ProdromalSymptoms): string[] {
  const labels: string[] = []

  for (const [key, value] of Object.entries(symptoms)) {
    if (value && key in PRODROMAL_SYMPTOM_LABELS) {
      labels.push(PRODROMAL_SYMPTOM_LABELS[key as keyof ProdromalSymptoms])
    }
  }

  return labels
}

/**
 * Checks if any symptoms are selected
 */
export function hasAnySymptoms(symptoms: ProdromalSymptoms): boolean {
  return Object.values(symptoms).some((v) => v === true)
}

/**
 * Creates empty symptoms object
 */
export function createEmptySymptoms(): ProdromalSymptoms {
  return {
    burning: false,
    stinging: false,
    itching: false,
    warmth: false,
    hyperhidrosis: false,
    tightness: false,
    somethingFeelsOff: false,
  }
}
