'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { PhotoAttachment, PhotoComparison } from '@/lib/db'
import { getPhotos, getAllPhotoTags, getPhotosByBodyRegion } from '@/lib/photos/uploadPhoto'
import {
  getAllComparisons,
  createComparison,
  deleteComparison,
  getComparisonWithPhotos,
} from '@/lib/photos/createComparison'
import {
  PhotoCapture,
  PhotoGallery,
  PhotoViewer,
  PhotoAnnotator,
  PhotoComparisonView,
} from '@/components/Photos'

type ViewMode = 'gallery' | 'comparisons'
type SortBy = 'newest' | 'oldest'

export default function PhotosPage() {
  const [photos, setPhotos] = useState<PhotoAttachment[]>([])
  const [comparisons, setComparisons] = useState<PhotoComparison[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('gallery')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [filterBodyRegion, setFilterBodyRegion] = useState<string>('all')
  const [filterTag, setFilterTag] = useState<string>('all')
  const [allTags, setAllTags] = useState<string[]>([])
  const [bodyRegions, setBodyRegions] = useState<string[]>([])

  // Modal states
  const [showCapture, setShowCapture] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoAttachment | null>(null)
  const [annotatingPhoto, setAnnotatingPhoto] = useState<PhotoAttachment | null>(null)
  const [showComparisonModal, setShowComparisonModal] = useState(false)
  const [selectedComparison, setSelectedComparison] = useState<{
    comparison: PhotoComparison
    beforePhoto: PhotoAttachment
    afterPhoto: PhotoAttachment
  } | null>(null)

  // Comparison creation
  const [isCreatingComparison, setIsCreatingComparison] = useState(false)
  const [selectedPhotosForComparison, setSelectedPhotosForComparison] = useState<string[]>([])
  const [comparisonTitle, setComparisonTitle] = useState('')
  const [comparisonNotes, setComparisonNotes] = useState('')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Get photos with filters
      const photoFilters: Parameters<typeof getPhotos>[0] = {}

      if (filterBodyRegion !== 'all') {
        photoFilters.bodyRegion = filterBodyRegion
      }

      if (filterTag !== 'all') {
        photoFilters.tags = [filterTag]
      }

      let loadedPhotos = await getPhotos(photoFilters)

      // Sort photos
      loadedPhotos = loadedPhotos.sort((a, b) => {
        if (sortBy === 'newest') {
          return b.captureTimestamp - a.captureTimestamp
        }
        return a.captureTimestamp - b.captureTimestamp
      })

      setPhotos(loadedPhotos)

      // Get all tags and body regions for filters
      const tags = await getAllPhotoTags()
      setAllTags(tags)

      const photosByRegion = await getPhotosByBodyRegion()
      setBodyRegions(Object.keys(photosByRegion).filter((r) => r !== 'unassigned'))

      // Get comparisons
      const loadedComparisons = await getAllComparisons()
      setComparisons(loadedComparisons)
    } catch (error) {
      console.error('Error loading photos:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filterBodyRegion, filterTag, sortBy])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handlePhotoClick = (photo: PhotoAttachment) => {
    if (isCreatingComparison) {
      // Toggle selection for comparison
      setSelectedPhotosForComparison((prev) => {
        if (prev.includes(photo.guid)) {
          return prev.filter((id) => id !== photo.guid)
        }
        if (prev.length < 2) {
          return [...prev, photo.guid]
        }
        // Replace the first selection if already have 2
        return [prev[1], photo.guid]
      })
    } else {
      setSelectedPhoto(photo)
    }
  }

  const handleCreateComparison = async () => {
    if (selectedPhotosForComparison.length !== 2 || !comparisonTitle.trim()) {
      return
    }

    try {
      await createComparison({
        beforePhotoId: selectedPhotosForComparison[0],
        afterPhotoId: selectedPhotosForComparison[1],
        title: comparisonTitle,
        notes: comparisonNotes || undefined,
      })

      // Reset state
      setIsCreatingComparison(false)
      setSelectedPhotosForComparison([])
      setComparisonTitle('')
      setComparisonNotes('')

      // Reload data
      loadData()
    } catch (error) {
      console.error('Error creating comparison:', error)
    }
  }

  const handleViewComparison = async (comparison: PhotoComparison) => {
    const data = await getComparisonWithPhotos(comparison.guid)
    if (data) {
      setSelectedComparison(data)
    }
  }

  const handleDeleteComparison = async (guid: string) => {
    if (confirm('Delete this comparison?')) {
      await deleteComparison(guid)
      loadData()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading photos...</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Photo Gallery</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {photos.length} photo{photos.length !== 1 ? 's' : ''} |{' '}
                {comparisons.length} comparison{comparisons.length !== 1 ? 's' : ''}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* View Mode Tabs */}
          <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'gallery'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              } transition-colors`}
            >
              Gallery
            </button>
            <button
              onClick={() => setViewMode('comparisons')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'comparisons'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              } transition-colors`}
            >
              Comparisons
            </button>
          </div>

          {/* Filters (gallery mode) */}
          {viewMode === 'gallery' && !isCreatingComparison && (
            <div className="flex items-center gap-4 flex-wrap">
              {/* Body Region Filter */}
              <select
                value={filterBodyRegion}
                onChange={(e) => setFilterBodyRegion(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Regions</option>
                {bodyRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>

              {/* Tag Filter */}
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {viewMode === 'gallery' && !isCreatingComparison && (
              <>
                <button
                  onClick={() => setIsCreatingComparison(true)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Create Comparison
                </button>
                <button
                  onClick={() => setShowCapture(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  + Add Photo
                </button>
              </>
            )}
          </div>
        </div>

        {/* Comparison Creation Mode */}
        {isCreatingComparison && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              Create Before/After Comparison
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Select 2 photos to compare. First selection will be &quot;Before&quot;, second will be &quot;After&quot;.
            </p>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-48">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={comparisonTitle}
                  onChange={(e) => setComparisonTitle(e.target.value)}
                  placeholder="e.g., Treatment Progress Week 1-4"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex-1 min-w-48">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={comparisonNotes}
                  onChange={(e) => setComparisonNotes(e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected: {selectedPhotosForComparison.length}/2 photos
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsCreatingComparison(false)
                    setSelectedPhotosForComparison([])
                    setComparisonTitle('')
                    setComparisonNotes('')
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateComparison}
                  disabled={selectedPhotosForComparison.length !== 2 || !comparisonTitle.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Comparison
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {viewMode === 'gallery' ? (
          <PhotoGallery
            photos={photos}
            onPhotoClick={handlePhotoClick}
            onRefresh={loadData}
            selectable={isCreatingComparison}
            selectedPhotos={selectedPhotosForComparison}
            onSelectionChange={setSelectedPhotosForComparison}
          />
        ) : (
          <div>
            {comparisons.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📸</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Comparisons Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create before/after comparisons to track your progress over time.
                </p>
                <button
                  onClick={() => {
                    setViewMode('gallery')
                    setIsCreatingComparison(true)
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Your First Comparison
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparisons.map((comparison) => (
                  <div
                    key={comparison.guid}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {comparison.title}
                    </h3>
                    {comparison.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {comparison.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                      Created {new Date(comparison.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewComparison(comparison)}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteComparison(comparison.guid)}
                        className="px-3 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Photo Capture Modal */}
      {showCapture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCapture(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Photo</h2>
              <button
                onClick={() => setShowCapture(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <PhotoCapture
                onPhotoUploaded={() => {
                  setShowCapture(false)
                  loadData()
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      <PhotoViewer
        photo={selectedPhoto}
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onPhotoUpdated={loadData}
        onOpenAnnotator={(photo) => {
          setSelectedPhoto(null)
          setAnnotatingPhoto(photo)
        }}
      />

      {/* Photo Annotator */}
      <PhotoAnnotator
        photo={annotatingPhoto}
        isOpen={!!annotatingPhoto}
        onClose={() => setAnnotatingPhoto(null)}
        onSaved={loadData}
      />

      {/* Comparison View Modal */}
      {selectedComparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedComparison(null)}
          />
          <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <PhotoComparisonView
              comparison={selectedComparison.comparison}
              beforePhoto={selectedComparison.beforePhoto}
              afterPhoto={selectedComparison.afterPhoto}
              onClose={() => setSelectedComparison(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
