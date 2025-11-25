'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Trigger } from '@/lib/db'
import {
  getAllTriggers,
  deactivateTrigger,
  reactivateTrigger,
  TriggerCategory,
} from '@/lib/triggers/manageTrigger'
import { TriggerForm } from '@/components/Triggers'

const CATEGORY_ICONS: Record<TriggerCategory, string> = {
  environmental: '🌍',
  lifestyle: '🏃',
  dietary: '🍽️',
}

const CATEGORY_LABELS: Record<TriggerCategory, string> = {
  environmental: 'Environmental',
  lifestyle: 'Lifestyle',
  dietary: 'Dietary',
}

type ViewMode = 'active' | 'all'

export default function TriggerLibraryPage() {
  const [triggers, setTriggers] = useState<Trigger[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<TriggerCategory | 'all'>('all')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const allTriggers = await getAllTriggers()
      setTriggers(allTriggers)
    } catch (error) {
      console.error('Error loading triggers:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleFormSuccess = () => {
    loadData()
  }

  const handleEdit = (trigger: Trigger) => {
    setEditingTrigger(trigger)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingTrigger(null)
  }

  const handleDeactivate = async (guid: string) => {
    if (confirm('Are you sure you want to deactivate this trigger?')) {
      try {
        await deactivateTrigger(guid)
        loadData()
      } catch (error) {
        console.error('Error deactivating trigger:', error)
      }
    }
  }

  const handleReactivate = async (guid: string) => {
    try {
      await reactivateTrigger(guid)
      loadData()
    } catch (error) {
      console.error('Error reactivating trigger:', error)
    }
  }

  // Filter and group triggers
  const filteredTriggers = useMemo(() => {
    let filtered = triggers

    // Filter by active status
    if (viewMode === 'active') {
      filtered = filtered.filter((t) => t.isActive)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
      )
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === filterCategory)
    }

    return filtered
  }, [triggers, viewMode, searchQuery, filterCategory])

  // Group by category
  const triggersByCategory = useMemo(() => {
    return filteredTriggers.reduce(
      (acc, trigger) => {
        if (!acc[trigger.category]) {
          acc[trigger.category] = []
        }
        acc[trigger.category].push(trigger)
        return acc
      },
      {} as Record<TriggerCategory, Trigger[]>
    )
  }, [filteredTriggers])

  const activeTriggerCount = triggers.filter((t) => t.isActive).length
  const customTriggerCount = triggers.filter((t) => !t.isDefault).length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <p className="text-gray-600 dark:text-gray-400">Loading trigger library</p>
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
                Trigger Library
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activeTriggerCount} active triggers • {customTriggerCount} custom
              </p>
            </div>
            <Link
              href="/triggers"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              ← Back to Trigger Log
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* View Mode */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'active'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'all'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                All
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as TriggerCategory | 'all')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Categories</option>
              <option value="environmental">Environmental</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="dietary">Dietary</option>
            </select>

            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search triggers..."
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-48"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => setFormOpen(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            + Add Custom Trigger
          </button>
        </div>

        {/* Triggers List */}
        {filteredTriggers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚡</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No Triggers Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || filterCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Add custom triggers to track your unique health patterns'}
            </p>
            <button
              onClick={() => setFormOpen(true)}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              Add Your First Custom Trigger
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {(['environmental', 'lifestyle', 'dietary'] as TriggerCategory[]).map((category) => {
              const categoryTriggers = triggersByCategory[category]
              if (!categoryTriggers || categoryTriggers.length === 0) return null

              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {CATEGORY_LABELS[category]}
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({categoryTriggers.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryTriggers.map((trigger) => (
                      <div
                        key={trigger.guid}
                        className={`bg-white dark:bg-gray-800 rounded-lg border p-4 ${
                          trigger.isActive
                            ? 'border-gray-200 dark:border-gray-700'
                            : 'border-gray-300 dark:border-gray-600 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                {trigger.name}
                              </h3>
                              {!trigger.isActive && (
                                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                  Inactive
                                </span>
                              )}
                              {trigger.isDefault && (
                                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            {trigger.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {trigger.description}
                              </p>
                            )}
                          </div>
                          {!trigger.isDefault && trigger.isActive && (
                            <button
                              onClick={() => handleEdit(trigger)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                          )}
                        </div>

                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          {trigger.isActive ? (
                            <button
                              onClick={() => handleDeactivate(trigger.guid)}
                              className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(trigger.guid)}
                              className="text-sm text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Trigger Form Modal */}
      <TriggerForm
        isOpen={formOpen}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        editTrigger={editingTrigger}
      />
    </div>
  )
}
