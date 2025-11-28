'use client'

import { useMemo } from 'react'
import { IHS4Result, IHS4Severity, LesionType, IHS4_WEIGHTS } from '@/lib/hs/types'

interface IHS4ScoreCardProps {
  result: IHS4Result
  previousResult?: IHS4Result   // For trend comparison
  className?: string
  compact?: boolean             // Show minimal version
}

/**
 * Severity level styling
 */
const SEVERITY_STYLES: Record<IHS4Severity, { bg: string; text: string; border: string }> = {
  mild: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  moderate: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  severe: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
}

/**
 * Lesion type labels for display
 */
const TYPE_LABELS: Record<LesionType, string> = {
  nodule: 'Nodules',
  abscess: 'Abscesses',
  draining_tunnel: 'Draining Tunnels',
}

/**
 * Calculate trend indicator
 */
function getTrend(current: number, previous?: number): { direction: 'up' | 'down' | 'stable'; diff: number } {
  if (previous === undefined) return { direction: 'stable', diff: 0 }
  const diff = current - previous
  if (diff > 0) return { direction: 'up', diff }
  if (diff < 0) return { direction: 'down', diff: Math.abs(diff) }
  return { direction: 'stable', diff: 0 }
}

/**
 * Trend arrow component
 */
function TrendIndicator({ direction, diff }: { direction: 'up' | 'down' | 'stable'; diff: number }) {
  if (direction === 'stable') {
    return <span className="text-gray-400">-</span>
  }

  if (direction === 'up') {
    return (
      <span className="flex items-center text-red-500" title={`Increased by ${diff}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
        <span className="text-xs ml-0.5">+{diff}</span>
      </span>
    )
  }

  return (
    <span className="flex items-center text-green-500" title={`Decreased by ${diff}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
      <span className="text-xs ml-0.5">-{diff}</span>
    </span>
  )
}

/**
 * Compact version of the score card
 */
function CompactScoreCard({ result }: { result: IHS4Result }) {
  const styles = SEVERITY_STYLES[result.severity]

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${styles.bg} ${styles.border} border`}>
      <span className={`font-bold ${styles.text}`}>IHS4: {result.score}</span>
      <span className={`text-sm capitalize ${styles.text}`}>({result.severity})</span>
    </div>
  )
}

export function IHS4ScoreCard({ result, previousResult, className = '', compact = false }: IHS4ScoreCardProps) {
  const styles = SEVERITY_STYLES[result.severity]
  const scoreTrend = useMemo(() => getTrend(result.score, previousResult?.score), [result.score, previousResult?.score])

  if (compact) {
    return <CompactScoreCard result={result} />
  }

  return (
    <div className={`rounded-lg border ${styles.border} overflow-hidden ${className}`}>
      {/* Header with score */}
      <div className={`${styles.bg} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">IHS4 Score</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${styles.text}`}>{result.score}</span>
              <span className={`text-sm font-medium capitalize ${styles.text}`}>{result.severity}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <TrendIndicator direction={scoreTrend.direction} diff={scoreTrend.diff} />
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              vs previous
            </span>
          </div>
        </div>
      </div>

      {/* Lesion breakdown */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 space-y-2">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Breakdown
        </h4>

        {/* Nodules */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">{TYPE_LABELS.nodule}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {result.breakdown.nodules} x {IHS4_WEIGHTS.nodule}
            </span>
            <span className="text-sm text-gray-500">
              = {result.breakdown.nodules * IHS4_WEIGHTS.nodule}
            </span>
          </div>
        </div>

        {/* Abscesses */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">{TYPE_LABELS.abscess}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {result.breakdown.abscesses} x {IHS4_WEIGHTS.abscess}
            </span>
            <span className="text-sm text-gray-500">
              = {result.breakdown.abscesses * IHS4_WEIGHTS.abscess}
            </span>
          </div>
        </div>

        {/* Draining Tunnels */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">{TYPE_LABELS.draining_tunnel}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {result.breakdown.drainingTunnels} x {IHS4_WEIGHTS.draining_tunnel}
            </span>
            <span className="text-sm text-gray-500">
              = {result.breakdown.drainingTunnels * IHS4_WEIGHTS.draining_tunnel}
            </span>
          </div>
        </div>

        {/* Total divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Total</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{result.score}</span>
          </div>
        </div>
      </div>

      {/* Severity scale reference */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Mild: 0-3
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            Moderate: 4-10
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Severe: 11+
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Mini IHS4 badge for inline display
 */
export function IHS4Badge({ score, severity }: { score: number; severity: IHS4Severity }) {
  const styles = SEVERITY_STYLES[severity]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles.bg} ${styles.text}`}>
      {score}
    </span>
  )
}
