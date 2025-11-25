'use client'

import { SymptomInstance, Symptom } from '@/lib/db'
import { getSeverityColor } from '@/lib/bodyMap/coordinateUtils'

interface SymptomTimelineProps {
  instances: SymptomInstance[]
  symptomsMap: Map<string, Symptom>
  onInstanceClick?: (instance: SymptomInstance) => void
}

export function SymptomTimeline({ instances, symptomsMap, onInstanceClick }: SymptomTimelineProps) {
  if (instances.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No symptom instances found
      </div>
    )
  }

  // Group instances by date
  const groupedByDate = instances.reduce<Record<string, SymptomInstance[]>>((acc, instance) => {
    const date = new Date(instance.timestamp).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(instance)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date}>
          {/* Date Header */}
          <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 py-2 z-10">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              {date}
            </h3>
          </div>

          {/* Instances for this date */}
          <div className="space-y-3 ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
            {groupedByDate[date].map((instance) => {
              const symptom = symptomsMap.get(instance.symptomId)
              const severityColor = getSeverityColor(instance.severity)

              return (
                <div
                  key={instance.guid}
                  onClick={() => onInstanceClick?.(instance)}
                  className={`relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${
                    onInstanceClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                  }`}
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-[1.625rem] top-4 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900"
                    style={{ backgroundColor: severityColor }}
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {symptom?.name || 'Unknown Symptom'}
                        </h4>
                        {symptom?.category && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            {symptom.category}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(instance.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {instance.durationMinutes && ` • ${instance.durationMinutes} min`}
                      </p>

                      {instance.bodyRegion && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Location: {instance.bodyRegion.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                      )}

                      {instance.notes && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded p-2">
                          {instance.notes}
                        </p>
                      )}
                    </div>

                    {/* Severity Badge */}
                    <div
                      className="flex flex-col items-center justify-center w-12 h-12 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: severityColor + '20' }}
                    >
                      <div className="text-lg font-bold" style={{ color: severityColor }}>
                        {instance.severity}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
