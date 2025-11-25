'use client'

import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Medication } from '@/lib/db'
import {
  createMedication,
  updateMedication,
  FREQUENCY_OPTIONS,
  MedicationSchedule,
} from '@/lib/medications/manageMedication'

interface MedicationFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  editMedication?: Medication | null
}

export function MedicationForm({ isOpen, onClose, onSuccess, editMedication }: MedicationFormProps) {
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('Once daily')
  const [customFrequency, setCustomFrequency] = useState('')
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(['08:00'])
  const [scheduleDays, setScheduleDays] = useState<number[]>([])
  const [sideEffects, setSideEffects] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!editMedication

  useEffect(() => {
    if (isOpen && editMedication) {
      setName(editMedication.name)
      setDosage(editMedication.dosage)
      const freq = editMedication.frequency
      if (FREQUENCY_OPTIONS.includes(freq)) {
        setFrequency(freq)
        setCustomFrequency('')
      } else {
        setFrequency('Other')
        setCustomFrequency(freq)
      }
      setScheduleTimes(editMedication.schedule.times || ['08:00'])
      setScheduleDays(editMedication.schedule.days || [])
      setSideEffects(editMedication.sideEffects?.join(', ') || '')
    } else if (isOpen) {
      resetForm()
    }
  }, [isOpen, editMedication])

  const resetForm = () => {
    setName('')
    setDosage('')
    setFrequency('Once daily')
    setCustomFrequency('')
    setScheduleTimes(['08:00'])
    setScheduleDays([])
    setSideEffects('')
    setError(null)
  }

  const handleAddTime = () => {
    setScheduleTimes([...scheduleTimes, '12:00'])
  }

  const handleRemoveTime = (index: number) => {
    setScheduleTimes(scheduleTimes.filter((_, i) => i !== index))
  }

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...scheduleTimes]
    newTimes[index] = value
    setScheduleTimes(newTimes)
  }

  const toggleDay = (day: number) => {
    if (scheduleDays.includes(day)) {
      setScheduleDays(scheduleDays.filter((d) => d !== day))
    } else {
      setScheduleDays([...scheduleDays, day].sort())
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a medication name')
      return
    }
    if (!dosage.trim()) {
      setError('Please enter a dosage')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const actualFrequency = frequency === 'Other' ? customFrequency : frequency
      const schedule: MedicationSchedule = {
        times: scheduleTimes.filter((t) => t),
        days: scheduleDays.length > 0 ? scheduleDays : undefined,
      }
      const sideEffectsList = sideEffects
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s)

      if (isEditing && editMedication) {
        await updateMedication(editMedication.guid, {
          name: name.trim(),
          dosage: dosage.trim(),
          frequency: actualFrequency,
          schedule,
          sideEffects: sideEffectsList,
        })
      } else {
        await createMedication({
          name: name.trim(),
          dosage: dosage.trim(),
          frequency: actualFrequency,
          schedule,
          sideEffects: sideEffectsList,
        })
      }

      onClose()
      if (onSuccess) {
        onSuccess()
      }
      resetForm()
    } catch (err) {
      console.error('Error saving medication:', err)
      setError(err instanceof Error ? err.message : 'Failed to save medication')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    resetForm()
    onClose()
  }

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={isEditing ? 'Edit Medication' : 'Add Medication'}
      size="lg"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Medication Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          placeholder="e.g., Ibuprofen, Humira"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      {/* Dosage */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Dosage <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          disabled={isSubmitting}
          placeholder="e.g., 200mg, 40mg/0.4mL"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      {/* Frequency */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Frequency
        </label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        >
          {FREQUENCY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {frequency === 'Other' && (
          <input
            type="text"
            value={customFrequency}
            onChange={(e) => setCustomFrequency(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter custom frequency"
            className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
        )}
      </div>

      {/* Schedule Times */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Scheduled Times
        </label>
        <div className="space-y-2">
          {scheduleTimes.map((time, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(index, e.target.value)}
                disabled={isSubmitting}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              {scheduleTimes.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTime(index)}
                  disabled={isSubmitting}
                  className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddTime}
            disabled={isSubmitting}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
          >
            + Add another time
          </button>
        </div>
      </div>

      {/* Schedule Days */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Specific Days (leave empty for every day)
        </label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day, index) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(index)}
              disabled={isSubmitting}
              className={`px-3 py-2 rounded-lg border transition-all ${
                scheduleDays.includes(index)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              } disabled:opacity-50`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Side Effects */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Known Side Effects (comma-separated)
        </label>
        <textarea
          value={sideEffects}
          onChange={(e) => setSideEffects(e.target.value)}
          disabled={isSubmitting}
          placeholder="e.g., drowsiness, nausea, headache"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
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
          disabled={isSubmitting || !name.trim() || !dosage.trim()}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : isEditing ? (
            'Update Medication'
          ) : (
            'Add Medication'
          )}
        </button>
      </div>
    </Modal>
  )
}
