'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Food } from '@/lib/db'
import {
  getAllFoods,
  searchFoods,
  deactivateFood,
  reactivateFood,
  deleteFood,
  getFoodFrequency,
  ALLERGEN_TAGS,
  FOOD_CATEGORIES,
} from '@/lib/food/manageFood'
import { FoodForm } from '@/components/Food'

type SortBy = 'name' | 'category' | 'frequency'
type SortOrder = 'asc' | 'desc'

export default function FoodLibraryPage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [frequencyMap, setFrequencyMap] = useState<Map<string, number>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])
  const [includeInactive, setIncludeInactive] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // Modal
  const [formOpen, setFormOpen] = useState(false)
  const [editingFood, setEditingFood] = useState<Food | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [allFoods, freqMap] = await Promise.all([getAllFoods(), getFoodFrequency()])
      setFoods(allFoods)
      setFrequencyMap(freqMap)
    } catch (error) {
      console.error('Error loading foods:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Apply filters and sorting
  const filteredFoods = useMemo(() => {
    let results = [...foods]

    // Filter by active status
    if (!includeInactive) {
      results = results.filter((f) => f.isActive)
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (f) =>
          f.name.toLowerCase().includes(query) || f.category.toLowerCase().includes(query)
      )
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      results = results.filter((f) => selectedCategories.includes(f.category))
    }

    // Filter by allergen tags
    if (selectedAllergens.length > 0) {
      results = results.filter((f) =>
        selectedAllergens.some((tag) => f.allergenTags.includes(tag))
      )
    }

    // Sort
    results.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'frequency') {
        const aFreq = frequencyMap.get(a.guid) || 0
        const bFreq = frequencyMap.get(b.guid) || 0
        comparison = aFreq - bFreq
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category)
      } else {
        comparison = a.name.localeCompare(b.name)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return results
  }, [
    foods,
    searchQuery,
    selectedCategories,
    selectedAllergens,
    includeInactive,
    sortBy,
    sortOrder,
    frequencyMap,
  ])

  // Group by category
  const foodsByCategory = useMemo(() => {
    return filteredFoods.reduce(
      (acc, food) => {
        if (!acc[food.category]) {
          acc[food.category] = []
        }
        acc[food.category].push(food)
        return acc
      },
      {} as Record<string, Food[]>
    )
  }, [filteredFoods])

  const handleEdit = (food: Food) => {
    setEditingFood(food)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingFood(null)
  }

  const handleDeactivate = async (guid: string) => {
    if (confirm('Deactivate this food? It will no longer appear in food selection.')) {
      try {
        await deactivateFood(guid)
        loadData()
      } catch (error) {
        console.error('Error deactivating food:', error)
        alert('Failed to deactivate food')
      }
    }
  }

  const handleReactivate = async (guid: string) => {
    try {
      await reactivateFood(guid)
      loadData()
    } catch (error) {
      console.error('Error reactivating food:', error)
      alert('Failed to reactivate food')
    }
  }

  const handleDelete = async (guid: string) => {
    if (confirm('Permanently delete this food? This cannot be undone.')) {
      try {
        await deleteFood(guid)
        loadData()
      } catch (error) {
        console.error('Error deleting food:', error)
        alert(error instanceof Error ? error.message : 'Failed to delete food')
      }
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedAllergens([])
    setIncludeInactive(false)
    setSortBy('name')
    setSortOrder('asc')
  }

  const activeFilterCount =
    selectedCategories.length +
    selectedAllergens.length +
    (includeInactive ? 1 : 0) +
    (sortBy !== 'name' ? 1 : 0)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <p className="text-gray-600 dark:text-gray-400">Loading food library</p>
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
                Food Library
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredFoods.length} of {foods.filter((f) => f.isActive).length} foods
              </p>
            </div>
            <Link
              href="/food"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              ← Back to Food Journal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search foods..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-green-600 text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Add Food Button */}
            <button
              onClick={() => setFormOpen(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              + Add Food
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {FOOD_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() =>
                          setSelectedCategories((prev) =>
                            prev.includes(cat)
                              ? prev.filter((c) => c !== cat)
                              : [...prev, cat]
                          )
                        }
                        className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                          selectedCategories.includes(cat)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allergen Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Allergen Tags
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {ALLERGEN_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() =>
                          setSelectedAllergens((prev) =>
                            prev.includes(tag)
                              ? prev.filter((t) => t !== tag)
                              : [...prev, tag]
                          )
                        }
                        className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                          selectedAllergens.includes(tag)
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort & Options */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort By
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        <option value="name">Name</option>
                        <option value="category">Category</option>
                        <option value="frequency">Most Used</option>
                      </select>
                      <button
                        onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeInactive}
                      onChange={(e) => setIncludeInactive(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Show inactive foods
                    </span>
                  </label>

                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredFoods.length} foods
        </div>

        {/* Foods by Category */}
        {filteredFoods.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No Foods Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || activeFilterCount > 0
                ? 'Try adjusting your filters'
                : 'Add your first custom food'}
            </p>
            {(searchQuery || activeFilterCount > 0) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(foodsByCategory)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([category, categoryFoods]) => (
                <div
                  key={category}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                      {category}
                      <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                        ({categoryFoods.length})
                      </span>
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {categoryFoods.map((food) => (
                      <div
                        key={food.guid}
                        className={`p-4 flex items-center justify-between ${
                          !food.isActive ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {food.name}
                            </span>
                            {!food.isActive && (
                              <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                Inactive
                              </span>
                            )}
                            {food.isDefault && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            {food.allergenTags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {food.allergenTags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            {food.preparationMethod && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {food.preparationMethod}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Used {frequencyMap.get(food.guid) || 0} times
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(food)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Edit"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          {food.isActive ? (
                            <button
                              onClick={() => handleDeactivate(food.guid)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Deactivate"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(food.guid)}
                              className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Reactivate"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>
                          )}
                          {!food.isDefault && (
                            <button
                              onClick={() => handleDelete(food.guid)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Delete permanently"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>

      {/* Food Form Modal */}
      <FoodForm
        isOpen={formOpen}
        onClose={handleCloseForm}
        onSuccess={loadData}
        editFood={editingFood}
      />
    </div>
  )
}
