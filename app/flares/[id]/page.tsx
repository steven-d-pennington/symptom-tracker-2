'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Flare, FlareEvent, PhotoAttachment } from '@/lib/db'
import { getFlareById, getFlareEvents } from '@/lib/flares/createFlare'
import { calculateDaysActive } from '@/lib/flares/resolveFlare'
import { getSeverityColor } from '@/lib/bodyMap/coordinateUtils'
import { FlareTimeline } from '@/components/Flares/FlareTimeline'
import { SeverityChart } from '@/components/Flares/SeverityChart'
import { MiniBodyMap } from '@/components/Flares/MiniBodyMap'
import { FlareUpdateModal } from '@/components/Flares/FlareUpdateModal'
import { FlareResolutionModal } from '@/components/Flares/FlareResolutionModal'
import { db } from '@/lib/db'

export default function FlareDetailPage() {
  const params = useParams()
  const flareId = params.id as string

  const [flare, setFlare] = useState<Flare | null>(null)
  const [events, setEvents] = useState<FlareEvent[]>([])
  const [photos, setPhotos] = useState<PhotoAttachment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [resolveModalOpen, setResolveModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'timeline' | 'chart'>('timeline')

  const loadFlareData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const flareData = await getFlareById(flareId)
      if (!flareData) {
        setError('Flare not found')
        return
      }
      setFlare(flareData)

      const flareEvents = await getFlareEvents(flareId)
      setEvents(flareEvents)

      // Load photos associated with this flare's body region
      const photoData = await db.photoAttachments
        .where('bodyRegion')
        .equals(flareData.bodyRegion)
        .toArray()
      setPhotos(photoData)
    } catch (err) {
      console.error('Error loading flare:', err)
      setError('Failed to load flare data')
    } finally {
      setIsLoading(false)
    }
  }, [flareId])

  useEffect(() => {
    loadFlareData()
  }, [loadFlareData])

  const handleModalSuccess = () => {
    loadFlareData()
  }

  // Get interventions from events
  const interventions = events.filter((e) => e.eventType === 'intervention')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading flare details...</p>
        </div>
      </div>
    )
  }

  if (error || !flare) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {error || 'Flare Not Found'}
          </h1>
          <Link
            href="/flares"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to Active Flares
          </Link>
        </div>
      </div>
    )
  }

  const daysActive = calculateDaysActive(flare.startDate, flare.endDate)
  const severityColor = getSeverityColor(flare.currentSeverity)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/flares"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-1 inline-block"
              >
                ← Back to Active Flares
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {flare.bodyRegion.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Started {new Date(flare.startDate).toLocaleDateString()} • {daysActive}{' '}
                {daysActive === 1 ? 'day' : 'days'} active
              </p>
            </div>

            {/* Quick Actions */}
            {flare.status !== 'resolved' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setUpdateModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={() => setResolveModalOpen(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Resolve
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats and Body Map */}
          <div className="lg:col-span-1 space-y-6">
            {/* Severity Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Current Status
              </h2>

              <div className="flex items-center gap-6">
                {/* Severity Badge */}
                <div
                  className="flex flex-col items-center justify-center w-24 h-24 rounded-xl"
                  style={{ backgroundColor: severityColor + '20' }}
                >
                  <div
                    className="text-4xl font-bold"
                    style={{ color: severityColor }}
                  >
                    {flare.currentSeverity}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">severity</div>
                </div>

                <div className="flex-1 space-y-3">
                  {/* Status */}
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium capitalize ${
                          flare.status === 'improving'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : flare.status === 'worsening'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : flare.status === 'resolved'
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}
                      >
                        {flare.status === 'improving' && '↓ '}
                        {flare.status === 'worsening' && '↑ '}
                        {flare.status}
                      </span>
                    </div>
                  </div>

                  {/* Initial Severity */}
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Initial</span>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {flare.initialSeverity}/10
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Body Map */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Location
              </h2>
              <MiniBodyMap flare={flare} />
              <div className="mt-4 text-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {flare.bodyRegion.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Position: {(flare.coordinateX * 100).toFixed(1)}%, {(flare.coordinateY * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Interventions */}
            {interventions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Interventions ({interventions.length})
                </h2>
                <div className="space-y-2">
                  {interventions.map((intervention) => (
                    <div
                      key={intervention.guid}
                      className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <span className="text-lg">
                        {intervention.interventionType === 'ice' && '❄️'}
                        {intervention.interventionType === 'heat' && '🔥'}
                        {intervention.interventionType === 'medication' && '💊'}
                        {intervention.interventionType === 'rest' && '😴'}
                        {intervention.interventionType === 'drainage' && '💧'}
                        {intervention.interventionType === 'other' && '📝'}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {intervention.interventionType}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(intervention.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export Button */}
            <button
              onClick={() => {
                // TODO: Implement export functionality (F060)
                alert('Export feature coming soon!')
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export Flare Report
            </button>
          </div>

          {/* Right Column - Timeline/Chart and Photos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'timeline'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Timeline ({events.length} events)
                </button>
                <button
                  onClick={() => setActiveTab('chart')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'chart'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Severity Chart
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'timeline' ? (
                  <FlareTimeline events={events} />
                ) : (
                  <SeverityChart events={events} />
                )}
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Photos ({photos.length})
              </h2>

              {photos.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-gray-500 dark:text-gray-400">
                    No photos attached to this flare yet
                  </p>
                  <button
                    onClick={() => {
                      // TODO: Implement photo upload (F046)
                      alert('Photo upload feature coming soon!')
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Add Photo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.guid}
                      className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative group cursor-pointer"
                    >
                      {/* Placeholder for encrypted photo thumbnail */}
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-12 h-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-all text-sm">
                          View
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                        <p className="text-xs text-white truncate">
                          {new Date(photo.captureTimestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <FlareUpdateModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        flare={flare}
        onSuccess={handleModalSuccess}
      />
      <FlareResolutionModal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        flare={flare}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
