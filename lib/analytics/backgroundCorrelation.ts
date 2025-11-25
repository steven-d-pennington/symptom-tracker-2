'use client'

import { db } from '@/lib/db'

/**
 * Background Correlation Analysis
 *
 * Runs correlation analysis in the background using requestIdleCallback
 * to avoid blocking the main thread.
 */

export interface CorrelationJob {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  result?: CorrelationResult[]
  error?: string
  startedAt?: number
  completedAt?: number
}

export interface CorrelationResult {
  foodId: string
  symptomId: string
  correlationScore: number
  sampleSize: number
  confidence: 'high' | 'medium' | 'low'
}

// Store for tracking background jobs
const jobs = new Map<string, CorrelationJob>()
const jobListeners = new Map<string, Set<(job: CorrelationJob) => void>>()

// Generate unique job ID
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Notify listeners of job update
function notifyListeners(jobId: string, job: CorrelationJob) {
  const listeners = jobListeners.get(jobId)
  if (listeners) {
    listeners.forEach(listener => listener(job))
  }
}

// Subscribe to job updates
export function subscribeToJob(
  jobId: string,
  callback: (job: CorrelationJob) => void
): () => void {
  if (!jobListeners.has(jobId)) {
    jobListeners.set(jobId, new Set())
  }
  jobListeners.get(jobId)!.add(callback)

  // Return unsubscribe function
  return () => {
    const listeners = jobListeners.get(jobId)
    if (listeners) {
      listeners.delete(callback)
      if (listeners.size === 0) {
        jobListeners.delete(jobId)
      }
    }
  }
}

// Get job status
export function getJob(jobId: string): CorrelationJob | undefined {
  return jobs.get(jobId)
}

// Check if requestIdleCallback is available
const hasIdleCallback = typeof requestIdleCallback !== 'undefined'

// Polyfill for requestIdleCallback
function scheduleWork(callback: () => void) {
  if (hasIdleCallback) {
    requestIdleCallback(() => callback(), { timeout: 1000 })
  } else {
    setTimeout(callback, 0)
  }
}

// Perform chunked work to avoid blocking
async function processInChunks<T, R>(
  items: T[],
  processItem: (item: T) => R,
  chunkSize: number = 50,
  onProgress?: (progress: number) => void
): Promise<R[]> {
  const results: R[] = []
  const totalItems = items.length

  for (let i = 0; i < totalItems; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize)

    // Process chunk
    for (const item of chunk) {
      results.push(processItem(item))
    }

    // Report progress
    const progress = Math.min((i + chunkSize) / totalItems, 1)
    onProgress?.(progress)

    // Yield to main thread between chunks
    await new Promise<void>(resolve => scheduleWork(resolve))
  }

  return results
}

// Calculate Spearman correlation coefficient
function spearmanCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 3) return 0

  const n = x.length

  // Rank the values
  const rankX = getRanks(x)
  const rankY = getRanks(y)

  // Calculate sum of squared rank differences
  let sumD2 = 0
  for (let i = 0; i < n; i++) {
    const d = rankX[i] - rankY[i]
    sumD2 += d * d
  }

  // Spearman's formula
  const correlation = 1 - (6 * sumD2) / (n * (n * n - 1))
  return correlation
}

function getRanks(values: number[]): number[] {
  const indexed = values.map((v, i) => ({ value: v, index: i }))
  indexed.sort((a, b) => a.value - b.value)

  const ranks = new Array(values.length)
  for (let i = 0; i < indexed.length; i++) {
    ranks[indexed[i].index] = i + 1
  }

  return ranks
}

// Start background correlation analysis
export async function startCorrelationAnalysis(
  dateRange?: { start: Date; end: Date }
): Promise<string> {
  const jobId = generateJobId()

  const job: CorrelationJob = {
    id: jobId,
    status: 'pending',
    progress: 0,
    startedAt: Date.now()
  }

  jobs.set(jobId, job)
  notifyListeners(jobId, job)

  // Start background processing
  scheduleWork(async () => {
    try {
      job.status = 'running'
      notifyListeners(jobId, job)

      // Fetch data
      const startTs = dateRange?.start.getTime() || 0
      const endTs = dateRange?.end.getTime() || Date.now()

      const [foods, foodEvents, symptoms, symptomInstances] = await Promise.all([
        db.foods.toArray(),
        db.foodEvents.where('timestamp').between(startTs, endTs).toArray(),
        db.symptoms.toArray(),
        db.symptomInstances.where('timestamp').between(startTs, endTs).toArray()
      ])

      job.progress = 0.1
      notifyListeners(jobId, job)

      // Build daily food consumption map
      const dailyFoods = new Map<string, Set<string>>() // date -> set of food guids
      for (const event of foodEvents) {
        const date = new Date(event.timestamp).toISOString().split('T')[0]
        if (!dailyFoods.has(date)) {
          dailyFoods.set(date, new Set())
        }
        event.foodIds.forEach(id => dailyFoods.get(date)!.add(id))
      }

      job.progress = 0.2
      notifyListeners(jobId, job)

      // Build daily symptom severity map
      const dailySymptoms = new Map<string, Map<string, number>>() // date -> (symptomId -> max severity)
      for (const instance of symptomInstances) {
        const date = new Date(instance.timestamp).toISOString().split('T')[0]
        if (!dailySymptoms.has(date)) {
          dailySymptoms.set(date, new Map())
        }
        const current = dailySymptoms.get(date)!.get(instance.symptomId) || 0
        dailySymptoms.get(date)!.set(instance.symptomId, Math.max(current, instance.severity))
      }

      job.progress = 0.3
      notifyListeners(jobId, job)

      // Get all dates that have both food and symptom data
      const allDates = Array.from(new Set([...dailyFoods.keys(), ...dailySymptoms.keys()])).sort()

      const results: CorrelationResult[] = []
      const totalPairs = foods.length * symptoms.length
      let processedPairs = 0

      // Calculate correlations for each food-symptom pair
      for (const food of foods) {
        for (const symptom of symptoms) {
          // Build correlation vectors
          const foodPresence: number[] = []
          const symptomSeverity: number[] = []

          for (const date of allDates) {
            const hadFood = dailyFoods.get(date)?.has(food.guid) ? 1 : 0
            const severity = dailySymptoms.get(date)?.get(symptom.guid) || 0

            foodPresence.push(hadFood)
            symptomSeverity.push(severity)
          }

          // Calculate correlation if we have enough data points
          if (foodPresence.length >= 7) {
            const correlation = spearmanCorrelation(foodPresence, symptomSeverity)

            // Only store significant correlations
            if (Math.abs(correlation) > 0.2) {
              results.push({
                foodId: food.guid,
                symptomId: symptom.guid,
                correlationScore: correlation,
                sampleSize: foodPresence.length,
                confidence: foodPresence.length >= 30 ? 'high' : foodPresence.length >= 14 ? 'medium' : 'low'
              })
            }
          }

          processedPairs++

          // Update progress periodically
          if (processedPairs % 10 === 0) {
            job.progress = 0.3 + (processedPairs / totalPairs) * 0.6
            notifyListeners(jobId, job)
            await new Promise<void>(resolve => scheduleWork(resolve))
          }
        }
      }

      // Sort by absolute correlation score
      results.sort((a, b) => Math.abs(b.correlationScore) - Math.abs(a.correlationScore))

      // Store results in database
      job.progress = 0.95
      notifyListeners(jobId, job)

      // Clear old correlations and store new ones
      await db.foodCombinationCorrelations.clear()

      for (const result of results.slice(0, 100)) { // Store top 100
        await db.foodCombinationCorrelations.add({
          guid: `${result.foodId}_${result.symptomId}`,
          foodIds: [result.foodId],
          symptomId: result.symptomId,
          correlationScore: result.correlationScore,
          individualMaxCorrelation: result.correlationScore,
          isSynergistic: false,
          pValue: 0.05, // Simplified
          confidenceLevel: result.confidence,
          consistencyScore: Math.abs(result.correlationScore),
          sampleSize: result.sampleSize,
          lastAnalyzedAt: Date.now()
        })
      }

      // Complete
      job.status = 'completed'
      job.progress = 1
      job.result = results
      job.completedAt = Date.now()
      notifyListeners(jobId, job)

    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
      notifyListeners(jobId, job)
    }
  })

  return jobId
}

// Get last analysis timestamp
export async function getLastAnalysisTime(): Promise<number | null> {
  const lastCorrelation = await db.foodCombinationCorrelations
    .orderBy('lastAnalyzedAt')
    .reverse()
    .first()

  return lastCorrelation?.lastAnalyzedAt || null
}

// Check if analysis is needed (more than 24 hours since last analysis)
export async function needsAnalysis(): Promise<boolean> {
  const lastTime = await getLastAnalysisTime()
  if (!lastTime) return true

  const hoursSinceLastAnalysis = (Date.now() - lastTime) / (1000 * 60 * 60)
  return hoursSinceLastAnalysis > 24
}
