'use client'

import { useState, useMemo } from 'react'
import { SearchBar } from '@/components/onboarding/SearchBar'
import { CategorySection } from '@/components/onboarding/CategorySection'
import { SelectionCard } from '@/components/onboarding/SelectionCard'
import { Medication } from '@/lib/db'

interface MedicationsStepProps {
  medications: Medication[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onAddCustom: (name: string, dosage: string) => void
  onNext: () => void
  onSkip: () => void
}

export function MedicationsStep({
  medications,
  selectedIds,
  onToggle,
  onAddCustom,
  onNext,
  onSkip,
}: MedicationsStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customDosage, setCustomDosage] = useState('')

  const filteredMedications = useMemo(() => {
    if (!searchTerm) return medications
    const term = searchTerm.toLowerCase()
    return medications.filter(
      (m) => m.name.toLowerCase().includes(term) || m.dosage.toLowerCase().includes(term)
    )
  }, [medications, searchTerm])

  const handleAddCustom = () => {
    if (customName.trim()) {
      onAddCustom(customName.trim(), customDosage.trim() || 'As needed')
      setCustomName('')
      setCustomDosage('')
      setShowCustomForm(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        Select Medications
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        Choose medications you want to track ({selectedIds.length} selected)
      </p>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search medications..."
      />

      <div className="max-h-96 overflow-y-auto mb-6">
        <div className="space-y-2">
          {filteredMedications.map((medication) => (
            <SelectionCard
              key={medication.guid}
              id={medication.guid}
              label={medication.name}
              description={medication.dosage}
              selected={selectedIds.includes(medication.guid)}
              onToggle={onToggle}
            />
          ))}
        </div>
      </div>

      {!showCustomForm ? (
        <button
          onClick={() => setShowCustomForm(true)}
          className="w-full mb-6 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          + Add Custom Medication
        </button>
      ) : (
        <div className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Add Custom Medication
          </h3>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Medication name"
            className="w-full mb-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
          <input
            type="text"
            value={customDosage}
            onChange={(e) => setCustomDosage(e.target.value)}
            placeholder="Dosage (e.g., 10mg, 1 tablet)"
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
                setCustomDosage('')
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
