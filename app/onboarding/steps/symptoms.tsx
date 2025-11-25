'use client'

import { useState, useMemo } from 'react'
import { SearchBar } from '@/components/onboarding/SearchBar'
import { CategorySection } from '@/components/onboarding/CategorySection'
import { SelectionCard } from '@/components/onboarding/SelectionCard'
import { Symptom } from '@/lib/db'

interface SymptomsStepProps {
  symptoms: Symptom[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onAddCustom: (name: string, category: string) => void
  onNext: () => void
  onSkip: () => void
}

export function SymptomsStep({
  symptoms,
  selectedIds,
  onToggle,
  onAddCustom,
  onNext,
  onSkip,
}: SymptomsStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState('Custom')

  // Filter symptoms by search term
  const filteredSymptoms = useMemo(() => {
    if (!searchTerm) return symptoms
    const term = searchTerm.toLowerCase()
    return symptoms.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term)
    )
  }, [symptoms, searchTerm])

  // Group by category
  const symptomsByCategory = useMemo(() => {
    const grouped: Record<string, Symptom[]> = {}
    filteredSymptoms.forEach((symptom) => {
      if (!grouped[symptom.category]) {
        grouped[symptom.category] = []
      }
      grouped[symptom.category].push(symptom)
    })
    return grouped
  }, [filteredSymptoms])

  const handleAddCustom = () => {
    if (customName.trim()) {
      onAddCustom(customName.trim(), customCategory)
      setCustomName('')
      setShowCustomForm(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        Select Symptoms to Track
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        Choose the symptoms you want to monitor ({selectedIds.length} selected)
      </p>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search symptoms..."
      />

      <div className="max-h-96 overflow-y-auto mb-6">
        {Object.entries(symptomsByCategory).map(([category, categorySymptoms]) => (
          <CategorySection
            key={category}
            category={category}
            itemCount={categorySymptoms.length}
          >
            <div className="space-y-2">
              {categorySymptoms.map((symptom) => (
                <SelectionCard
                  key={symptom.guid}
                  id={symptom.guid}
                  label={symptom.name}
                  description={symptom.description}
                  selected={selectedIds.includes(symptom.guid)}
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
          + Add Custom Symptom
        </button>
      ) : (
        <div className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Add Custom Symptom
          </h3>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Symptom name"
            className="w-full mb-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Category (e.g., Physical, Cognitive)"
            className="w-full mb-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddCustom}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowCustomForm(false)
                setCustomName('')
                setCustomCategory('Custom')
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
