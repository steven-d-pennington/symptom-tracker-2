'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { db, FoodCombinationCorrelation, Symptom, Food } from '@/lib/db'
import { runCorrelationAnalysis, CorrelationResult } from '@/lib/correlationAnalysis'

type SortBy = 'correlation' | 'confidence' | 'recent'
type FilterConfidence = 'all' | 'high' | 'medium' | 'low'

interface CorrelationDisplay extends CorrelationResult {
  symptomName: string
  foodNames: string[]
}

export default function FoodCorrelationsPage() {
  const [correlations, setCorrelations] = useState<CorrelationDisplay[]>([])
  const [synergisticOnly, setSynergisticOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('correlation')
  const [filterConfidence, setFilterConfidence] = useState<FilterConfidence>('all')
  const [filterSymptom, setFilterSymptom] = useState<string>('all')
  const [symptoms, setSymptoms] = useState<Symptom[]>([])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Load symptoms for filter dropdown
      const allSymptoms = await db.symptoms.filter((s) => s.isActive).toArray()
      setSymptoms(allSymptoms)

      // Load existing correlations from DB
      const storedCorrelations = await db.foodCombinationCorrelations.toArray()

      // Load food and symptom names
      const foods = await db.foods.toArray()
      const foodMap = new Map<string, string>()
      foods.forEach((f) => foodMap.set(f.guid, f.name))

      const symptomMap = new Map<string, string>()
      allSymptoms.forEach((s) => symptomMap.set(s.guid, s.name))

      // Convert to display format
      const displayCorrelations: CorrelationDisplay[] = storedCorrelations.map((c) => ({
        foodIds: c.foodIds,
        symptomId: c.symptomId,
        correlationScore: c.correlationScore,
        pValue: c.pValue,
        confidenceLevel: c.confidenceLevel,
        sampleSize: c.sampleSize,
        bestLagWindow: 0, // Not stored in DB
        isSynergistic: c.isSynergistic,
        individualMaxCorrelation: c.individualMaxCorrelation,
        symptomName: symptomMap.get(c.symptomId) || c.symptomId,
        foodNames: c.foodIds.map((id) => foodMap.get(id) || id),
      }))

      setCorrelations(displayCorrelations)
    } catch (error) {
      console.error('Error loading correlations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const results = await runCorrelationAnalysis(90)

      // Load food and symptom names
      const foods = await db.foods.toArray()
      const allSymptoms = await db.symptoms.toArray()

      const foodMap = new Map<string, string>()
      foods.forEach((f) => foodMap.set(f.guid, f.name))

      const symptomMap = new Map<string, string>()
      allSymptoms.forEach((s) => symptomMap.set(s.guid, s.name))

      // Store results in database
      for (const result of results) {
        const existing = await db.foodCombinationCorrelations
          .filter(
            (c) =>
              c.foodIds.join(',') === result.foodIds.join(',') && c.symptomId === result.symptomId
          )
          .first()

        if (existing) {
          await db.foodCombinationCorrelations.where('guid').equals(existing.guid).modify({
            correlationScore: result.correlationScore,
            pValue: result.pValue,
            confidenceLevel: result.confidenceLevel,
            sampleSize: result.sampleSize,
            isSynergistic: result.isSynergistic,
            individualMaxCorrelation: result.individualMaxCorrelation,
            lastAnalyzedAt: Date.now(),
          })
        } else {
          await db.foodCombinationCorrelations.add({
            guid: `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            foodIds: result.foodIds,
            symptomId: result.symptomId,
            correlationScore: result.correlationScore,
            pValue: result.pValue,
            confidenceLevel: result.confidenceLevel,
            sampleSize: result.sampleSize,
            isSynergistic: result.isSynergistic,
            individualMaxCorrelation: result.individualMaxCorrelation,
            consistencyScore: 0,
            lastAnalyzedAt: Date.now(),
          })
        }
      }

      // Convert to display format
      const displayCorrelations: CorrelationDisplay[] = results.map((c) => ({
        ...c,
        symptomName: symptomMap.get(c.symptomId) || c.symptomId,
        foodNames: c.foodIds.map((id) => foodMap.get(id) || id),
      }))

      setCorrelations(displayCorrelations)
    } catch (error) {
      console.error('Error running analysis:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatLagWindow = (ms: number) => {
    const hours = ms / (60 * 60 * 1000)
    if (hours < 1) return `${Math.round(ms / (60 * 1000))} min`
    if (hours >= 24) return `${Math.round(hours / 24)} day${hours >= 48 ? 's' : ''}`
    return `${Math.round(hours)} hr${hours > 1 ? 's' : ''}`
  }

  // Filter and sort correlations
  const filteredCorrelations = correlations
    .filter((c) => {
      if (synergisticOnly && !c.isSynergistic) return false
      if (filterConfidence !== 'all' && c.confidenceLevel !== filterConfidence) return false
      if (filterSymptom !== 'all' && c.symptomId !== filterSymptom) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'correlation':
          return Math.abs(b.correlationScore) - Math.abs(a.correlationScore)
        case 'confidence':
          const confOrder = { high: 3, medium: 2, low: 1 }
          return confOrder[b.confidenceLevel] - confOrder[a.confidenceLevel]
        default:
          return 0
      }
    })

  // Separate positive and negative correlations
  const positiveCorrelations = filteredCorrelations.filter((c) => c.correlationScore > 0)
  const negativeCorrelations = filteredCorrelations.filter((c) => c.correlationScore < 0)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading correlations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Food-Symptom Correlations
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {correlations.length} correlation{correlations.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <Link
              href="/analytics"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              ← Back to Analytics
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="correlation">Sort by Strength</option>
              <option value="confidence">Sort by Confidence</option>
            </select>

            {/* Confidence Filter */}
            <select
              value={filterConfidence}
              onChange={(e) => setFilterConfidence(e.target.value as FilterConfidence)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Confidence</option>
              <option value="high">High Confidence</option>
              <option value="medium">Medium Confidence</option>
              <option value="low">Low Confidence</option>
            </select>

            {/* Symptom Filter */}
            <select
              value={filterSymptom}
              onChange={(e) => setFilterSymptom(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Symptoms</option>
              {symptoms.map((s) => (
                <option key={s.guid} value={s.guid}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Synergistic Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={synergisticOnly}
                onChange={(e) => setSynergisticOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Synergistic Only</span>
            </label>
          </div>

          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>

        {correlations.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-6xl mb-4">🔬</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Correlations Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Log more meals and symptoms to discover correlations.
            </p>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis Now'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Positive Correlations (Foods that increase symptoms) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚠️</span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Foods That May Increase Symptoms
                </h2>
              </div>

              {positiveCorrelations.length > 0 ? (
                <div className="space-y-3">
                  {positiveCorrelations.map((corr, index) => (
                    <div
                      key={index}
                      className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {corr.foodNames.join(' + ')}
                            {corr.isSynergistic && (
                              <span className="ml-2 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded">
                                Synergistic
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            → {corr.symptomName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600 dark:text-red-400">
                            +{(corr.correlationScore * 100).toFixed(0)}%
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              corr.confidenceLevel === 'high'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : corr.confidenceLevel === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {corr.confidenceLevel}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Sample size: {corr.sampleSize} | p-value: {corr.pValue.toFixed(3)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No positive correlations found
                </p>
              )}
            </div>

            {/* Negative Correlations (Foods that may help) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✅</span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Foods That May Help
                </h2>
              </div>

              {negativeCorrelations.length > 0 ? (
                <div className="space-y-3">
                  {negativeCorrelations.map((corr, index) => (
                    <div
                      key={index}
                      className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {corr.foodNames.join(' + ')}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            → {corr.symptomName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {(corr.correlationScore * 100).toFixed(0)}%
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              corr.confidenceLevel === 'high'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : corr.confidenceLevel === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {corr.confidenceLevel}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Sample size: {corr.sampleSize} | p-value: {corr.pValue.toFixed(3)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No negative correlations found
                </p>
              )}
            </div>
          </div>
        )}

        {/* Synergistic Insights Section */}
        {synergisticOnly ||
          (filteredCorrelations.some((c) => c.isSynergistic) && (
            <div className="mt-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧪</span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Synergistic Food Combinations
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                These food combinations have a stronger effect together than individually. The
                combined correlation exceeds the maximum individual correlation by at least 15%.
              </p>

              <div className="space-y-3">
                {filteredCorrelations
                  .filter((c) => c.isSynergistic)
                  .map((corr, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {corr.foodNames.join(' + ')}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            → {corr.symptomName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {(corr.correlationScore * 100).toFixed(0)}%
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            vs {(corr.individualMaxCorrelation * 100).toFixed(0)}% individual
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </main>
    </div>
  )
}
