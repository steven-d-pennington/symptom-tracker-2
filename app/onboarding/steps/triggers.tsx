'use client'

import { useState, useMemo } from 'react'
import { SearchBar } from '@/components/onboarding/SearchBar'
import { CategorySection } from '@/components/onboarding/CategorySection'
import { SelectionCard } from '@/components/onboarding/SelectionCard'
import { Trigger } from '@/lib/db'

interface CustomTrigger {
  name: string
  category: 'environmental' | 'lifestyle' | 'dietary'
}

interface TriggersStepProps {
  triggers: Trigger[]
  selectedIds: string[]
  customItems?: CustomTrigger[]
  onToggle: (id: string) => void
  onAddCustom: (name: string, category: 'environmental' | 'lifestyle' | 'dietary') => void
  onRemoveCustom?: (index: number) => void
  onNext: () => void
  onSkip: () => void
}

export function TriggersStep({
  triggers,
  selectedIds,
  customItems = [],
  onToggle,
  onAddCustom,
  onRemoveCustom,
  onNext,
  onSkip,
}: TriggersStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState<'environmental' | 'lifestyle' | 'dietary'>(
    'environmental'
  )

  const filteredTriggers = useMemo(() => {
    if (!searchTerm) return triggers
    const term = searchTerm.toLowerCase()
    return triggers.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
    )
  }, [triggers, searchTerm])

  const triggersByCategory = useMemo(() => {
    const grouped: Record<string, Trigger[]> = {}
    filteredTriggers.forEach((trigger) => {
      const cat = trigger.category.charAt(0).toUpperCase() + trigger.category.slice(1)
      if (!grouped[cat]) {
        grouped[cat] = []
      }
      grouped[cat].push(trigger)
    })
    return grouped
  }, [filteredTriggers])

  const handleAddCustom = () => {
    if (customName.trim()) {
      onAddCustom(customName.trim(), customCategory)
      setCustomName('')
      setShowCustomForm(false)
    }
  }

  const totalSelected = selectedIds.length + customItems.length

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        Select Triggers to Monitor
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        Choose triggers you want to track ({totalSelected} selected)
      </p>

      <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search triggers..." />

      {/* Custom Items Display */}
      {customItems.length > 0 && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
            Custom Triggers Added ({customItems.length})
          </h3>
          <div className="space-y-2">
            {customItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {item.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ({item.category})
                  </span>
                </div>
                {onRemoveCustom && (
                  <button
                    onClick={() => onRemoveCustom(index)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 px-2"
                    aria-label={`Remove ${item.name}`}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto mb-6">
        {Object.entries(triggersByCategory).map(([category, categoryTriggers]) => (
          <CategorySection key={category} category={category} itemCount={categoryTriggers.length}>
            <div className="space-y-2">
              {categoryTriggers.map((trigger) => (
                <SelectionCard
                  key={trigger.guid}
                  id={trigger.guid}
                  label={trigger.name}
                  description={trigger.description}
                  selected={selectedIds.includes(trigger.guid)}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </CategorySection>
        ))}
      </div>

      {!showCustomForm ? (
        <button
          onClick={() => setShowCustomForm(true)}
          className="w-full mb-6 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          + Add Custom Trigger
        </button>
      ) : (
        <div className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Add Custom Trigger
          </h3>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Trigger name"
            className="w-full mb-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddCustom()
              }
            }}
          />
          <select
            value={customCategory}
            onChange={(e) =>
              setCustomCategory(e.target.value as 'environmental' | 'lifestyle' | 'dietary')
            }
            className="w-full mb-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="environmental">Environmental</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="dietary">Dietary</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleAddCustom}
              disabled={!customName.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowCustomForm(false)
                setCustomName('')
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-between">
        <button
          onClick={onSkip}
          className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-semibold transition-colors"
        >
          Skip
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
