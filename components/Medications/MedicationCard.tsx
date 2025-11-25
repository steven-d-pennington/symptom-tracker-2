'use client'

import { Medication } from '@/lib/db'

interface MedicationCardProps {
  medication: Medication
  onEdit?: (medication: Medication) => void
  onDeactivate?: (guid: string) => void
  onReactivate?: (guid: string) => void
  onLogTaken?: (medication: Medication) => void
  onLogSkipped?: (medication: Medication) => void
}

export function MedicationCard({
  medication,
  onEdit,
  onDeactivate,
  onReactivate,
  onLogTaken,
  onLogSkipped,
}: MedicationCardProps) {
  const formatSchedule = () => {
    const times = medication.schedule.times
    if (!times || times.length === 0) return 'No schedule set'

    const formattedTimes = times.map((t) => {
      const [hours, minutes] = t.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour % 12 || 12
      return `${hour12}:${minutes} ${ampm}`
    })

    const days = medication.schedule.days
    if (days && days.length > 0 && days.length < 7) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const dayList = days.map((d) => dayNames[d]).join(', ')
      return `${formattedTimes.join(', ')} on ${dayList}`
    }

    return formattedTimes.join(', ')
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border p-4 ${
        medication.isActive
          ? 'border-gray-200 dark:border-gray-700'
          : 'border-gray-300 dark:border-gray-600 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">💊</span>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {medication.name}
            </h3>
            {!medication.isActive && (
              <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {medication.dosage} • {medication.frequency}
          </p>
        </div>
        {onEdit && medication.isActive && (
          <button
            onClick={() => onEdit(medication)}
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

      {/* Schedule */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        <span className="font-medium">Schedule:</span> {formatSchedule()}
      </div>

      {/* Side Effects */}
      {medication.sideEffects && medication.sideEffects.length > 0 && (
        <div className="mb-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Side effects:
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {medication.sideEffects.map((effect, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded"
              >
                {effect}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {medication.isActive && (onLogTaken || onLogSkipped) && (
        <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          {onLogTaken && (
            <button
              onClick={() => onLogTaken(medication)}
              className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              ✓ Taken
            </button>
          )}
          {onLogSkipped && (
            <button
              onClick={() => onLogSkipped(medication)}
              className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              ✗ Skipped
            </button>
          )}
        </div>
      )}

      {/* Admin Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        {medication.isActive && onDeactivate && (
          <button
            onClick={() => onDeactivate(medication.guid)}
            className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
          >
            Deactivate
          </button>
        )}
        {!medication.isActive && onReactivate && (
          <button
            onClick={() => onReactivate(medication.guid)}
            className="text-sm text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
          >
            Reactivate
          </button>
        )}
      </div>
    </div>
  )
}
