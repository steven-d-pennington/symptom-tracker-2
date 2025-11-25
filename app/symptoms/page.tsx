'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SymptomInstance, Symptom } from '@/lib/db'
import { getRecentSymptomInstances, getActiveSymptoms } from '@/lib/symptoms/logSymptom'
import { SymptomCard } from '@/components/Symptoms/SymptomCard'
import { SymptomLoggingModal } from '@/components/Symptoms/SymptomLoggingModal'

export default function SymptomsPage() {
  const [symptomInstances, setSymptomInstances] = useState<SymptomInstance[]>([])
  const [symptomsMap, setSymptomsMap] = useState<Map<string, Symptom>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filterSymptomId, setFilterSymptomId] = useState<string>('all')

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [instances, symptoms] = await Promise.all([
        getRecentSymptomInstances(100),
        getActiveSymptoms(),
      ])

      setSymptomInstances(instances)

      // Create a map for quick symptom lookup
      const map = new Map<string, Symptom>()
      symptoms.forEach((s) => map.set(s.guid, s))
      setSymptomsMap(map)
    } catch (error) {
      console.error('Error loading symptoms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleModalSuccess = () => {
    loadData()
  }

  // Filter instances
  const filteredInstances =
    filterSymptomId === 'all'
      ? symptomInstances
      : symptomInstances.filter((i) => i.symptomId === filterSymptomId)

  // Get unique symptoms from instances for filter dropdown
  const instanceSymptomIds = new Set(symptomInstances.map((i) => i.symptomId))
  const activeInstanceSymptoms = Array.from(symptomsMap.values()).filter((s) =>
    instanceSymptomIds.has(s.guid)
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <p className="text-gray-600 dark:text-gray-400">Loading symptom history</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Symptom Log</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {symptomInstances.length} {symptomInstances.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          {/* Filter */}
          {activeInstanceSymptoms.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter:
              </label>
              <select
                value={filterSymptomId}
                onChange={(e) => setFilterSymptomId(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Symptoms</option>
                {activeInstanceSymptoms.map((symptom) => (
                  <option key={symptom.guid} value={symptom.guid}>
                    {symptom.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* New Symptom Button */}
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            + Log Symptom
          </button>
        </div>

        {/* Symptom Instances List */}
        {filteredInstances.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No Symptoms Logged
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start tracking your symptoms to identify patterns and triggers.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Log Your First Symptom
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInstances.map((instance) => {
              const symptom = symptomsMap.get(instance.symptomId)
              if (!symptom) return null

              return <SymptomCard key={instance.guid} instance={instance} symptom={symptom} />
            })}
          </div>
        )}
      </main>

      {/* Symptom Logging Modal */}
      <SymptomLoggingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
