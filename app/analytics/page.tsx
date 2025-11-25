'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  getAnalyticsSummary,
  AnalyticsSummary,
  DateRangeOption,
  getSymptomNames,
  getFoodNames
} from '@/lib/analytics/getAnalytics'
import { MetricCard, NavigationCard } from '@/components/Analytics'

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRangeOption>('30d')
  const [symptomNames, setSymptomNames] = useState<Map<string, string>>(new Map())
  const [foodNames, setFoodNames] = useState<Map<string, string>>(new Map())

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getAnalyticsSummary(dateRange)
      setSummary(data)

      // Load names for correlations
      const symptomIds = data.recentCorrelations.map(c => c.symptomId)
      const foodIds = data.recentCorrelations.flatMap(c => c.foodIds)

      if (symptomIds.length > 0) {
        const names = await getSymptomNames(symptomIds)
        setSymptomNames(names)
      }
      if (foodIds.length > 0) {
        const names = await getFoodNames(foodIds)
        setFoodNames(names)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getCorrelationColor = (score: number) => {
    if (score >= 0.7) return 'text-red-600 dark:text-red-400'
    if (score >= 0.4) return 'text-orange-600 dark:text-orange-400'
    return 'text-yellow-600 dark:text-yellow-400'
  }

  const formatLagWindow = (ms: number) => {
    const hours = ms / (60 * 60 * 1000)
    if (hours < 1) return `${Math.round(ms / (60 * 1000))} min`
    if (hours >= 24) return `${Math.round(hours / 24)} day${hours >= 48 ? 's' : ''}`
    return `${Math.round(hours)} hr${hours > 1 ? 's' : ''}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <p className="text-gray-600 dark:text-gray-400">Analyzing your health data</p>
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
                Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {summary?.streakDays ? `${summary.streakDays} day tracking streak!` : 'Your health insights at a glance'}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Period:
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Export Button */}
          <Link
            href="/settings/export"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Export Data
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Active Flares"
            value={summary?.activeFlares || 0}
            icon="🔥"
            color={summary?.activeFlares && summary.activeFlares > 0 ? 'red' : 'green'}
            href="/flares"
          />
          <MetricCard
            title="Symptoms This Month"
            value={summary?.totalSymptomsThisMonth || 0}
            icon="🩺"
            color="blue"
            href="/symptoms"
          />
          <MetricCard
            title="Triggers Logged"
            value={summary?.totalTriggersThisMonth || 0}
            icon="⚡"
            color="orange"
            href="/triggers"
          />
          <MetricCard
            title="Avg Health Score"
            value={summary?.averageHealthScore?.toFixed(1) || '-'}
            subtitle="Based on daily reflections"
            icon="💪"
            color={
              !summary?.averageHealthScore ? 'blue' :
              summary.averageHealthScore >= 7 ? 'green' :
              summary.averageHealthScore >= 4 ? 'yellow' : 'red'
            }
            href="/daily"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Triggers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Top Triggers
              </h2>
              <Link href="/triggers" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                View All
              </Link>
            </div>

            {summary?.topTriggers && summary.topTriggers.length > 0 ? (
              <div className="space-y-3">
                {summary.topTriggers.map((item, index) => (
                  <div key={item.trigger.guid} className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      index === 1 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <span className="text-gray-900 dark:text-gray-100">{item.trigger.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({item.trigger.category})</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {item.count}x
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No triggers logged yet
              </p>
            )}
          </div>

          {/* Problem Areas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Problem Areas
              </h2>
              <Link href="/body-map" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                View Body Map
              </Link>
            </div>

            {summary?.problemAreas && summary.problemAreas.length > 0 ? (
              <div className="space-y-3">
                {summary.problemAreas.map((area) => (
                  <div key={area.region} className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-gray-900 dark:text-gray-100 capitalize">
                        {area.region.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {area.count} events
                      </span>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        area.avgSeverity >= 7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        area.avgSeverity >= 4 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        Avg: {area.avgSeverity.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No body-mapped symptoms yet
              </p>
            )}
          </div>

          {/* Food-Symptom Correlations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Food-Symptom Correlations
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Based on Spearman correlation analysis
              </span>
            </div>

            {summary?.recentCorrelations && summary.recentCorrelations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Food(s)</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Symptom</th>
                      <th className="text-center py-2 text-gray-600 dark:text-gray-400 font-medium">Correlation</th>
                      <th className="text-center py-2 text-gray-600 dark:text-gray-400 font-medium">Lag</th>
                      <th className="text-center py-2 text-gray-600 dark:text-gray-400 font-medium">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentCorrelations.map((corr, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2 text-gray-900 dark:text-gray-100">
                          {corr.foodIds.map(id => foodNames.get(id) || id).join(' + ')}
                          {corr.isSynergistic && (
                            <span className="ml-2 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded">
                              Synergistic
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-gray-900 dark:text-gray-100">
                          {symptomNames.get(corr.symptomId) || corr.symptomId}
                        </td>
                        <td className={`py-2 text-center font-medium ${getCorrelationColor(Math.abs(corr.correlationScore))}`}>
                          {(corr.correlationScore * 100).toFixed(0)}%
                        </td>
                        <td className="py-2 text-center text-gray-600 dark:text-gray-400">
                          {formatLagWindow(corr.bestLagWindow)}
                        </td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            corr.confidenceLevel === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            corr.confidenceLevel === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {corr.confidenceLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Not enough data for correlation analysis. Keep logging your meals and symptoms!
              </p>
            )}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Detailed Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <NavigationCard
              title="Symptom Trends"
              description="View symptom frequency and severity over time"
              icon="📈"
              href="/analytics/symptoms"
              color="blue"
            />
            <NavigationCard
              title="Trigger Analysis"
              description="Understand which triggers impact you most"
              icon="⚡"
              href="/analytics/triggers"
              color="orange"
            />
            <NavigationCard
              title="Flare Metrics"
              description="Track flare duration, severity, and recovery"
              icon="🔥"
              href="/analytics/flares"
              color="red"
            />
            <NavigationCard
              title="Food Correlations"
              description="Detailed food-symptom relationship analysis"
              icon="🍽️"
              href="/analytics/food"
              color="green"
            />
            <NavigationCard
              title="Body Heat Map"
              description="Visualize problem areas on the body map"
              icon="🗺️"
              href="/analytics/heatmap"
              color="purple"
            />
            <NavigationCard
              title="Health Calendar"
              description="View your daily health scores over time"
              icon="📅"
              href="/daily/calendar"
              color="yellow"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
