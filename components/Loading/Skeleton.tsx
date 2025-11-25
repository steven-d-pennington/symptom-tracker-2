'use client'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700'

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  }

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`${baseClasses} ${animationClasses[animation]} ${variantClasses[variant]} ${className}`}
      style={style}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Card skeleton for dashboard items
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="circular" width={40} height={40} animation="none" />
        <div className="flex-1">
          <Skeleton width="60%" height={16} animation="none" className="mb-2" />
          <Skeleton width="40%" height={12} animation="none" />
        </div>
      </div>
      <Skeleton width="100%" height={8} animation="none" className="mb-2" />
      <Skeleton width="80%" height={8} animation="none" />
    </div>
  )
}

// Table skeleton for list views
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
        <Skeleton width="20%" height={16} animation="none" />
        <Skeleton width="30%" height={16} animation="none" />
        <Skeleton width="25%" height={16} animation="none" />
        <Skeleton width="15%" height={16} animation="none" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
        >
          <Skeleton width="20%" height={14} animation="none" />
          <Skeleton width="30%" height={14} animation="none" />
          <Skeleton width="25%" height={14} animation="none" />
          <Skeleton width="15%" height={14} animation="none" />
        </div>
      ))}
    </div>
  )
}

// Form skeleton for input forms
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton width={80} height={14} animation="none" className="mb-2" />
          <Skeleton width="100%" height={40} animation="none" variant="rounded" />
        </div>
      ))}
      <Skeleton width={120} height={40} animation="none" variant="rounded" className="mt-6" />
    </div>
  )
}

// Chart skeleton for analytics
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <Skeleton width={120} height={20} animation="none" />
        <div className="flex gap-2">
          <Skeleton width={60} height={24} animation="none" variant="rounded" />
          <Skeleton width={60} height={24} animation="none" variant="rounded" />
        </div>
      </div>
      <Skeleton width="100%" height={height} animation="none" variant="rounded" />
    </div>
  )
}

// Page skeleton for full page loading
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton width={200} height={28} animation="none" className="mb-2" />
              <Skeleton width={150} height={16} animation="none" />
            </div>
            <Skeleton width={100} height={36} animation="none" variant="rounded" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}

// Stat card skeleton
export function StatSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
      <Skeleton width={80} height={12} animation="none" className="mb-2" />
      <Skeleton width={60} height={32} animation="none" className="mb-1" />
      <Skeleton width={100} height={10} animation="none" />
    </div>
  )
}
