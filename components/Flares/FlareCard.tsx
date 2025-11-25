import { Flare } from '@/lib/db'
import { getSeverityColor } from '@/lib/bodyMap/coordinateUtils'
import { calculateDaysActive } from '@/lib/flares/resolveFlare'

interface FlareCardProps {
  flare: Flare
  onClick?: () => void
  onUpdate?: () => void
  onResolve?: () => void
}

export function FlareCard({ flare, onClick, onUpdate, onResolve }: FlareCardProps) {
  const daysActive = calculateDaysActive(flare.startDate)
  const severityColor = getSeverityColor(flare.currentSeverity)

  const getStatusIcon = () => {
    if (flare.status === 'improving') return '↓'
    if (flare.status === 'worsening') return '↑'
    return '→'
  }

  const getStatusColor = () => {
    if (flare.status === 'improving') return 'text-green-600 dark:text-green-400'
    if (flare.status === 'worsening') return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {flare.bodyRegion.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Started {new Date(flare.startDate).toLocaleDateString()} • {daysActive}{' '}
            {daysActive === 1 ? 'day' : 'days'} active
          </p>
        </div>

        {/* Severity Badge */}
        <div
          className="flex flex-col items-center justify-center w-16 h-16 rounded-lg"
          style={{ backgroundColor: severityColor + '20' }}
        >
          <div
            className="text-2xl font-bold"
            style={{ color: severityColor }}
          >
            {flare.currentSeverity}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">severity</div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-lg ${getStatusColor()}`}>{getStatusIcon()}</span>
        <span className={`text-sm font-medium capitalize ${getStatusColor()}`}>
          {flare.status}
        </span>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onUpdate?.()
          }}
          className="flex-1 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          Update
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onResolve?.()
          }}
          className="flex-1 px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          Resolve
        </button>
      </div>
    </div>
  )
}
