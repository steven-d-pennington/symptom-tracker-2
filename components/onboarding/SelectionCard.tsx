interface SelectionCardProps {
  id: string
  label: string
  description?: string
  selected: boolean
  onToggle: (id: string) => void
}

export function SelectionCard({
  id,
  label,
  description,
  selected,
  onToggle,
}: SelectionCardProps) {
  return (
    <button
      onClick={() => onToggle(id)}
      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              selected
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {selected && (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-gray-100">{label}</div>
          {description && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</div>
          )}
        </div>
      </div>
    </button>
  )
}
