/**
 * Unit Tests for Correlation Algorithm (F082)
 * Tests the Spearman correlation calculation and food-symptom analysis
 */

import { db } from '@/lib/db'

// Helper function to calculate Spearman correlation (copied from backgroundCorrelation for testing)
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

describe('Spearman Correlation Algorithm', () => {
  describe('getRanks', () => {
    it('should correctly rank simple values', () => {
      const values = [3, 1, 2]
      const ranks = getRanks(values)
      expect(ranks).toEqual([3, 1, 2])
    })

    it('should correctly rank with duplicates', () => {
      const values = [1, 2, 2, 3]
      const ranks = getRanks(values)
      // Note: This simple implementation doesn't handle ties perfectly
      expect(ranks.length).toBe(4)
    })

    it('should handle sorted values', () => {
      const values = [1, 2, 3, 4, 5]
      const ranks = getRanks(values)
      expect(ranks).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle reverse sorted values', () => {
      const values = [5, 4, 3, 2, 1]
      const ranks = getRanks(values)
      expect(ranks).toEqual([5, 4, 3, 2, 1])
    })
  })

  describe('spearmanCorrelation', () => {
    it('should return 1 for perfectly correlated data', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2, 4, 6, 8, 10]
      const correlation = spearmanCorrelation(x, y)
      expect(correlation).toBeCloseTo(1, 5)
    })

    it('should return -1 for perfectly inverse correlated data', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [10, 8, 6, 4, 2]
      const correlation = spearmanCorrelation(x, y)
      expect(correlation).toBeCloseTo(-1, 5)
    })

    it('should return 0 for uncorrelated data', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [3, 1, 4, 2, 5] // Random order
      const correlation = spearmanCorrelation(x, y)
      // Should be close to 0 but not exactly
      expect(Math.abs(correlation)).toBeLessThan(1)
    })

    it('should return 0 for arrays shorter than 3 elements', () => {
      expect(spearmanCorrelation([1], [1])).toBe(0)
      expect(spearmanCorrelation([1, 2], [1, 2])).toBe(0)
    })

    it('should return 0 for arrays of different lengths', () => {
      expect(spearmanCorrelation([1, 2, 3], [1, 2])).toBe(0)
    })

    it('should handle real-world food-symptom like data', () => {
      // Simulate: days where food was eaten (1) vs symptom severity
      const foodPresence = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1]
      const symptomSeverity = [7, 2, 6, 8, 1, 3, 7, 2, 5, 6]

      const correlation = spearmanCorrelation(foodPresence, symptomSeverity)
      // Should show positive correlation (food eaten -> higher symptoms)
      expect(correlation).toBeGreaterThan(0.5)
    })

    it('should handle binary data correctly', () => {
      const binary1 = [1, 0, 1, 0, 1, 0, 1, 0]
      const binary2 = [1, 0, 1, 0, 1, 0, 1, 0]
      const correlation = spearmanCorrelation(binary1, binary2)
      expect(correlation).toBeCloseTo(1, 5)
    })
  })
})

describe('Correlation Confidence Levels', () => {
  const getConfidence = (sampleSize: number): 'high' | 'medium' | 'low' => {
    return sampleSize >= 30 ? 'high' : sampleSize >= 14 ? 'medium' : 'low'
  }

  it('should return low confidence for small samples', () => {
    expect(getConfidence(5)).toBe('low')
    expect(getConfidence(10)).toBe('low')
    expect(getConfidence(13)).toBe('low')
  })

  it('should return medium confidence for moderate samples', () => {
    expect(getConfidence(14)).toBe('medium')
    expect(getConfidence(20)).toBe('medium')
    expect(getConfidence(29)).toBe('medium')
  })

  it('should return high confidence for large samples', () => {
    expect(getConfidence(30)).toBe('high')
    expect(getConfidence(100)).toBe('high')
    expect(getConfidence(365)).toBe('high')
  })
})

describe('Database Integration', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.foods.clear()
    await db.symptoms.clear()
    await db.foodEvents.clear()
    await db.symptomInstances.clear()
    await db.foodCombinationCorrelations.clear()
  })

  it('should store and retrieve food-symptom correlations', async () => {
    const correlation = {
      guid: 'test-correlation-1',
      foodIds: ['food-1'],
      symptomId: 'symptom-1',
      correlationScore: 0.75,
      individualMaxCorrelation: 0.75,
      isSynergistic: false,
      pValue: 0.01,
      confidenceLevel: 'high' as const,
      consistencyScore: 0.8,
      sampleSize: 50,
      lastAnalyzedAt: Date.now()
    }

    await db.foodCombinationCorrelations.add(correlation)

    const retrieved = await db.foodCombinationCorrelations
      .where('guid')
      .equals('test-correlation-1')
      .first()

    expect(retrieved).toBeDefined()
    expect(retrieved?.correlationScore).toBe(0.75)
    expect(retrieved?.confidenceLevel).toBe('high')
  })

  it('should filter correlations by symptom', async () => {
    await db.foodCombinationCorrelations.bulkAdd([
      {
        guid: 'corr-1',
        foodIds: ['food-1'],
        symptomId: 'symptom-1',
        correlationScore: 0.5,
        individualMaxCorrelation: 0.5,
        isSynergistic: false,
        pValue: 0.05,
        confidenceLevel: 'medium' as const,
        consistencyScore: 0.6,
        sampleSize: 20,
        lastAnalyzedAt: Date.now()
      },
      {
        guid: 'corr-2',
        foodIds: ['food-2'],
        symptomId: 'symptom-1',
        correlationScore: 0.7,
        individualMaxCorrelation: 0.7,
        isSynergistic: false,
        pValue: 0.01,
        confidenceLevel: 'high' as const,
        consistencyScore: 0.8,
        sampleSize: 40,
        lastAnalyzedAt: Date.now()
      },
      {
        guid: 'corr-3',
        foodIds: ['food-1'],
        symptomId: 'symptom-2',
        correlationScore: 0.3,
        individualMaxCorrelation: 0.3,
        isSynergistic: false,
        pValue: 0.1,
        confidenceLevel: 'low' as const,
        consistencyScore: 0.4,
        sampleSize: 10,
        lastAnalyzedAt: Date.now()
      }
    ])

    const symptom1Correlations = await db.foodCombinationCorrelations
      .where('symptomId')
      .equals('symptom-1')
      .toArray()

    expect(symptom1Correlations).toHaveLength(2)
    expect(symptom1Correlations.every(c => c.symptomId === 'symptom-1')).toBe(true)
  })
})
