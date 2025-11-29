'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Symptom, Trigger, Food, Medication } from '@/lib/db'
import {
  getTrackedSymptoms,
  getTrackedTriggers,
  getTrackedFoods,
  getTrackedMedications,
  getAllSymptoms,
  getAllTriggers,
  getAllFoods,
  getAllMedications,
  setSymptomTracked,
  setTriggerTracked,
  setFoodTracked,
  setMedicationTracked,
  enableSymptoms,
  enableTriggers,
  enableFoods,
  enableMedications,
} from '@/lib/settings/trackingPreferences'

type CategoryType = 'symptoms' | 'medications' | 'triggers' | 'foods'
type Item = Symptom | Trigger | Food | Medication

interface TrackingCategoryProps {
  category: CategoryType
  onCountChange?: (count: number) => void
}

export function TrackingCategory({ category, onCountChange }: TrackingCategoryProps) {
  const [trackedItems, setTrackedItems] = useState<Item[]>([])
  const [allItems, setAllItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addSearchQuery, setAddSearchQuery] = useState('')
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set())

  // Store onCountChange in a ref to avoid re-render loops
  const onCountChangeRef = useRef(onCountChange)
  onCountChangeRef.current = onCountChange

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      let tracked: Item[] = []
      let all: Item[] = []

      switch (category) {
        case 'symptoms':
          tracked = await getTrackedSymptoms()
          all = await getAllSymptoms()
          break
        case 'medications':
          tracked = await getTrackedMedications()
          all = await getAllMedications()
          break
        case 'triggers':
          tracked = await getTrackedTriggers()
          all = await getAllTriggers()
          break
        case 'foods':
          tracked = await getTrackedFoods()
          all = await getAllFoods()
          break
      }

      setTrackedItems(tracked)
      setAllItems(all)
      onCountChangeRef.current?.(tracked.length)
    } catch (error) {
      console.error(`Error loading ${category}:`, error)
    } finally {
      setIsLoading(false)
    }
  }, [category])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleToggle = async (guid: string, currentlyTracked: boolean) => {
    try {
      switch (category) {
        case 'symptoms':
          await setSymptomTracked(guid, !currentlyTracked)
          break
        case 'medications':
          await setMedicationTracked(guid, !currentlyTracked)
          break
        case 'triggers':
          await setTriggerTracked(guid, !currentlyTracked)
          break
        case 'foods':
          await setFoodTracked(guid, !currentlyTracked)
          break
      }
      await loadData()
    } catch (error) {
      console.error('Error toggling item:', error)
    }
  }

  const handleAddSelected = async () => {
    if (selectedToAdd.size === 0) return

    try {
      const guids = Array.from(selectedToAdd)
      switch (category) {
        case 'symptoms':
          await enableSymptoms(guids)
          break
        case 'medications':
          await enableMedications(guids)
          break
        case 'triggers':
          await enableTriggers(guids)
          break
        case 'foods':
          await enableFoods(guids)
          break
      }
      setSelectedToAdd(new Set())
      setShowAddModal(false)
      setAddSearchQuery('')
      await loadData()
    } catch (error) {
      console.error('Error adding items:', error)
    }
  }

  // Filter tracked items by search
  const filteredTracked = useMemo(() => {
    if (!searchQuery) return trackedItems
    const query = searchQuery.toLowerCase()
    return trackedItems.filter(item => item.name.toLowerCase().includes(query))
  }, [trackedItems, searchQuery])

  // Get untracked items for the add modal
  const untrackedItems = useMemo(() => {
    const trackedGuids = new Set(trackedItems.map(i => i.guid))
    return allItems.filter(item => !trackedGuids.has(item.guid))
  }, [allItems, trackedItems])

  // Filter untracked items by search in add modal
  const filteredUntracked = useMemo(() => {
    if (!addSearchQuery) return untrackedItems
    const query = addSearchQuery.toLowerCase()
    return untrackedItems.filter(item => item.name.toLowerCase().includes(query))
  }, [untrackedItems, addSearchQuery])

  // Group items by category/subcategory
  const groupedUntracked = useMemo(() => {
    const groups: Record<string, Item[]> = {}
    for (const item of filteredUntracked) {
      const groupKey = 'category' in item ? (item as Symptom | Food).category :
                       ('category' in item ? (item as Trigger).category : 'Other')
      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(item)
    }
    return groups
  }, [filteredUntracked])

  const getCategoryLabel = (item: Item): string | undefined => {
    if ('category' in item) {
      return (item as Symptom | Trigger | Food).category
    }
    return undefined
  }

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="py-2">
      {/* Search and Add buttons */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder={`Search tracked ${category}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={() => setShowAddModal(true)}
          disabled={untrackedItems.length === 0}
          className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors whitespace-nowrap"
        >
          + Add More
        </button>
      </div>

      {/* Tracked items list */}
      {filteredTracked.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            {searchQuery ? 'No matching items' : `No ${category} tracked yet`}
          </p>
          {!searchQuery && untrackedItems.length > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Add {category} to track
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {filteredTracked.map(item => (
            <div
              key={item.guid}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.name}
                </div>
                {getCategoryLabel(item) && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getCategoryLabel(item)}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleToggle(item.guid, true)}
                className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Stop tracking"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {trackedItems.length} tracked • {untrackedItems.length} available to add
        </p>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowAddModal(false)
              setAddSearchQuery('')
              setSelectedToAdd(new Set())
            }}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Add {category.charAt(0).toUpperCase() + category.slice(1)} to Track
              </h3>
              <input
                type="text"
                placeholder="Search..."
                value={addSearchQuery}
                onChange={(e) => setAddSearchQuery(e.target.value)}
                className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                autoFocus
              />
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredUntracked.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  {addSearchQuery ? 'No matching items' : 'All items are already tracked'}
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedUntracked).map(([group, items]) => (
                    <div key={group}>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        {group} ({items.length})
                      </h4>
                      <div className="space-y-1">
                        {items.map(item => (
                          <label
                            key={item.guid}
                            className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedToAdd.has(item.guid)}
                              onChange={(e) => {
                                const newSet = new Set(selectedToAdd)
                                if (e.target.checked) {
                                  newSet.add(item.guid)
                                } else {
                                  newSet.delete(item.guid)
                                }
                                setSelectedToAdd(newSet)
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {item.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedToAdd.size} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setAddSearchQuery('')
                    setSelectedToAdd(new Set())
                  }}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSelected}
                  disabled={selectedToAdd.size === 0}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  Add Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
