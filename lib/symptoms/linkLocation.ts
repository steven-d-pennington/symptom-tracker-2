import { db, BodyMapLocation, SymptomInstance } from '../db'
import { generateGUID, getCurrentTimestamp } from '../utils'

/**
 * Create a body map location for a symptom instance
 */
export async function createSymptomLocation(data: {
  symptomId: string
  bodyRegion: string
  coordinateX: number
  coordinateY: number
  severity: number
  notes?: string
  timestamp?: number
}): Promise<BodyMapLocation> {
  const now = getCurrentTimestamp()
  const timestamp = data.timestamp || now

  // Validate coordinates
  if (
    data.coordinateX < 0 ||
    data.coordinateX > 1 ||
    data.coordinateY < 0 ||
    data.coordinateY > 1
  ) {
    throw new Error('Coordinates must be between 0 and 1')
  }

  // Validate severity
  if (data.severity < 1 || data.severity > 10) {
    throw new Error('Severity must be between 1 and 10')
  }

  const location: BodyMapLocation = {
    guid: generateGUID(),
    symptomId: data.symptomId,
    bodyRegion: data.bodyRegion,
    coordinateX: data.coordinateX,
    coordinateY: data.coordinateY,
    severity: data.severity,
    notes: data.notes,
    timestamp: timestamp,
    createdAt: now,
  }

  await db.bodyMapLocations.add(location)
  console.log('Body map location created:', location.guid)
  return location
}

/**
 * Get all body map locations for symptoms
 */
export async function getSymptomLocations(): Promise<BodyMapLocation[]> {
  return await db.bodyMapLocations
    .orderBy('timestamp')
    .reverse()
    .toArray()
}

/**
 * Get body map locations for a specific symptom
 */
export async function getLocationsBySymptomId(symptomId: string): Promise<BodyMapLocation[]> {
  return await db.bodyMapLocations
    .where('symptomId')
    .equals(symptomId)
    .reverse()
    .sortBy('timestamp')
}

/**
 * Get body map locations in a date range
 */
export async function getLocationsInRange(
  startDate: number,
  endDate: number
): Promise<BodyMapLocation[]> {
  return await db.bodyMapLocations
    .where('timestamp')
    .between(startDate, endDate, true, true)
    .toArray()
}

/**
 * Get body map locations for a specific body region
 */
export async function getLocationsByRegion(bodyRegion: string): Promise<BodyMapLocation[]> {
  return await db.bodyMapLocations
    .where('bodyRegion')
    .equals(bodyRegion)
    .reverse()
    .sortBy('timestamp')
}

/**
 * Get aggregated location data for heat map visualization
 */
export async function getLocationHeatmapData(): Promise<
  Array<{ bodyRegion: string; count: number; avgSeverity: number }>
> {
  const locations = await db.bodyMapLocations.toArray()

  const regionMap = new Map<string, { count: number; totalSeverity: number }>()

  locations.forEach((loc) => {
    const existing = regionMap.get(loc.bodyRegion)
    if (existing) {
      existing.count += 1
      existing.totalSeverity += loc.severity
    } else {
      regionMap.set(loc.bodyRegion, { count: 1, totalSeverity: loc.severity })
    }
  })

  return Array.from(regionMap.entries())
    .map(([bodyRegion, data]) => ({
      bodyRegion,
      count: data.count,
      avgSeverity: data.totalSeverity / data.count,
    }))
    .sort((a, b) => b.count - a.count)
}
