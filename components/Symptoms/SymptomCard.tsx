import { SymptomInstance, Symptom } from '@/lib/db'
import { getSeverityColor } from '@/lib/bodyMap/coordinateUtils'

interface SymptomCardProps {
  instance: SymptomInstance
  symptom: Symptom
}

export function SymptomCard({ instance, symptom }: SymptomCardProps) {
  const severityColor = getSeverityColor(instance.severity)

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - timestamp
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {symptom.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatTimestamp(instance.timestamp)}
          </p>
          {instance.bodyRegion && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Location: {instance.bodyRegion.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
          )}
        </div>

        {/* Severity Badge */}
        <div
          className="flex flex-col items-center justify-center w-14 h-14 rounded-lg"
          style={{ backgroundColor: severityColor + '20' }}
        >
          <div className="text-xl font-bold" style={{ color: severityColor }}>
            {instance.severity}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">severity</div>
        </div>
      </div>

      {/* Duration */}
      {instance.durationMinutes && (
        <div className="mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Duration: {instance.durationMinutes} minutes
          </span>
        </div>
      )}

      {/* Notes */}
      {instance.notes && (
        <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm text-gray-700 dark:text-gray-300">
          {instance.notes}
        </div>
      )}

      {/* Triggers */}
      {instance.associatedTriggers && instance.associatedTriggers.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {instance.associatedTriggers.map((triggerId, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full"
            >
              Trigger
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
