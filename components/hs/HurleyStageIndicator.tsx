'use client'

import { HurleyStage } from '@/lib/hs/types'
import {
  getHurleyStageLabel,
  getHurleyStageDescription,
  getHurleSeverityColors,
  HURLEY_STAGE_INFO,
} from '@/lib/hs/hurley'
import { useState } from 'react'

interface HurleyStageIndicatorProps {
  stage: HurleyStage | null
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showTooltip?: boolean
  onClick?: () => void
}

/**
 * Visual indicator for Hurley stage using dots
 * Stage I: ●
 * Stage II: ●●
 * Stage III: ●●●
 */
export function HurleyStageIndicator({
  stage,
  size = 'md',
  showLabel = false,
  showTooltip = true,
  onClick,
}: HurleyStageIndicatorProps) {
  const [showTooltipContent, setShowTooltipContent] = useState(false)
  const colors = getHurleSeverityColors(stage)

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  const gapSizes = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const dotCount = stage ?? 0
  const dotSize = dotSizes[size]
  const gap = gapSizes[size]

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => showTooltip && setShowTooltipContent(true)}
        onMouseLeave={() => setShowTooltipContent(false)}
        onFocus={() => showTooltip && setShowTooltipContent(true)}
        onBlur={() => setShowTooltipContent(false)}
        className={`
          inline-flex items-center ${gap} px-2 py-1 rounded-full
          ${colors.bg} ${colors.text} ${colors.border} border
          ${onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          transition-colors
        `}
        aria-label={
          stage
            ? `Hurley ${getHurleyStageLabel(stage)}`
            : 'Hurley stage not assessed'
        }
      >
        {/* Dots */}
        <span className={`inline-flex items-center ${gap}`}>
          {stage === null ? (
            <span className={`${dotSize} rounded-full bg-gray-400 opacity-50`} />
          ) : (
            Array.from({ length: dotCount }).map((_, i) => (
              <span
                key={i}
                className={`${dotSize} rounded-full ${colors.dot}`}
              />
            ))
          )}
        </span>

        {/* Label */}
        {showLabel && (
          <span className={`ml-1 font-medium ${textSizes[size]}`}>
            {stage ? `Stage ${stage}` : 'N/A'}
          </span>
        )}
      </button>

      {/* Tooltip */}
      {showTooltipContent && stage && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          <div className="text-sm">
            <p className={`font-semibold ${colors.text}`}>
              {getHurleyStageLabel(stage)}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {getHurleyStageDescription(stage)}
            </p>
          </div>
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-8 border-transparent border-t-white dark:border-t-gray-800"
          />
        </div>
      )}
    </div>
  )
}

interface HurleyBadgeProps {
  stage: HurleyStage | null
  size?: 'sm' | 'md'
}

/**
 * Compact badge for displaying Hurley stage
 */
export function HurleyBadge({ stage, size = 'sm' }: HurleyBadgeProps) {
  const colors = getHurleSeverityColors(stage)

  const sizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
  }

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizes[size]} ${colors.bg} ${colors.text}
      `}
      title={stage ? getHurleyStageLabel(stage) : 'Not assessed'}
    >
      {stage ? (
        <>
          <span className="mr-1">
            {'●'.repeat(stage)}
          </span>
          <span>H{stage}</span>
        </>
      ) : (
        <span className="text-gray-400">H?</span>
      )}
    </span>
  )
}

interface HurleyStageCardProps {
  stage: HurleyStage
  compact?: boolean
}

/**
 * Information card showing Hurley stage details
 */
export function HurleyStageCard({ stage, compact = false }: HurleyStageCardProps) {
  const info = HURLEY_STAGE_INFO[stage]
  const colors = getHurleSeverityColors(stage)

  if (compact) {
    return (
      <div className={`p-3 rounded-lg ${colors.bg} ${colors.border} border`}>
        <div className="flex items-center gap-2">
          <HurleyStageIndicator stage={stage} size="md" showLabel />
          <span className={`text-sm ${colors.text}`}>
            {info.shortDescription}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-lg ${colors.bg} ${colors.border} border`}>
      <div className="flex items-center gap-3 mb-3">
        <HurleyStageIndicator stage={stage} size="lg" />
        <div>
          <h4 className={`font-semibold ${colors.text}`}>{info.name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {info.shortDescription}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        {info.fullDescription}
      </p>

      <div className="space-y-3">
        <div>
          <h5 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
            Criteria
          </h5>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
            {info.criteria.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
            Typical Features
          </h5>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
            {info.typicalFeatures.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
