'use client'

import { useState, useEffect } from 'react'
import { HSLesion, LesionType, LesionStatus, DrainageType } from '@/lib/hs/types'
import { getRegionById } from '@/lib/bodyMap/regions'
import { LESION_COLORS } from '@/components/BodyMap/HSLesionMarker'

interface LesionEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: LesionFormData) => void
  regionId: string
  coordinates: { x: number; y: number }
  existingLesion?: HSLesion       // For editing existing lesions
  mode: 'create' | 'edit'
}

export interface LesionFormData {
  regionId: string
  coordinates: { x: number; y: number }
  lesionType: LesionType
  status: LesionStatus
  painLevel?: number              // 1-10 scale
  drainageType?: DrainageType
  drainageAmount?: 'minimal' | 'moderate' | 'significant'
  size?: 'small' | 'medium' | 'large'
  warmth?: boolean
  tunnelLength?: number           // For draining tunnels, in cm
  notes?: string
}

const LESION_TYPE_OPTIONS: { value: LesionType; label: string; description: string }[] = [
  {
    value: 'nodule',
    label: 'Nodule',
    description: 'Firm, inflamed lump under skin (IHS4: 1 point)',
  },
  {
    value: 'abscess',
    label: 'Abscess',
    description: 'Painful, pus-filled swelling (IHS4: 2 points)',
  },
  {
    value: 'draining_tunnel',
    label: 'Draining Tunnel',
    description: 'Sinus tract with ongoing drainage (IHS4: 4 points)',
  },
]

const STATUS_OPTIONS: { value: LesionStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'healing', label: 'Healing' },
  { value: 'healed', label: 'Healed' },
  { value: 'scarred', label: 'Scarred (inactive)' },
]

const DRAINAGE_TYPE_OPTIONS: { value: DrainageType | 'none'; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'clear', label: 'Clear/serous' },
  { value: 'purulent', label: 'Purulent (thick/white/yellow)' },
  { value: 'blood-tinged', label: 'Blood-tinged' },
  { value: 'mixed', label: 'Mixed' },
]

export function LesionEntryModal({
  isOpen,
  onClose,
  onSubmit,
  regionId,
  coordinates,
  existingLesion,
  mode,
}: LesionEntryModalProps) {
  const region = getRegionById(regionId)

  const [formData, setFormData] = useState<LesionFormData>(() => ({
    regionId,
    coordinates,
    lesionType: existingLesion?.lesionType || 'nodule',
    status: existingLesion?.status || 'active',
    painLevel: undefined,
    drainageType: undefined,
    drainageAmount: undefined,
    size: undefined,
    warmth: undefined,
    tunnelLength: undefined,
    notes: '',
  }))

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setFormData({
        regionId,
        coordinates,
        lesionType: existingLesion?.lesionType || 'nodule',
        status: existingLesion?.status || 'active',
        painLevel: undefined,
        drainageType: undefined,
        drainageAmount: undefined,
        size: undefined,
        warmth: undefined,
        tunnelLength: undefined,
        notes: '',
      })
    }
  }, [isOpen, regionId, coordinates, existingLesion])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  const updateField = <K extends keyof LesionFormData>(field: K, value: LesionFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform rounded-xl bg-white dark:bg-gray-800 shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === 'create' ? 'Add Lesion' : 'Edit Lesion'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {region?.name || regionId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Lesion Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lesion Type *
              </label>
              <div className="space-y-2">
                {LESION_TYPE_OPTIONS.map((option) => {
                  const colors = LESION_COLORS[option.value]
                  return (
                    <label
                      key={option.value}
                      className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.lesionType === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="lesionType"
                        value={option.value}
                        checked={formData.lesionType === option.value}
                        onChange={() => updateField('lesionType', option.value)}
                        className="sr-only"
                      />
                      <span
                        className="w-4 h-4 rounded-full mr-3 mt-0.5 flex-shrink-0"
                        style={{ backgroundColor: colors.fill }}
                      />
                      <div>
                        <span className="block font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value as LesionStatus)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pain Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pain Level (1-10)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.painLevel || 5}
                  onChange={(e) => updateField('painLevel', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                  {formData.painLevel || '-'}
                </span>
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Size
              </label>
              <div className="flex gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => updateField('size', formData.size === size ? undefined : size)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm capitalize transition-colors ${
                      formData.size === size
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Warmth */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.warmth || false}
                  onChange={(e) => updateField('warmth', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Area feels warm to touch
                </span>
              </label>
            </div>

            {/* Drainage (show for abscess and draining tunnel) */}
            {(formData.lesionType === 'abscess' || formData.lesionType === 'draining_tunnel') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Drainage Type
                </label>
                <select
                  value={formData.drainageType || 'none'}
                  onChange={(e) => {
                    const value = e.target.value
                    updateField('drainageType', value === 'none' ? undefined : value as DrainageType)
                  }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                >
                  {DRAINAGE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tunnel Length (show for draining tunnel) */}
            {formData.lesionType === 'draining_tunnel' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Tunnel Length (cm)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.tunnelLength || ''}
                  onChange={(e) => updateField('tunnelLength', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="e.g., 2.5"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={2}
                placeholder="Any additional observations..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {mode === 'create' ? 'Add Lesion' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
