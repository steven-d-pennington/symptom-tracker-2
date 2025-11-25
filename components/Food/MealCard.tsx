'use client'

import { useState, useEffect } from 'react'
import { FoodEvent, Food } from '@/lib/db'
import { db } from '@/lib/db'

interface MealCardProps {
  meal: FoodEvent
  onDelete?: (guid: string) => void
}

const MEAL_TYPE_ICONS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
}

const PORTION_LABELS: Record<string, string> = {
  small: 'S',
  medium: 'M',
  large: 'L',
}

export function MealCard({ meal, onDelete }: MealCardProps) {
  const [foods, setFoods] = useState<Food[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    async function loadFoods() {
      const foodsData = await db.foods
        .where('guid')
        .anyOf(meal.foodIds)
        .toArray()
      setFoods(foodsData)
    }
    loadFoods()
  }, [meal.foodIds])

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const mealTypeLabel = meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{MEAL_TYPE_ICONS[meal.mealType]}</span>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {mealTypeLabel}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(meal.timestamp)} at {formatTime(meal.timestamp)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {foods.length} {foods.length === 1 ? 'item' : 'items'}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Food preview (collapsed) */}
        {!isExpanded && foods.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {foods.slice(0, 5).map((food) => (
              <span
                key={food.guid}
                className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
              >
                {food.name}
              </span>
            ))}
            {foods.length > 5 && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                +{foods.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {/* Foods list with portions */}
          <div className="space-y-2">
            {foods.map((food) => (
              <div
                key={food.guid}
                className="flex items-center justify-between py-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 dark:text-gray-100">{food.name}</span>
                  {food.allergenTags.length > 0 && (
                    <span className="text-xs text-orange-600 dark:text-orange-400">
                      ({food.allergenTags.join(', ')})
                    </span>
                  )}
                </div>
                <span className="text-sm px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                  {PORTION_LABELS[meal.portionSizes[food.guid]] || 'M'}
                </span>
              </div>
            ))}
          </div>

          {/* Notes */}
          {meal.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">{meal.notes}</p>
            </div>
          )}

          {/* Actions */}
          {onDelete && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(meal.guid)
                }}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete Meal
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
