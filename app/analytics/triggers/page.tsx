'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { db, Trigger, TriggerEvent, SymptomInstance, Flare } from '@/lib/db'

type DateRange = '30d' | '90d' | '180d' | 'all'

interface TriggerImpact {
  trigger: Trigger
  eventCount: number
  symptomCorrelation: number // symptoms within 24h of trigger
  flareCorrelation: number // flares within 48h of trigger
  avgSymptomSeverity: number
  impactScore: number
  recommendation: string
}

interface TriggerAnalysis {
  triggers: TriggerImpact[]
  totalTriggerEvents: number
  totalSymptoms: number
  totalFlares: number
  mostImpactful: TriggerImpact | null
}

export default function TriggerAnalysisPage() {
  const [analysis, setAnalysis] = useState<TriggerAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>('90d')
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const now = Date.now()
      let startDate: number

      switch (dateRange) {
        case '30d':
          startDate = now - 30 * 24 * 60 * 60 * 1000
          break
        case '90d':
          startDate = now - 90 * 24 * 60 * 60 * 1000
          break
        case '180d':
          startDate = now - 180 * 24 * 60 * 60 * 1000
          break
        case 'all':
        default:
          startDate = 0
          break
      }

      // Get all data
      const triggers = await db.triggers.filter((t) => t.isActive).toArray()
      const triggerEvents = await db.triggerEvents
        .filter((e) => e.timestamp >= startDate)
        .toArray()
      const symptomInstances = await db.symptomInstances
        .filter((s) => s.timestamp >= startDate)
        .toArray()
      const flares = await db.flares.filter((f) => f.startDate >= startDate).toArray()

      const SYMPTOM_WINDOW = 24 * 60 * 60 * 1000 // 24 hours
      const FLARE_WINDOW = 48 * 60 * 60 * 1000 // 48 hours

      // Calculate impact for each trigger
      const triggerImpacts: TriggerImpact[] = []

      for (const trigger of triggers) {
        const events = triggerEvents.filter((e) => e.triggerId === trigger.guid)

        if (events.length === 0) continue

        // Count symptoms within 24h of each trigger event
        let symptomCount = 0
        let totalSeverity = 0

        for (const event of events) {
          const windowEnd = event.timestamp + SYMPTOM_WINDOW
          const relatedSymptoms = symptomInstances.filter(
            (s) => s.timestamp >= event.timestamp && s.timestamp <= windowEnd
          )
          symptomCount += relatedSymptoms.length
          totalSeverity += relatedSymptoms.reduce((sum, s) => sum + s.severity, 0)
        }

        const symptomCorrelation = symptomCount / events.length

        // Count flares within 48h of each trigger event
        let flareCount = 0
        for (const event of events) {
          const windowEnd = event.timestamp + FLARE_WINDOW
          const relatedFlares = flares.filter(
            (f) => f.startDate >= event.timestamp && f.startDate <= windowEnd
          )
          flareCount += relatedFlares.length
        }

        const flareCorrelation = flareCount / events.length
        const avgSymptomSeverity = symptomCount > 0 ? totalSeverity / symptomCount : 0

        // Calculate impact score (weighted combination)
        const impactScore =
          symptomCorrelation * 0.4 + flareCorrelation * 10 * 0.4 + avgSymptomSeverity * 0.2

        // Generate recommendation
        let recommendation = ''
        if (impactScore > 5) {
          recommendation = 'Strongly consider avoiding this trigger'
        } else if (impactScore > 2) {
          recommendation = 'Monitor and limit exposure when possible'
        } else if (impactScore > 0.5) {
          recommendation = 'Low impact - occasional exposure likely okay'
        } else {
          recommendation = 'Minimal impact detected'
        }

        triggerImpacts.push({
          trigger,
          eventCount: events.length,
          symptomCorrelation,
          flareCorrelation,
          avgSymptomSeverity,
          impactScore,
          recommendation,
        })
      }

      // Sort by impact score
      triggerImpacts.sort((a, b) => b.impactScore - a.impactScore)

      setAnalysis({
        triggers: triggerImpacts,
        totalTriggerEvents: triggerEvents.length,
        totalSymptoms: symptomInstances.length,
        totalFlares: flares.length,
        mostImpactful: triggerImpacts[0] || null,
      })
    } catch (error) {
      console.error('Error loading trigger analysis:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  const selectedImpact = analysis?.triggers.find(
    (t) => t.trigger.guid === selectedTrigger
  )

  const getImpactColor = (score: number) => {
    if (score > 5) return 'text-red-600 dark:text-red-400'
    if (score > 2) return 'text-orange-600 dark:text-orange-400'
    if (score > 0.5) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getImpactBgColor = (score: number) => {
    if (score > 5)
      return 'bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800'
    if (score > 2)
      return 'bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
    if (score > 0.5)
      return 'bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
    return 'bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'environmental':
        return '🌍'
      case 'lifestyle':
        return '🏃'
      case 'dietary':
        return '🍽️'
      default:
        return '⚡'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Analyzing trigger impact...</p>
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
                Trigger Impact Analysis
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {analysis?.totalTriggerEvents || 0} trigger events analyzed
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
        {/* Date Range Selector */}
        <div className="flex items-center gap-2 mb-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Period:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="180d">Last 6 Months</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Most Impactful */}
        {analysis?.mostImpactful && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Most Impactful Trigger
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-3xl">
                {getCategoryIcon(analysis.mostImpactful.trigger.category)}
              </span>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {analysis.mostImpactful.trigger.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {analysis.mostImpactful.trigger.category} trigger
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className={`text-2xl font-bold ${getImpactColor(analysis.mostImpactful.impactScore)}`}>
                  {analysis.mostImpactful.impactScore.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Impact Score</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trigger Rankings */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Triggers by Impact
            </h2>

            {analysis?.triggers && analysis.triggers.length > 0 ? (
              <div className="space-y-2">
                {analysis.triggers.map((impact, index) => (
                  <button
                    key={impact.trigger.guid}
                    onClick={() => setSelectedTrigger(impact.trigger.guid)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTrigger === impact.trigger.guid
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : `${getImpactBgColor(impact.impactScore)}`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
                          index === 0
                            ? 'bg-red-500 text-white'
                            : index === 1
                              ? 'bg-orange-500 text-white'
                              : index === 2
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {impact.trigger.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {impact.eventCount} events
                        </p>
                      </div>
                      <span className={`font-bold ${getImpactColor(impact.impactScore)}`}>
                        {impact.impactScore.toFixed(1)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No triggers logged in this period
              </p>
            )}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2 space-y-6">
            {selectedImpact ? (
              <>
                {/* Trigger Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">
                      {getCategoryIcon(selectedImpact.trigger.category)}
                    </span>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedImpact.trigger.name}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {selectedImpact.trigger.category} trigger
                      </p>
                      {selectedImpact.trigger.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {selectedImpact.trigger.description}
                        </p>
                      )}
                    </div>
                    <div
                      className={`text-center p-3 rounded-lg ${getImpactBgColor(selectedImpact.impactScore)}`}
                    >
                      <p className={`text-2xl font-bold ${getImpactColor(selectedImpact.impactScore)}`}>
                        {selectedImpact.impactScore.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Impact</p>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedImpact.eventCount}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Symptoms/Event</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedImpact.symptomCorrelation.toFixed(1)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Flares/Event</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {selectedImpact.flareCorrelation.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Severity</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {selectedImpact.avgSymptomSeverity.toFixed(1)}
                    </p>
                  </div>
                </div>

                {/* Recommendation */}
                <div
                  className={`rounded-lg border p-4 ${getImpactBgColor(selectedImpact.impactScore)}`}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Recommendation
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedImpact.recommendation}
                  </p>
                </div>

                {/* Impact Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    How Impact Score is Calculated
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Symptoms within 24h (40%)
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(selectedImpact.symptomCorrelation * 0.4).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Flares within 48h (40%)
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(selectedImpact.flareCorrelation * 10 * 0.4).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Avg Symptom Severity (20%)
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(selectedImpact.avgSymptomSeverity * 0.2).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Total Impact Score
                      </span>
                      <span
                        className={`text-lg font-bold ${getImpactColor(selectedImpact.impactScore)}`}
                      >
                        {selectedImpact.impactScore.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a trigger to view detailed impact analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
