'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { BodyMap, ZoomedRegionView, RegionNavigation } from '@/components/BodyMap'
import { HSLesionLegend, HSLesionStatusLegend } from '@/components/BodyMap/HSLesionMarker'
import { IHS4ScoreCard } from '@/components/hs'
import { LesionEntryModal, LesionFormData } from '@/components/hs'
import { calculateCurrentIHS4, HSLesion, IHS4Result } from '@/lib/hs'
import { generateGUID, getCurrentTimestamp, formatDateISO } from '@/lib/utils'

export default function HSPage() {
  const [lesions, setLesions] = useState<HSLesion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLesion, setSelectedLesion] = useState<HSLesion | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [capturedCoordinates, setCapturedCoordinates] = useState<{ x: number; y: number } | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'zoomed'>('overview')
  const [zoomedRegionId, setZoomedRegionId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front')

  // Load lesions from database
  const loadLesions = useCallback(async () => {
    setIsLoading(true)
    try {
      const allLesions = await db.hsLesions
        .filter((lesion) => lesion.status === 'active' || lesion.status === 'healing')
        .toArray()
      setLesions(allLesions)
    } catch (error) {
      console.error('Error loading lesions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLesions()
  }, [loadLesions])

  // Calculate IHS4 score
  const ihs4Result = useMemo<IHS4Result>(() => {
    return calculateCurrentIHS4(lesions)
  }, [lesions])

  // Get regions with lesions for body map highlighting
  const regionsWithLesions = useMemo(() => {
    return new Set(lesions.map((l) => l.regionId))
  }, [lesions])

  // Get lesion counts by region
  const lesionCounts = useMemo(() => {
    const counts = new Map<string, number>()
    lesions.forEach((lesion) => {
      const current = counts.get(lesion.regionId) || 0
      counts.set(lesion.regionId, current + 1)
    })
    return counts
  }, [lesions])

  // Handle region click on body map - zoom into region
  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId)
    setZoomedRegionId(regionId)
    setViewMode('zoomed')
  }

  // Handle back from zoomed view
  const handleBackToOverview = () => {
    setViewMode('overview')
    setZoomedRegionId(null)
  }

  // Handle adding lesion from zoomed view
  const handleAddLesionFromZoom = (coordinates: { x: number; y: number }, regionId: string) => {
    setCapturedCoordinates(coordinates)
    setSelectedRegion(regionId)
    setCreateModalOpen(true)
  }

  // Handle coordinate capture for placing lesion
  const handleCoordinateCapture = (x: number, y: number, regionId: string) => {
    setCapturedCoordinates({ x, y })
    setSelectedRegion(regionId)
    setCreateModalOpen(true)
  }

  // Handle lesion marker click
  const handleLesionClick = (lesion: HSLesion) => {
    setSelectedLesion(lesion)
    // Could open edit modal here
  }

  // Handle creating a new lesion (simplified quick-add without full observation)
  const handleCreateLesion = async (data: LesionFormData) => {
    try {
      const now = getCurrentTimestamp()
      const today = formatDateISO(new Date())
      const lesionGuid = generateGUID()

      const lesion: HSLesion = {
        guid: lesionGuid,
        regionId: data.regionId,
        coordinates: {
          x: data.coordinates.x,
          y: data.coordinates.y,
        },
        lesionType: data.lesionType,
        status: data.status,
        onsetDate: today,
        createdAt: now,
        updatedAt: now,
      }

      await db.hsLesions.add(lesion)
      loadLesions() // Reload lesions
      setCapturedCoordinates(null)
      setSelectedRegion(null)
    } catch (error) {
      console.error('Error creating lesion:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <p className="text-gray-600 dark:text-gray-400">Loading HS tracker data</p>
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
                HS Tracker
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track lesions and monitor your IHS4 score
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Body Map */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {viewMode === 'overview' ? (
                <>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Body Map
                      </h2>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Click a region to zoom in
                      </span>
                    </div>

                    {/* Body Map */}
                    <BodyMap
                      selectedRegion={selectedRegion}
                      onRegionClick={handleRegionClick}
                      onCoordinateCapture={handleCoordinateCapture}
                      highlightHSRegions={true}
                      regionsWithLesions={regionsWithLesions}
                      lesionCounts={lesionCounts}
                    />
                  </div>

                  {/* Legends */}
                  <div className="px-6 pb-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lesion Types
                      </h3>
                      <HSLesionLegend />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status Indicators
                      </h3>
                      <HSLesionStatusLegend />
                    </div>
                  </div>
                </>
              ) : zoomedRegionId ? (
                <ZoomedRegionView
                  regionId={zoomedRegionId}
                  lesions={lesions}
                  onBack={handleBackToOverview}
                  onAddLesion={handleAddLesionFromZoom}
                  onLesionClick={handleLesionClick}
                />
              ) : null}
            </div>

            {/* Region Navigation - visible when in overview mode */}
            {viewMode === 'overview' && (
              <div className="mt-6">
                <RegionNavigation
                  currentView={currentView}
                  selectedRegion={selectedRegion}
                  onRegionSelect={handleRegionClick}
                  onViewChange={setCurrentView}
                  lesionCountByRegion={lesionCounts}
                />
              </div>
            )}
          </div>

          {/* Right Column - Score & Lesion List */}
          <div className="space-y-6">
            {/* IHS4 Score Card */}
            <IHS4ScoreCard result={ihs4Result} />

            {/* Active Lesions List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Active Lesions
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {lesions.length} total
                  </span>
                </div>
              </div>

              {lesions.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No active lesions tracked
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Click on the body map to add a lesion
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                  {lesions.map((lesion) => (
                    <li
                      key={lesion.guid}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => handleLesionClick(lesion)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {lesion.lesionType.replace('_', ' ')}
                          </span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {lesion.regionId.replace(/-/g, ' ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              lesion.status === 'active'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}
                          >
                            {lesion.status}
                          </span>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Since {new Date(lesion.onsetDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setCapturedCoordinates({ x: 0.5, y: 0.5 })
                    setSelectedRegion('left-axilla-central')
                    setCreateModalOpen(true)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  + Add lesion manually
                </button>
                <Link
                  href="/hs/history"
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  View history
                </Link>
                <Link
                  href="/hs/report"
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Generate report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Lesion Entry Modal */}
      {capturedCoordinates && selectedRegion && (
        <LesionEntryModal
          isOpen={createModalOpen}
          onClose={() => {
            setCreateModalOpen(false)
            setCapturedCoordinates(null)
          }}
          onSubmit={handleCreateLesion}
          regionId={selectedRegion}
          coordinates={capturedCoordinates}
          mode="create"
        />
      )}
    </div>
  )
}
