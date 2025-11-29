'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  generateHSReport,
  formatReportAsCSV,
  formatReportAsJSON,
  getDateRangeFromPreset,
  type HSProviderReport,
  type DateRangePreset,
} from '@/lib/hs'
import { ProviderReport } from '@/components/hs'

export default function HSReportPage() {
  const [report, setReport] = useState<HSProviderReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [datePreset, setDatePreset] = useState<DateRangePreset>('30d')
  const [customRange, setCustomRange] = useState({ start: '', end: '' })

  const dateRange = useMemo(() => {
    if (datePreset === 'custom' && customRange.start && customRange.end) {
      return { start: customRange.start, end: customRange.end, preset: 'custom' as const }
    }
    return getDateRangeFromPreset(datePreset)
  }, [datePreset, customRange])

  const loadReport = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const generatedReport = await generateHSReport({
        startDate: dateRange.start,
        endDate: dateRange.end,
      })
      setReport(generatedReport)
    } catch (err) {
      console.error('Error generating report:', err)
      setError('Failed to generate report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    if (!report) return
    const csv = formatReportAsCSV(report)
    downloadFile(csv, 'hs-report.csv', 'text/csv')
  }

  const handleExportJSON = () => {
    if (!report) return
    const json = formatReportAsJSON(report)
    downloadFile(json, 'hs-report.json', 'application/json')
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Generating report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 print:bg-white">
      {/* Header - hidden on print */}
      <header className="bg-white dark:bg-gray-800 shadow print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Provider Report
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate a report to share with your healthcare provider
              </p>
            </div>
            <Link
              href="/hs"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              &larr; Back to HS Tracker
            </Link>
          </div>
        </div>
      </header>

      {/* Controls - hidden on print */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:hidden">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Date Range:
              </label>
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value as DateRangePreset)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
                <option value="custom">Custom range</option>
              </select>
            </div>

            {/* Custom date inputs */}
            {datePreset === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) => setCustomRange((prev) => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) => setCustomRange((prev) => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Export buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <PrintIcon />
                Print / PDF
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 print:px-0 print:max-w-none">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
            {error}
          </div>
        ) : report ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 print:shadow-none print:p-0">
            <ProviderReport report={report} />
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No data available for this date range.
          </div>
        )}
      </main>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .provider-report {
            font-size: 12pt;
            line-height: 1.4;
          }

          @page {
            margin: 1in;
            size: letter;
          }
        }
      `}</style>
    </div>
  )
}

function PrintIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
      />
    </svg>
  )
}
