'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Medication, MedicationEvent } from '@/lib/db'
import {
  getActiveMedications,
  getAllMedications,
  deactivateMedication,
  reactivateMedication,
} from '@/lib/medications/manageMedication'
import {
  getTodaysMedicationEvents,
  getRecentMedicationEvents,
} from '@/lib/medications/logMedication'
import { MedicationCard, MedicationForm, MedicationLoggerModal } from '@/components/Medications'

type ViewMode = 'active' | 'all' | 'history'

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [todaysEvents, setTodaysEvents] = useState<MedicationEvent[]>([])
  const [recentEvents, setRecentEvents] = useState<MedicationEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('active')
  const [formOpen, setFormOpen] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [loggerOpen, setLoggerOpen] = useState(false)
  const [loggingMedication, setLoggingMedication] = useState<Medication | null>(null)
  const [loggingAction, setLoggingAction] = useState<'taken' | 'skipped'>('taken')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [allMeds, todayEvts, recentEvts] = await Promise.all([
        getAllMedications(),
        getTodaysMedicationEvents(),
        getRecentMedicationEvents(100),
      ])
      setMedications(allMeds)
      setTodaysEvents(todayEvts)
      setRecentEvents(recentEvts)
    } catch (error) {
      console.error('Error loading medications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleFormSuccess = () => {
    loadData()
  }

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingMedication(null)
  }

  const handleDeactivate = async (guid: string) => {
    if (confirm('Are you sure you want to deactivate this medication?')) {
      try {
        await deactivateMedication(guid)
        loadData()
      } catch (error) {
        console.error('Error deactivating medication:', error)
      }
    }
  }

  const handleReactivate = async (guid: string) => {
    try {
      await reactivateMedication(guid)
      loadData()
    } catch (error) {
      console.error('Error reactivating medication:', error)
    }
  }

  const handleLogTaken = (medication: Medication) => {
    setLoggingMedication(medication)
    setLoggingAction('taken')
    setLoggerOpen(true)
  }

  const handleLogSkipped = (medication: Medication) => {
    setLoggingMedication(medication)
    setLoggingAction('skipped')
    setLoggerOpen(true)
  }

  const handleLoggerClose = () => {
    setLoggerOpen(false)
    setLoggingMedication(null)
  }

  // Filter medications based on view mode
  const displayMedications =
    viewMode === 'active'
      ? medications.filter((m) => m.isActive)
      : medications

  const activeMedications = medications.filter((m) => m.isActive)
  const takenToday = todaysEvents.filter((e) => e.taken).length
  const skippedToday = todaysEvents.filter((e) => !e.taken).length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <p className="text-gray-600 dark:text-gray-400">Loading medications</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medications</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activeMedications.length} active medications
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
        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Medications</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {activeMedications.length}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-600 dark:text-green-400">Taken Today</div>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              {takenToday}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="text-sm text-red-600 dark:text-red-400">Skipped Today</div>
            <div className="text-3xl font-bold text-red-700 dark:text-red-300">
              {skippedToday}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          {/* View Mode Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'active'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              All
            </button>
          </div>

          {/* Add Medication Button */}
          <button
            onClick={() => setFormOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            + Add Medication
          </button>
        </div>

        {/* Medications Grid */}
        {displayMedications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💊</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {viewMode === 'active' ? 'No Active Medications' : 'No Medications'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add your medications to track adherence and identify patterns.
            </p>
            <button
              onClick={() => setFormOpen(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Add Your First Medication
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayMedications.map((medication) => (
              <MedicationCard
                key={medication.guid}
                medication={medication}
                onEdit={handleEdit}
                onDeactivate={handleDeactivate}
                onReactivate={handleReactivate}
                onLogTaken={handleLogTaken}
                onLogSkipped={handleLogSkipped}
              />
            ))}
          </div>
        )}

        {/* Recent Activity */}
        {recentEvents.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Recent Activity
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
              {recentEvents.slice(0, 10).map((event) => {
                const med = medications.find((m) => m.guid === event.medicationId)
                return (
                  <div key={event.guid} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xl ${event.taken ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {event.taken ? '✓' : '✗'}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {med?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(event.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                          {event.dosageOverride && ` • ${event.dosageOverride}`}
                        </div>
                      </div>
                    </div>
                    {event.timingWarning && (
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          event.timingWarning === 'on-time'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : event.timingWarning === 'early'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                        }`}
                      >
                        {event.timingWarning}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Medication Form Modal */}
      <MedicationForm
        isOpen={formOpen}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        editMedication={editingMedication}
      />

      {/* Medication Logger Modal */}
      <MedicationLoggerModal
        isOpen={loggerOpen}
        onClose={handleLoggerClose}
        onSuccess={loadData}
        medication={loggingMedication}
        action={loggingAction}
      />
    </div>
  )
}
