'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { SymptomInstance, Symptom } from '@/lib/db'
import { getActiveSymptoms, getSymptomInstancesInRange } from '@/lib/symptoms/logSymptom'
import { SymptomTimeline } from '@/components/Symptoms/SymptomTimeline'
import { SymptomFrequencyChart } from '@/components/Symptoms/SymptomFrequencyChart'
import { SymptomTrendChart } from '@/components/Symptoms/SymptomTrendChart'
import { db } from '@/lib/db'

type SortOption = 'date-desc' | 'date-asc' | 'severity-desc' | 'severity-asc' | 'symptom'
type ViewTab = 'timeline' | 'frequency' | 'trends'

export default function SymptomHistoryPage() {
  const [allInstances, setAllInstances] = useState<SymptomInstance[]>([])
  const [symptomsMap, setSymptomsMap] = useState<Map<string, Symptom>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  // Filter states
  const [selectedSymptomId, setSelectedSymptomId] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [minSeverity, setMinSeverity] = useState<number>(1)
  const [maxSeverity, setMaxSeverity] = useState<number>(10)

  // Sort and view states
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [activeTab, setActiveTab] = useState<ViewTab>('timeline')

  // Detail view
  const [selectedInstance, setSelectedInstance] = useState<SymptomInstance | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Get all symptom instances (last 365 days by default)
      const now = Date.now()
      const yearAgo = now - 365 * 24 * 60 * 60 * 1000

      const [instances, symptoms] = await Promise.all([
        db.symptomInstances.orderBy('timestamp').reverse().toArray(),
        getActiveSymptoms(),
      ])

      setAllInstances(instances)

      // Create a map for quick symptom lookup
      const map = new Map<string, Symptom>()
      symptoms.forEach((s) => map.set(s.guid, s))
      // Also add any symptoms from instances that might not be active
      const instanceSymptomIds = new Set(instances.map((i) => i.symptomId))
      const allSymptoms = await db.symptoms.toArray()
      allSymptoms.forEach((s) => {
        if (instanceSymptomIds.has(s.guid)) {
          map.set(s.guid, s)
        }
      })
      setSymptomsMap(map)

      // Set default date range to last 30 days
      const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)
      setStartDate(thirtyDaysAgo.toISOString().split('T')[0])
      setEndDate(new Date(now).toISOString().split('T')[0])
    } catch (error) {
      console.error('Error loading symptom history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Apply filters and sorting
  const filteredInstances = useMemo(() => {
    let filtered = [...allInstances]

    // Filter by symptom type
    if (selectedSymptomId !== 'all') {
      filtered = filtered.filter((i) => i.symptomId === selectedSymptomId)
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate).getTime()
      filtered = filtered.filter((i) => i.timestamp >= start)
    }
    if (endDate) {
      const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 // Include end date
      filtered = filtered.filter((i) => i.timestamp <= end)
    }

    // Filter by severity range
    filtered = filtered.filter((i) => i.severity >= minSeverity && i.severity <= maxSeverity)

    // Apply sorting
    switch (sortBy) {
      case 'date-desc':
        filtered.sort((a, b) => b.timestamp - a.timestamp)
        break
      case 'date-asc':
        filtered.sort((a, b) => a.timestamp - b.timestamp)
        break
      case 'severity-desc':
        filtered.sort((a, b) => b.severity - a.severity)
        break
      case 'severity-asc':
        filtered.sort((a, b) => a.severity - b.severity)
        break
      case 'symptom':
        filtered.sort((a, b) => {
          const nameA = symptomsMap.get(a.symptomId)?.name || ''
          const nameB = symptomsMap.get(b.symptomId)?.name || ''
          return nameA.localeCompare(nameB)
        })
        break
    }

    return filtered
  }, [allInstances, selectedSymptomId, startDate, endDate, minSeverity, maxSeverity, sortBy, symptomsMap])

  // Get unique symptoms for filter dropdown
  const uniqueSymptoms = useMemo(() => {
    const symptomIds = new Set(allInstances.map((i) => i.symptomId))
    return Array.from(symptomIds)
      .map((id) => symptomsMap.get(id))
      .filter(Boolean) as Symptom[]
  }, [allInstances, symptomsMap])

  const handleExport = () => {
    const exportData = filteredInstances.map((instance) => ({
      symptom: symptomsMap.get(instance.symptomId)?.name || 'Unknown',
      severity: instance.severity,
      timestamp: new Date(instance.timestamp).toISOString(),
      location: instance.bodyRegion || '',
      duration: instance.durationMinutes || '',
      notes: instance.notes || '',
    }))

    const csv = [
      ['Symptom', 'Severity', 'Timestamp', 'Location', 'Duration (min)', 'Notes'],
      ...exportData.map((row) => [
        row.symptom,
        row.severity,
        row.timestamp,
        row.location,
        row.duration,
        row.notes,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `symptom-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setSelectedSymptomId('all')
    const now = Date.now()
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0])
    setEndDate(new Date(now).toISOString().split('T')[0])
    setMinSeverity(1)
    setMaxSeverity(10)
    setSortBy('date-desc')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading symptom history...</p>
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
              <div className="flex items-center gap-2">
                <Link
                  href="/symptoms"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Symptoms
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 dark:text-white font-medium">History</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                Symptom History
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredInstances.length} of {allInstances.length} entries
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                disabled={filteredInstances.length === 0}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export CSV
              </button>
              <Link
                href="/"
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Reset
                </button>
              </div>

              {/* Symptom Type Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Symptom Type
                </label>
                <select
                  value={selectedSymptomId}
                  onChange={(e) => setSelectedSymptomId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="all">All Symptoms</option>
                  {uniqueSymptoms.map((symptom) => (
                    <option key={symptom.guid} value={symptom.guid}>
                      {symptom.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>
              </div>

              {/* Severity Range Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Severity Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={minSeverity}
                    onChange={(e) => setMinSeverity(Number(e.target.value))}
                    className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm text-center"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={maxSeverity}
                    onChange={(e) => setMaxSeverity(Number(e.target.value))}
                    className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm text-center"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="date-desc">Date (Newest First)</option>
                  <option value="date-asc">Date (Oldest First)</option>
                  <option value="severity-desc">Severity (Highest First)</option>
                  <option value="severity-asc">Severity (Lowest First)</option>
                  <option value="symptom">Symptom Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* View Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'timeline'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setActiveTab('frequency')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'frequency'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Frequency
                </button>
                <button
                  onClick={() => setActiveTab('trends')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'trends'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Trends
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'timeline' && (
                  <SymptomTimeline
                    instances={filteredInstances}
                    symptomsMap={symptomsMap}
                    onInstanceClick={setSelectedInstance}
                  />
                )}

                {activeTab === 'frequency' && (
                  <SymptomFrequencyChart
                    instances={filteredInstances}
                    symptomsMap={symptomsMap}
                  />
                )}

                {activeTab === 'trends' && (
                  <SymptomTrendChart
                    instances={filteredInstances}
                    symptomsMap={symptomsMap}
                    selectedSymptomId={selectedSymptomId !== 'all' ? selectedSymptomId : undefined}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Instance Detail Modal */}
      {selectedInstance && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedInstance(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {symptomsMap.get(selectedInstance.symptomId)?.name || 'Unknown Symptom'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(selectedInstance.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedInstance(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Severity</dt>
                <dd className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedInstance.severity}/10
                </dd>
              </div>

              {selectedInstance.durationMinutes && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Duration</dt>
                  <dd className="text-gray-900 dark:text-gray-100">
                    {selectedInstance.durationMinutes} minutes
                  </dd>
                </div>
              )}

              {selectedInstance.bodyRegion && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Location</dt>
                  <dd className="text-gray-900 dark:text-gray-100">
                    {selectedInstance.bodyRegion
                      .replace(/-/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </dd>
                </div>
              )}

              {selectedInstance.notes && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400 mb-1">Notes</dt>
                  <dd className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 rounded p-2">
                    {selectedInstance.notes}
                  </dd>
                </div>
              )}
            </dl>

            <button
              onClick={() => setSelectedInstance(null)}
              className="mt-6 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
