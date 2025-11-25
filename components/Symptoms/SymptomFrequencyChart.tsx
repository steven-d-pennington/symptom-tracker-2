'use client'

import { SymptomInstance, Symptom } from '@/lib/db'

interface SymptomFrequencyChartProps {
  instances: SymptomInstance[]
  symptomsMap: Map<string, Symptom>
  className?: string
}

interface FrequencyData {
  symptomId: string
  symptomName: string
  count: number
  percentage: number
  color: string
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
]

export function SymptomFrequencyChart({
  instances,
  symptomsMap,
  className = '',
}: SymptomFrequencyChartProps) {
  if (instances.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}>
        No data to display
      </div>
    )
  }

  // Calculate frequency by symptom
  const frequencyMap = new Map<string, number>()
  instances.forEach((instance) => {
    const count = frequencyMap.get(instance.symptomId) || 0
    frequencyMap.set(instance.symptomId, count + 1)
  })

  const totalCount = instances.length

  // Convert to sorted array
  const frequencyData: FrequencyData[] = Array.from(frequencyMap.entries())
    .map(([symptomId, count], index) => ({
      symptomId,
      symptomName: symptomsMap.get(symptomId)?.name || 'Unknown',
      count,
      percentage: (count / totalCount) * 100,
      color: COLORS[index % COLORS.length],
    }))
    .sort((a, b) => b.count - a.count)

  const maxCount = Math.max(...frequencyData.map((d) => d.count))

  return (
    <div className={className}>
      <div className="space-y-3">
        {frequencyData.map((data) => (
          <div key={data.symptomId} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {data.symptomName}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                {data.count} ({data.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(data.count / maxCount) * 100}%`,
                  backgroundColor: data.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Total instances: {totalCount}</span>
          <span>Unique symptoms: {frequencyData.length}</span>
        </div>
      </div>
    </div>
  )
}
