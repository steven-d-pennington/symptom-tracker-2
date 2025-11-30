'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { db, BodyImagePreference } from '@/lib/db'
import { BodyMap, ZoomedRegionView, GroupZoomView, RegionNavigation, RegionLesionData } from '@/components/BodyMap'
import { HS_REGION_GROUPS, type HSRegionGroup } from '@/lib/bodyMap/regions'
import { getUserSettings } from '@/lib/settings/userSettings'
import { HSLesionLegend, HSLesionStatusLegend } from '@/components/BodyMap/HSLesionMarker'
import { IHS4ScoreCard } from '@/components/hs'
import { LesionEntryModal, LesionFormData } from '@/components/hs'
import { calculateCurrentIHS4, HSLesion, IHS4Result } from '@/lib/hs'
import { generateGUID, getCurrentTimestamp, formatDateISO } from '@/lib/utils'
import { get3DPositionForLesion } from '@/lib/bodyMap/regionMapping'
import type { Region3D } from '@/components/BodyMap3D/BodyMap3D'

// Dynamic import for 3D body map to avoid SSR issues with Three.js
const BodyMap3D = dynamic(
  () => import('@/components/BodyMap3D/BodyMap3D').then(mod => mod.BodyMap3D),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading 3D viewer...</p>
        </div>
      </div>
    )
  }
)

export default function HSPage() {
  const [lesions, setLesions] = useState<HSLesion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLesion, setSelectedLesion] = useState<HSLesion | null>(null)
  const [bodyImagePreference, setBodyImagePreference] = useState<BodyImagePreference | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [capturedCoordinates, setCapturedCoordinates] = useState<{ x: number; y: number } | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'group-zoom' | 'region-zoom'>('overview')
  const [zoomedRegionId, setZoomedRegionId] = useState<string | null>(null)
  const [zoomedGroup, setZoomedGroup] = useState<HSRegionGroup | null>(null)
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front')
  const [dimensionMode, setDimensionMode] = useState<'2d' | '3d'>('2d')

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

  // Load user settings including body image preference
  const loadSettings = useCallback(async () => {
    try {
      const settings = await getUserSettings()
      if (settings?.bodyImagePreference) {
        setBodyImagePreference(settings.bodyImagePreference)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }, [])

  useEffect(() => {
    loadLesions()
    loadSettings()
  }, [loadLesions, loadSettings])

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

  // Get detailed lesion data by region (for glow/dots/tooltip)
  const regionLesionData = useMemo(() => {
    const dataMap = new Map<string, RegionLesionData>()

    lesions.forEach((lesion) => {
      const existing = dataMap.get(lesion.regionId) || {
        nodules: 0,
        abscesses: 0,
        drainingTunnels: 0,
        severity: 'none' as const,
      }

      if (lesion.lesionType === 'nodule') existing.nodules++
      else if (lesion.lesionType === 'abscess') existing.abscesses++
      else if (lesion.lesionType === 'draining_tunnel') existing.drainingTunnels++

      dataMap.set(lesion.regionId, existing)
    })

    // Calculate severity for each region based on IHS4 contribution
    // IHS4: nodules=1, abscesses=2, tunnels=4
    dataMap.forEach((data, regionId) => {
      const regionScore = data.nodules * 1 + data.abscesses * 2 + data.drainingTunnels * 4

      if (regionScore === 0) data.severity = 'none'
      else if (regionScore <= 3) data.severity = 'mild'
      else if (regionScore <= 10) data.severity = 'moderate'
      else data.severity = 'severe'

      dataMap.set(regionId, data)
    })

    return dataMap
  }, [lesions])

  // Handle region click on body map - check if it's a group or individual region
  const handleRegionClick = (regionId: string) => {
    // Check if clicked ID is an HS region group
    const group = HS_REGION_GROUPS.find(g => g.id === regionId)

    if (group) {
      // It's a group - go to group zoom view and remember which view we came from
      setCurrentView(group.view)
      setZoomedGroup(group)
      setViewMode('group-zoom')
    } else {
      // It's an individual region - go directly to region zoom
      setSelectedRegion(regionId)
      setZoomedRegionId(regionId)
      setViewMode('region-zoom')
    }
  }

  // Handle sub-region click from group zoom view
  const handleSubRegionClick = (regionId: string) => {
    setSelectedRegion(regionId)
    setZoomedRegionId(regionId)
    setViewMode('region-zoom')
  }

  // Handle back from region zoom view
  const handleBackFromRegion = () => {
    if (zoomedGroup) {
      // Go back to group zoom
      setViewMode('group-zoom')
      setZoomedRegionId(null)
    } else {
      // Go back to overview
      setViewMode('overview')
      setZoomedRegionId(null)
    }
  }

  // Handle back from group zoom view
  const handleBackFromGroup = () => {
    setViewMode('overview')
    setZoomedGroup(null)
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

  // Handle 3D region selection - switch to 2D zoom for precise placement
  const handle3DRegionSelect = (region: Region3D) => {
    // Map 3D region IDs to 2D group IDs
    const region3DToGroupMap: Record<string, string> = {
      'axilla-left': 'left-axilla-group',
      'axilla-right': 'right-axilla-group',
      'groin-left': 'left-groin-group',
      'groin-right': 'right-groin-group',
      'inner-thigh-left': 'left-groin-group',
      'inner-thigh-right': 'right-groin-group',
      'inframammary-left': 'left-chest-group',
      'inframammary-right': 'right-chest-group',
      'buttock-left': 'left-buttock-group',
      'buttock-right': 'right-buttock-group',
      'gluteal-fold-left': 'left-buttock-group',
      'gluteal-fold-right': 'right-buttock-group',
      'waist-left': 'waistband-front-group',
      'waist-right': 'waistband-front-group',
      'lower-abdomen': 'waistband-front-group',
      'lower-back': 'lower-back-group',
    }

    const groupId = region3DToGroupMap[region.id]
    const group = groupId ? HS_REGION_GROUPS.find(g => g.id === groupId) : null

    if (group) {
      // Switch to 2D mode and zoom to the group
      setDimensionMode('2d')
      setCurrentView(group.view)
      setZoomedGroup(group)
      setViewMode('group-zoom')
    } else {
      // Fallback: just switch to 2D overview
      setDimensionMode('2d')
      setViewMode('overview')
    }
  }

  // Handle creating a new lesion (simplified quick-add without full observation)
  const handleCreateLesion = async (data: LesionFormData) => {
    try {
      const now = getCurrentTimestamp()
      const today = formatDateISO(new Date())
      const lesionGuid = generateGUID()

      // Compute 3D position from 2D coordinates for display in 3D view
      const position3D = get3DPositionForLesion(data.regionId, data.coordinates)

      const lesion: HSLesion = {
        guid: lesionGuid,
        regionId: data.regionId,
        coordinates: {
          x: data.coordinates.x,
          y: data.coordinates.y,
          ...(position3D && { position3D }),
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
                      <div className="flex items-center gap-3">
                        {/* 2D/3D Toggle */}
                        <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                          <button
                            onClick={() => setDimensionMode('2d')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                              dimensionMode === '2d'
                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            2D
                          </button>
                          <button
                            onClick={() => {
                              setDimensionMode('3d')
                              setViewMode('overview') // Reset to overview when switching to 3D
                            }}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                              dimensionMode === '3d'
                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            3D
                          </button>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {dimensionMode === '2d' ? 'Click a region to zoom in' : 'Click a region to add lesion'}
                        </span>
                      </div>
                    </div>

                    {/* Body Map - 2D or 3D based on mode */}
                    {dimensionMode === '2d' ? (
                      <BodyMap
                        selectedRegion={selectedRegion}
                        onRegionClick={handleRegionClick}
                        onCoordinateCapture={handleCoordinateCapture}
                        highlightHSRegions={true}
                        regionsWithLesions={regionsWithLesions}
                        lesionCounts={lesionCounts}
                        regionLesionData={regionLesionData}
                        bodyImagePreference={bodyImagePreference}
                        view={currentView}
                        onViewChange={setCurrentView}
                      />
                    ) : (
                      <div className="relative">
                        <BodyMap3D
                          className="w-full"
                          onRegionSelect={handle3DRegionSelect}
                          lesions={lesions}
                          selectedLesionId={selectedLesion?.guid}
                          onLesionClick={handleLesionClick}
                        />
                        <div className="absolute bottom-4 left-4 right-4 bg-amber-50/90 dark:bg-amber-900/80 backdrop-blur-sm rounded-lg p-3 text-sm">
                          <p className="text-amber-800 dark:text-amber-200">
                            <strong>Tip:</strong> Click on a highlighted region to switch to 2D view for precise lesion placement.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Legends - show for both 2D and 3D */}
                  <div className="px-6 pb-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lesion Types
                      </h3>
                      <HSLesionLegend />
                    </div>
                    {dimensionMode === '2d' && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Status Indicators
                        </h3>
                        <HSLesionStatusLegend />
                      </div>
                    )}
                  </div>
                </>
              ) : viewMode === 'group-zoom' && zoomedGroup ? (
                <GroupZoomView
                  group={zoomedGroup}
                  lesions={lesions}
                  onBack={handleBackFromGroup}
                  onSubRegionClick={handleSubRegionClick}
                />
              ) : viewMode === 'region-zoom' && zoomedRegionId ? (
                <ZoomedRegionView
                  regionId={zoomedRegionId}
                  lesions={lesions}
                  onBack={handleBackFromRegion}
                  onAddLesion={handleAddLesionFromZoom}
                  onLesionClick={handleLesionClick}
                />
              ) : null}
            </div>

            {/* Region Navigation - visible when in 2D overview mode */}
            {viewMode === 'overview' && dimensionMode === '2d' && (
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
