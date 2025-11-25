'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { FoodEvent } from '@/lib/db'
import { getFoodEvents, deleteFoodEvent, getTodaysMeals, MealType } from '@/lib/food/logMeal'
import { MealCard, MealLoggerModal } from '@/components/Food'

type FilterPeriod = 'today' | 'week' | 'month' | 'all'

export default function FoodJournalPage() {
  const [meals, setMeals] = useState<FoodEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filterMealType, setFilterMealType] = useState<MealType | 'all'>('all')
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('week')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const allMeals = await getFoodEvents()
      setMeals(allMeals)
    } catch (error) {
      console.error('Error loading meals:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleModalSuccess = () => {
    loadData()
  }

  const handleDeleteMeal = async (guid: string) => {
    if (confirm('Are you sure you want to delete this meal?')) {
      try {
        await deleteFoodEvent(guid)
        loadData()
      } catch (error) {
        console.error('Error deleting meal:', error)
      }
    }
  }

  // Filter meals by type and period
  const filteredMeals = meals.filter((meal) => {
    // Filter by meal type
    if (filterMealType !== 'all' && meal.mealType !== filterMealType) {
      return false
    }

    // Filter by period
    const now = new Date()
    const mealDate = new Date(meal.timestamp)

    switch (filterPeriod) {
      case 'today': {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        return mealDate >= startOfToday
      }
      case 'week': {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return mealDate >= oneWeekAgo
      }
      case 'month': {
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        return mealDate >= oneMonthAgo
      }
      case 'all':
      default:
        return true
    }
  })

  // Group meals by date
  const mealsByDate = filteredMeals.reduce(
    (acc, meal) => {
      const date = new Date(meal.timestamp).toDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(meal)
      return acc
    },
    {} as Record<string, FoodEvent[]>
  )

  // Sort dates (most recent first)
  const sortedDates = Object.keys(mealsByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  // Count today's meals
  const todaysMealCount = meals.filter((meal) => {
    const today = new Date()
    const mealDate = new Date(meal.timestamp)
    return (
      mealDate.getDate() === today.getDate() &&
      mealDate.getMonth() === today.getMonth() &&
      mealDate.getFullYear() === today.getFullYear()
    )
  }).length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <p className="text-gray-600 dark:text-gray-400">Loading food journal</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Food Journal</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {todaysMealCount} {todaysMealCount === 1 ? 'meal' : 'meals'} logged today
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
        {/* Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Meal Type Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Type:
              </label>
              <select
                value={filterMealType}
                onChange={(e) => setFilterMealType(e.target.value as MealType | 'all')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Meals</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            {/* Period Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Period:
              </label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/food/library"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Food Library
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              + Log Meal
            </button>
          </div>
        </div>

        {/* Meals List */}
        {filteredMeals.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No Meals Logged
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start tracking your meals to identify food-symptom correlations.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Log Your First Meal
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((dateStr) => {
              const dateMeals = mealsByDate[dateStr]
              const isToday = new Date().toDateString() === dateStr

              return (
                <div key={dateStr}>
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {isToday ? 'Today' : new Date(dateStr).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {dateMeals.length} {dateMeals.length === 1 ? 'meal' : 'meals'}
                    </span>
                  </div>

                  {/* Meals for this date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dateMeals.map((meal) => (
                      <MealCard key={meal.guid} meal={meal} onDelete={handleDeleteMeal} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Meal Logger Modal */}
      <MealLoggerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
