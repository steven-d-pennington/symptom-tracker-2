'use client'

import { useState, useEffect, useCallback } from 'react'
import { PhotoAttachment } from '@/lib/db'
import { getPhotos, getThumbnailUrl, deletePhoto } from '@/lib/photos/uploadPhoto'

interface PhotoGalleryProps {
  photos: PhotoAttachment[]
  onPhotoClick?: (photo: PhotoAttachment) => void
  onPhotoDelete?: (guid: string) => void
  onRefresh?: () => void
  selectable?: boolean
  selectedPhotos?: string[]
  onSelectionChange?: (selectedGuids: string[]) => void
}

interface PhotoThumbnail {
  guid: string
  url: string | null
  loading: boolean
}

export function PhotoGallery({
  photos,
  onPhotoClick,
  onPhotoDelete,
  onRefresh,
  selectable = false,
  selectedPhotos = [],
  onSelectionChange,
}: PhotoGalleryProps) {
  const [thumbnails, setThumbnails] = useState<Map<string, PhotoThumbnail>>(new Map())
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Load thumbnails
  useEffect(() => {
    const loadThumbnails = async () => {
      for (const photo of photos) {
        if (!thumbnails.has(photo.guid)) {
          setThumbnails((prev) => {
            const newMap = new Map(prev)
            newMap.set(photo.guid, { guid: photo.guid, url: null, loading: true })
            return newMap
          })

          const url = await getThumbnailUrl(photo)

          setThumbnails((prev) => {
            const newMap = new Map(prev)
            newMap.set(photo.guid, { guid: photo.guid, url, loading: false })
            return newMap
          })
        }
      }
    }

    loadThumbnails()
  }, [photos])

  const handleDelete = async (guid: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this photo?')) return

    setDeletingId(guid)
    try {
      await deletePhoto(guid)
      onPhotoDelete?.(guid)
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting photo:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSelect = (guid: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!selectable) return

    const newSelection = selectedPhotos.includes(guid)
      ? selectedPhotos.filter((id) => id !== guid)
      : [...selectedPhotos, guid]

    onSelectionChange?.(newSelection)
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📷</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Photos Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Capture or upload photos to document your symptoms
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {photos.map((photo) => {
        const thumbnail = thumbnails.get(photo.guid)
        const isSelected = selectedPhotos.includes(photo.guid)
        const isDeleting = deletingId === photo.guid

        return (
          <div
            key={photo.guid}
            onClick={() => onPhotoClick?.(photo)}
            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            } ${isDeleting ? 'opacity-50' : ''}`}
          >
            {/* Thumbnail */}
            {thumbnail?.loading ? (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            ) : thumbnail?.url ? (
              <img
                src={thumbnail.url}
                alt={photo.notes || 'Photo'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

            {/* Selection checkbox */}
            {selectable && (
              <button
                onClick={(e) => handleSelect(photo.guid, e)}
                className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white/80 border-gray-400 text-transparent hover:border-blue-500'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            )}

            {/* Delete button */}
            <button
              onClick={(e) => handleDelete(photo.guid, e)}
              disabled={isDeleting}
              className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>

            {/* Tags indicator */}
            {photo.tags.length > 0 && (
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-white text-xs">
                {photo.tags.length} tag{photo.tags.length > 1 ? 's' : ''}
              </div>
            )}

            {/* Date */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-white text-xs">
              {new Date(photo.captureTimestamp).toLocaleDateString()}
            </div>
          </div>
        )
      })}
    </div>
  )
}
