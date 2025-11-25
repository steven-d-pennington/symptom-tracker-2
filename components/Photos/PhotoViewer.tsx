'use client'

import { useState, useEffect } from 'react'
import { PhotoAttachment } from '@/lib/db'
import { getFullImageUrl, updatePhoto } from '@/lib/photos/uploadPhoto'

interface PhotoViewerProps {
  photo: PhotoAttachment | null
  isOpen: boolean
  onClose: () => void
  onPhotoUpdated?: () => void
  onOpenAnnotator?: (photo: PhotoAttachment) => void
}

export function PhotoViewer({
  photo,
  isOpen,
  onClose,
  onPhotoUpdated,
  onOpenAnnotator,
}: PhotoViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTags, setEditTags] = useState<string[]>([])
  const [editNotes, setEditNotes] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load full image
  useEffect(() => {
    if (!photo || !isOpen) {
      setImageUrl(null)
      return
    }

    setIsLoading(true)
    getFullImageUrl(photo)
      .then((url) => {
        setImageUrl(url)
      })
      .finally(() => {
        setIsLoading(false)
      })

    setEditTags(photo.tags)
    setEditNotes(photo.notes || '')

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [photo, isOpen])

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !editTags.includes(tag)) {
      setEditTags([...editTags, tag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter((t) => t !== tagToRemove))
  }

  const handleSave = async () => {
    if (!photo) return

    setIsSaving(true)
    try {
      await updatePhoto(photo.guid, {
        tags: editTags,
        notes: editNotes || undefined,
      })
      setIsEditing(false)
      onPhotoUpdated?.()
    } catch (error) {
      console.error('Error saving photo:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen || !photo) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full h-full flex flex-col max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-white">
            <p className="text-sm opacity-70">
              {new Date(photo.captureTimestamp).toLocaleString()}
            </p>
            {photo.bodyRegion && (
              <p className="text-sm">
                Body Region: <span className="font-medium">{photo.bodyRegion}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenAnnotator && (
              <button
                onClick={() => onOpenAnnotator(photo)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
              >
                Annotate
              </button>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Image */}
          <div className="flex-1 flex items-center justify-center">
            {isLoading ? (
              <div className="animate-pulse">
                <svg
                  className="w-16 h-16 text-gray-400"
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
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={photo.notes || 'Photo'}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            ) : (
              <div className="text-gray-400 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-2"
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
                <p>Failed to decrypt image</p>
              </div>
            )}
          </div>

          {/* Side panel (when editing) */}
          {isEditing && (
            <div className="w-80 bg-gray-800 rounded-lg p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Edit Photo Details</h3>

              {/* Tags */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-full text-sm"
                    >
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-blue-200">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes..."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                />
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>

              {/* Photo info */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Photo Info</h4>
                <dl className="text-sm text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <dt>Size:</dt>
                    <dd>{(photo.sizeBytes / 1024).toFixed(1)} KB</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Dimensions:</dt>
                    <dd>
                      {photo.width} x {photo.height}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Type:</dt>
                    <dd>{photo.mimeType}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Captured:</dt>
                    <dd>{new Date(photo.captureTimestamp).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Notes display (when not editing) */}
        {!isEditing && photo.notes && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-white">{photo.notes}</p>
          </div>
        )}

        {/* Tags display (when not editing) */}
        {!isEditing && photo.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {photo.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-600/50 text-blue-200 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
