'use client'

import { useState } from 'react'

interface CategorySectionProps {
  category: string
  children: React.ReactNode
  defaultExpanded?: boolean
  itemCount?: number
}

export function CategorySection({
  category,
  children,
  defaultExpanded = true,
  itemCount,
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-gray-100">{category}</span>
          {itemCount !== undefined && (
            <span className="text-sm text-gray-500 dark:text-gray-400">({itemCount})</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && <div className="p-4 bg-white dark:bg-gray-900">{children}</div>}
    </div>
  )
}
