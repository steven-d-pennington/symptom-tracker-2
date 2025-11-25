interface ViewSelectorProps {
  currentView: 'front' | 'back' | 'side'
  onViewChange: (view: 'front' | 'back' | 'side') => void
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  const views: Array<{ value: 'front' | 'back' | 'side'; label: string }> = [
    { value: 'front', label: 'Front' },
    { value: 'back', label: 'Back' },
    { value: 'side', label: 'Side' },
  ]

  return (
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {views.map((view) => (
        <button
          key={view.value}
          onClick={() => onViewChange(view.value)}
          disabled={view.value === 'side'} // Side view not implemented yet
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === view.value
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={`${view.label} view`}
          aria-pressed={currentView === view.value}
        >
          {view.label}
        </button>
      ))}
    </div>
  )
}
