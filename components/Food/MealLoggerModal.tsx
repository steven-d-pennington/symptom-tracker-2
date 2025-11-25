'use client'

import { useState, useEffect, useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { Food } from '@/lib/db'
import { logMeal, getActiveFoods, MealType, PortionSize } from '@/lib/food/logMeal'

interface MealLoggerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const MEAL_TYPES: { value: MealType; label: string; icon: string }[] = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
]

const PORTION_SIZES: { value: PortionSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

export function MealLoggerModal({ isOpen, onClose, onSuccess }: MealLoggerModalProps) {
  const [foods, setFoods] = useState<Food[]>([])
  const [selectedFoods, setSelectedFoods] = useState<string[]>([])
  const [portionSizes, setPortionSizes] = useState<Record<string, PortionSize>>({})
  const [mealType, setMealType] = useState<MealType>('lunch')
  const [timestamp, setTimestamp] = useState(new Date())
  const [notes, setNotes] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load foods
  useEffect(() => {
    async function loadFoods() {
      try {
        const activeFoods = await getActiveFoods()
        setFoods(activeFoods)
      } catch (err) {
        console.error('Error loading foods:', err)
      }
    }

    if (isOpen) {
      loadFoods()
    }
  }, [isOpen])

  // Group foods by category
  const foodsByCategory = useMemo(() => {
    const filtered = searchQuery
      ? foods.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : foods

    return filtered.reduce(
      (acc, food) => {
        if (!acc[food.category]) {
          acc[food.category] = []
        }
        acc[food.category].push(food)
        return acc
      },
      {} as Record<string, Food[]>
    )
  }, [foods, searchQuery])

  const toggleFood = (foodId: string) => {
    setSelectedFoods((prev) => {
      if (prev.includes(foodId)) {
        // Remove food
        const newPortions = { ...portionSizes }
        delete newPortions[foodId]
        setPortionSizes(newPortions)
        return prev.filter((id) => id !== foodId)
      } else {
        // Add food with default medium portion
        setPortionSizes((p) => ({ ...p, [foodId]: 'medium' }))
        return [...prev, foodId]
      }
    })
  }

  const updatePortionSize = (foodId: string, size: PortionSize) => {
    setPortionSizes((prev) => ({ ...prev, [foodId]: size }))
  }

  const handleSubmit = async () => {
    if (selectedFoods.length === 0) {
      setError('Please select at least one food')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await logMeal({
        foodIds: selectedFoods,
        mealType,
        portionSizes,
        timestamp: timestamp.getTime(),
        notes: notes || undefined,
      })

      onClose()
      if (onSuccess) {
        onSuccess()
      }
      resetForm()
    } catch (err) {
      console.error('Error logging meal:', err)
      setError(err instanceof Error ? err.message : 'Failed to log meal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedFoods([])
    setPortionSizes({})
    setMealType('lunch')
    setTimestamp(new Date())
    setNotes('')
    setSearchQuery('')
    setError(null)
  }

  const handleCancel = () => {
    resetForm()
    onClose()
  }

  // Get selected food objects
  const selectedFoodObjects = foods.filter((f) => selectedFoods.includes(f.guid))

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Log Meal" size="xl">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Meal Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Meal Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {MEAL_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setMealType(type.value)}
              disabled={isSubmitting}
              className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                mealType === type.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              } disabled:opacity-50`}
            >
              <span className="text-xl mb-1">{type.icon}</span>
              <span className="text-sm">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Timestamp */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          When did you eat?
        </label>
        <input
          type="datetime-local"
          value={timestamp.toISOString().slice(0, 16)}
          onChange={(e) => setTimestamp(new Date(e.target.value))}
          disabled={isSubmitting}
          max={new Date().toISOString().slice(0, 16)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      {/* Selected Foods */}
      {selectedFoodObjects.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Selected Foods ({selectedFoodObjects.length})
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
            {selectedFoodObjects.map((food) => (
              <div
                key={food.guid}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFood(food.guid)}
                    disabled={isSubmitting}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    aria-label={`Remove ${food.name}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <span className="text-gray-900 dark:text-gray-100">{food.name}</span>
                  {food.allergenTags.length > 0 && (
                    <span className="text-xs text-orange-600 dark:text-orange-400">
                      ({food.allergenTags.join(', ')})
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {PORTION_SIZES.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => updatePortionSize(food.guid, size.value)}
                      disabled={isSubmitting}
                      className={`px-2 py-1 text-xs rounded transition-all ${
                        portionSizes[food.guid] === size.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      } disabled:opacity-50`}
                    >
                      {size.label[0]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Food Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Add Foods <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search foods..."
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      {/* Food Categories */}
      <div className="mb-6 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        {Object.entries(foodsByCategory).map(([category, categoryFoods]) => (
          <div key={category} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div className="sticky top-0 bg-gray-100 dark:bg-gray-800 px-3 py-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              {category}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
              {categoryFoods.map((food) => (
                <button
                  key={food.guid}
                  onClick={() => toggleFood(food.guid)}
                  disabled={isSubmitting}
                  className={`text-left px-3 py-2 rounded-lg border transition-all text-sm ${
                    selectedFoods.includes(food.guid)
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-2">
                    {selectedFoods.includes(food.guid) && (
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span className="truncate">{food.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
          placeholder="Any additional details about this meal..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          maxLength={500}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{notes.length}/500 characters</p>
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
          disabled={isSubmitting || selectedFoods.length === 0}
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
              Logging...
            </>
          ) : (
            'Log Meal'
          )}
        </button>
      </div>
    </Modal>
  )
}
