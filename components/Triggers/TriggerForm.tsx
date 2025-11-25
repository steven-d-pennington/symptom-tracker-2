'use client'

import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Trigger } from '@/lib/db'
import { createTrigger, updateTrigger, TriggerCategory } from '@/lib/triggers/manageTrigger'

interface TriggerFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  editTrigger?: Trigger | null
}

const CATEGORY_OPTIONS: { value: TriggerCategory; label: string; icon: string }[] = [
  { value: 'environmental', label: 'Environmental', icon: '🌍' },
  { value: 'lifestyle', label: 'Lifestyle', icon: '🏃' },
  { value: 'dietary', label: 'Dietary', icon: '🍽️' },
]

export function TriggerForm({ isOpen, onClose, onSuccess, editTrigger }: TriggerFormProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<TriggerCategory>('lifestyle')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!editTrigger

  useEffect(() => {
    if (isOpen && editTrigger) {
      setName(editTrigger.name)
      setCategory(editTrigger.category)
      setDescription(editTrigger.description || '')
    } else if (isOpen) {
      resetForm()
    }
  }, [isOpen, editTrigger])

  const resetForm = () => {
    setName('')
    setCategory('lifestyle')
    setDescription('')
    setError(null)
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a trigger name')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (isEditing && editTrigger) {
        await updateTrigger(editTrigger.guid, {
          name: name.trim(),
          category,
          description: description.trim() || undefined,
        })
      } else {
        await createTrigger({
          name: name.trim(),
          category,
          description: description.trim() || undefined,
        })
      }

      onClose()
      if (onSuccess) {
        onSuccess()
      }
      resetForm()
    } catch (err) {
      console.error('Error saving trigger:', err)
      setError(err instanceof Error ? err.message : 'Failed to save trigger')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={isEditing ? 'Edit Trigger' : 'Add Trigger'}
      size="md"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Trigger Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          placeholder="e.g., Lack of Sleep, Spicy Food"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setCategory(option.value)}
              disabled={isSubmitting}
              className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                category === option.value
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              } disabled:opacity-50`}
            >
              <span className="text-xl mb-1">{option.icon}</span>
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          placeholder="Brief description of this trigger..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
          maxLength={200}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !name.trim()}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : isEditing ? (
            'Update Trigger'
          ) : (
            'Add Trigger'
          )}
        </button>
      </div>
    </Modal>
  )
}
