interface SeveritySliderProps {
  value: number
  onChange: (value: number) => void
  label?: string
  required?: boolean
  disabled?: boolean
}

export function SeveritySlider({
  value,
  onChange,
  label = 'Severity',
  required = false,
  disabled = false,
}: SeveritySliderProps) {
  const getSeverityLabel = (severity: number): string => {
    if (severity <= 3) return 'Mild'
    if (severity <= 6) return 'Moderate'
    if (severity <= 8) return 'Severe'
    return 'Very Severe'
  }

  const getSeverityColor = (severity: number): string => {
    if (severity <= 3) return 'text-green-600 dark:text-green-400'
    if (severity <= 6) return 'text-yellow-600 dark:text-yellow-400'
    if (severity <= 8) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex items-center gap-4">
        {/* Slider */}
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, #10b981 0%, #eab308 50%, #ef4444 100%)`,
          }}
        />

        {/* Current value */}
        <div className="flex items-center gap-2 min-w-[120px]">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
          <span className={`text-sm font-medium ${getSeverityColor(value)}`}>
            {getSeverityLabel(value)}
          </span>
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
        <span>1 (Minimal)</span>
        <span>5 (Moderate)</span>
        <span>10 (Severe)</span>
      </div>
    </div>
  )
}
