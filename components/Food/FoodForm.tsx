'use client'

import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Food } from '@/lib/db'
import {
  createFood,
  updateFood,
  ALLERGEN_TAGS,
  FOOD_CATEGORIES,
  PreparationMethod,
} from '@/lib/food/manageFood'

interface FoodFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  editFood?: Food | null
}

const PREPARATION_METHODS: { value: PreparationMethod; label: string }[] = [
  { value: 'raw', label: 'Raw' },
  { value: 'cooked', label: 'Cooked' },
  { value: 'fried', label: 'Fried' },
  { value: 'baked', label: 'Baked' },
]

export function FoodForm({ isOpen, onClose, onSuccess, editFood }: FoodFormProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<string>('Other')
  const [allergenTags, setAllergenTags] = useState<string[]>([])
  const [preparationMethod, setPreparationMethod] = useState<PreparationMethod | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when editing food changes
  useEffect(() => {
    if (editFood) {
      setName(editFood.name)
      setCategory(editFood.category)
      setAllergenTags(editFood.allergenTags)
      setPreparationMethod(editFood.preparationMethod || '')
    } else {
      resetForm()
    }
  }, [editFood])

  const resetForm = () => {
    setName('')
    setCategory('Other')
    setAllergenTags([])
    setPreparationMethod('')
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const toggleAllergen = (tag: string) => {
    setAllergenTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Food name is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (editFood) {
        await updateFood(editFood.guid, {
          name: name.trim(),
          category,
          allergenTags,
          preparationMethod: preparationMethod || undefined,
        })
      } else {
        await createFood({
          name: name.trim(),
          category,
          allergenTags,
          preparationMethod: preparationMethod || undefined,
        })
      }

      handleClose()
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Error saving food:', err)
      setError(err instanceof Error ? err.message : 'Failed to save food')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editFood ? 'Edit Food' : 'Add Food'}
      size="lg"
    >
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Food Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Avocado"
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
          maxLength={100}
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
        >
          {FOOD_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Preparation Method */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Preparation Method (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPreparationMethod('')}
            disabled={isSubmitting}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              preparationMethod === ''
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            } disabled:opacity-50`}
          >
            None
          </button>
          {PREPARATION_METHODS.map((method) => (
            <button
              key={method.value}
              onClick={() => setPreparationMethod(method.value)}
              disabled={isSubmitting}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                preparationMethod === method.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              } disabled:opacity-50`}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>

      {/* Allergen Tags */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Allergen Tags (optional)
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Select any allergens or special dietary considerations for this food.
        </p>
        <div className="flex flex-wrap gap-2">
          {ALLERGEN_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleAllergen(tag)}
              disabled={isSubmitting}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                allergenTags.includes(tag)
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              } disabled:opacity-50`}
            >
              {tag}
            </button>
          ))}
        </div>
        {allergenTags.length > 0 && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Selected: {allergenTags.join(', ')}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !name.trim()}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : editFood ? (
            'Save Changes'
          ) : (
            'Add Food'
          )}
        </button>
      </div>
    </Modal>
  )
}
