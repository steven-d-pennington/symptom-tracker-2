/**
 * Correlation Analysis Service
 * Implements Spearman's Rank Correlation for food-symptom analysis
 * Includes lag window testing and food combination analysis
 */

import { db, FoodEvent, SymptomInstance } from './db'

export interface CorrelationResult {
  foodIds: string[]
  symptomId: string
  correlationScore: number
  pValue: number
  confidenceLevel: 'high' | 'medium' | 'low'
  sampleSize: number
  bestLagWindow: number
  isSynergistic: boolean
  individualMaxCorrelation: number
}

// Lag windows to test (in milliseconds)
const LAG_WINDOWS = [
  15 * 60 * 1000, // 15 minutes
  30 * 60 * 1000, // 30 minutes
  1 * 60 * 60 * 1000, // 1 hour
  2 * 60 * 60 * 1000, // 2 hours
  4 * 60 * 60 * 1000, // 4 hours
  8 * 60 * 60 * 1000, // 8 hours
  12 * 60 * 60 * 1000, // 12 hours
  24 * 60 * 60 * 1000, // 24 hours
  48 * 60 * 60 * 1000, // 48 hours
  72 * 60 * 60 * 1000, // 72 hours
]

const SYNERGISTIC_THRESHOLD = 0.15
const MIN_SAMPLE_SIZE = 5

/**
 * Calculate Spearman's rank correlation coefficient
 */
function calculateSpearmanRho(pairs: Array<[number, number]>): number {
  const n = pairs.length

  if (n < 2) {
    return 0
  }

  // Rank the data
  const xRanks = rankData(pairs.map((p) => p[0]))
  const yRanks = rankData(pairs.map((p) => p[1]))

  // Calculate sum of squared differences
  let sumSquaredDiff = 0
  for (let i = 0; i < n; i++) {
    const diff = xRanks[i] - yRanks[i]
    sumSquaredDiff += diff * diff
  }

  // Calculate Spearman's rho
  const rho = 1 - (6 * sumSquaredDiff) / (n * (n * n - 1))

  return rho
}

/**
 * Rank data (handles ties by assigning average ranks)
 */
function rankData(data: number[]): number[] {
  const sorted = data
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value)

  const ranks = new Array(data.length)

  let i = 0
  while (i < sorted.length) {
    let j = i
    // Find all items with the same value (ties)
    while (j < sorted.length && sorted[j].value === sorted[i].value) {
      j++
    }

    // Calculate average rank for ties
    const avgRank = (i + j + 1) / 2

    // Assign average rank to all tied items
    for (let k = i; k < j; k++) {
      ranks[sorted[k].index] = avgRank
    }

    i = j
  }

  return ranks
}

/**
 * Calculate p-value for Spearman's correlation
 */
function calculatePValue(rho: number, n: number): number {
  if (n < 3) {
    return 1
  }

  // Calculate t-statistic
  const t = rho * Math.sqrt((n - 2) / (1 - rho * rho))

  // Approximate p-value using t-distribution
  // This is a simplified approximation
  const df = n - 2
  const p = 2 * (1 - tCDF(Math.abs(t), df))

  return p
}

/**
 * Cumulative distribution function for t-distribution (approximation)
 */
function tCDF(t: number, df: number): number {
  // This is a simplified approximation
  // For production, consider using a library like jStat
  const x = df / (df + t * t)
  const a = df / 2
  const b = 0.5

  // Incomplete beta function approximation
  return 1 - 0.5 * betaIncomplete(x, a, b)
}

/**
 * Incomplete beta function (simplified approximation)
 */
function betaIncomplete(x: number, a: number, b: number): number {
  // Very simplified approximation
  // For production, use a proper statistical library
  if (x <= 0) return 0
  if (x >= 1) return 1

  // Use a simple approximation
  return Math.pow(x, a) * Math.pow(1 - x, b)
}

/**
 * Determine confidence level based on p-value and sample size
 */
function getConfidenceLevel(
  pValue: number,
  sampleSize: number
): 'high' | 'medium' | 'low' {
  if (pValue < 0.01 && sampleSize >= 20) {
    return 'high'
  } else if (pValue < 0.05 && sampleSize >= 10) {
    return 'medium'
  } else {
    return 'low'
  }
}

/**
 * Create food-symptom pairs for a specific lag window
 */
function createPairs(
  foodEvents: FoodEvent[],
  symptomInstances: SymptomInstance[],
  foodId: string,
  lagWindow: number
): Array<[number, number]> {
  const pairs: Array<[number, number]> = []

  for (const foodEvent of foodEvents) {
    // Check if this food was in the meal
    if (!foodEvent.foodIds.includes(foodId)) {
      continue
    }

    // Get portion size (convert to numeric: small=1, medium=2, large=3)
    const portionStr = foodEvent.portionSizes[foodId] || 'medium'
    const portionValue =
      portionStr === 'small' ? 1 : portionStr === 'large' ? 3 : 2

    // Find symptoms within the lag window
    const windowStart = foodEvent.timestamp + lagWindow
    const windowEnd = windowStart + 4 * 60 * 60 * 1000 // 4-hour window

    const matchingSymptoms = symptomInstances.filter(
      (s) => s.timestamp >= windowStart && s.timestamp <= windowEnd
    )

    // Create pairs for all matching symptoms
    for (const symptom of matchingSymptoms) {
      pairs.push([portionValue, symptom.severity])
    }
  }

  return pairs
}

/**
 * Analyze correlation for a single food and symptom
 */
export async function analyzeFoodSymptomCorrelation(
  foodId: string,
  symptomId: string,
  dateRange: { start: number; end: number }
): Promise<CorrelationResult | null> {
  try {
    // Get food events and symptom instances in date range
    const foodEvents = await db.foodEvents
      .where('timestamp')
      .between(dateRange.start, dateRange.end)
      .toArray()

    const symptomInstances = await db.symptomInstances
      .where('symptomId')
      .equals(symptomId)
      .and((s) => s.timestamp >= dateRange.start && s.timestamp <= dateRange.end)
      .toArray()

    // Filter food events that contain this food
    const relevantFoodEvents = foodEvents.filter((fe) =>
      fe.foodIds.includes(foodId)
    )

    if (relevantFoodEvents.length < MIN_SAMPLE_SIZE) {
      return null
    }

    // Test different lag windows and find the best correlation
    let bestRho = 0
    let bestPValue = 1
    let bestLagWindow = 0
    let bestSampleSize = 0

    for (const lagWindow of LAG_WINDOWS) {
      const pairs = createPairs(
        relevantFoodEvents,
        symptomInstances,
        foodId,
        lagWindow
      )

      if (pairs.length < MIN_SAMPLE_SIZE) {
        continue
      }

      const rho = calculateSpearmanRho(pairs)
      const pValue = calculatePValue(rho, pairs.length)

      // Keep track of the strongest correlation
      if (Math.abs(rho) > Math.abs(bestRho) && pValue < 0.05) {
        bestRho = rho
        bestPValue = pValue
        bestLagWindow = lagWindow
        bestSampleSize = pairs.length
      }
    }

    if (bestSampleSize < MIN_SAMPLE_SIZE || bestPValue >= 0.05) {
      return null
    }

    return {
      foodIds: [foodId],
      symptomId,
      correlationScore: bestRho,
      pValue: bestPValue,
      confidenceLevel: getConfidenceLevel(bestPValue, bestSampleSize),
      sampleSize: bestSampleSize,
      bestLagWindow,
      isSynergistic: false,
      individualMaxCorrelation: bestRho,
    }
  } catch (error) {
    console.error('Error analyzing food-symptom correlation:', error)
    return null
  }
}

/**
 * Analyze correlation for food combinations
 */
export async function analyzeFoodCombinationCorrelation(
  foodIds: string[],
  symptomId: string,
  dateRange: { start: number; end: number }
): Promise<CorrelationResult | null> {
  try {
    // Get food events and symptom instances in date range
    const foodEvents = await db.foodEvents
      .where('timestamp')
      .between(dateRange.start, dateRange.end)
      .toArray()

    const symptomInstances = await db.symptomInstances
      .where('symptomId')
      .equals(symptomId)
      .and((s) => s.timestamp >= dateRange.start && s.timestamp <= dateRange.end)
      .toArray()

    // Filter food events that contain ALL foods in the combination
    const relevantFoodEvents = foodEvents.filter((fe) =>
      foodIds.every((fid) => fe.foodIds.includes(fid))
    )

    if (relevantFoodEvents.length < MIN_SAMPLE_SIZE) {
      return null
    }

    // Test different lag windows and find the best correlation
    let bestRho = 0
    let bestPValue = 1
    let bestLagWindow = 0
    let bestSampleSize = 0

    for (const lagWindow of LAG_WINDOWS) {
      const pairs: Array<[number, number]> = []

      for (const foodEvent of relevantFoodEvents) {
        // Use average portion size for combination
        const avgPortion =
          foodIds.reduce((sum, fid) => {
            const portionStr = foodEvent.portionSizes[fid] || 'medium'
            const portionValue =
              portionStr === 'small' ? 1 : portionStr === 'large' ? 3 : 2
            return sum + portionValue
          }, 0) / foodIds.length

        // Find symptoms within the lag window
        const windowStart = foodEvent.timestamp + lagWindow
        const windowEnd = windowStart + 4 * 60 * 60 * 1000

        const matchingSymptoms = symptomInstances.filter(
          (s) => s.timestamp >= windowStart && s.timestamp <= windowEnd
        )

        for (const symptom of matchingSymptoms) {
          pairs.push([avgPortion, symptom.severity])
        }
      }

      if (pairs.length < MIN_SAMPLE_SIZE) {
        continue
      }

      const rho = calculateSpearmanRho(pairs)
      const pValue = calculatePValue(rho, pairs.length)

      if (Math.abs(rho) > Math.abs(bestRho) && pValue < 0.05) {
        bestRho = rho
        bestPValue = pValue
        bestLagWindow = lagWindow
        bestSampleSize = pairs.length
      }
    }

    if (bestSampleSize < MIN_SAMPLE_SIZE || bestPValue >= 0.05) {
      return null
    }

    // Calculate individual correlations to check for synergy
    const individualCorrelations = await Promise.all(
      foodIds.map((fid) =>
        analyzeFoodSymptomCorrelation(fid, symptomId, dateRange)
      )
    )

    const maxIndividualCorrelation = Math.max(
      ...individualCorrelations
        .filter((c) => c !== null)
        .map((c) => Math.abs(c!.correlationScore)),
      0
    )

    const isSynergistic =
      Math.abs(bestRho) > maxIndividualCorrelation + SYNERGISTIC_THRESHOLD

    return {
      foodIds,
      symptomId,
      correlationScore: bestRho,
      pValue: bestPValue,
      confidenceLevel: getConfidenceLevel(bestPValue, bestSampleSize),
      sampleSize: bestSampleSize,
      bestLagWindow,
      isSynergistic,
      individualMaxCorrelation: maxIndividualCorrelation,
    }
  } catch (error) {
    console.error('Error analyzing food combination correlation:', error)
    return null
  }
}

/**
 * Run complete correlation analysis for all foods and symptoms
 */
export async function runCorrelationAnalysis(
  dateRangeDays: number = 90
): Promise<CorrelationResult[]> {
  const endDate = Date.now()
  const startDate = endDate - dateRangeDays * 24 * 60 * 60 * 1000
  const dateRange = { start: startDate, end: endDate }

  const results: CorrelationResult[] = []

  // Get all active foods and symptoms
  const foods = await db.foods.where('isActive').equals(1).toArray()
  const symptoms = await db.symptoms.where('isActive').equals(1).toArray()

  // Analyze individual food correlations
  for (const symptom of symptoms) {
    if (!symptom.guid) continue

    for (const food of foods) {
      if (!food.guid) continue

      const result = await analyzeFoodSymptomCorrelation(
        food.guid,
        symptom.guid,
        dateRange
      )

      if (result) {
        results.push(result)
      }
    }
  }

  // TODO: Analyze food combinations (can be computationally expensive)
  // For now, we'll skip this to keep initial implementation simple

  return results
}
