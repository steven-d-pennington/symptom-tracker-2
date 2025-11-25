'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { exportFullBackup, downloadJSON, getBackupSize, FullBackup } from '@/lib/export/exportJSON'
import {
  exportTableToCSV,
  downloadCSV,
  getTableDisplayName,
  EXPORTABLE_TABLES,
  ExportableTable
} from '@/lib/export/exportCSV'

type ExportFormat = 'json' | 'csv'

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json')
  const [selectedTables, setSelectedTables] = useState<Set<ExportableTable>>(new Set(EXPORTABLE_TABLES))
  const [dateRangeEnabled, setDateRangeEnabled] = useState(false)
  const [dateStart, setDateStart] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 3)
    return d.toISOString().split('T')[0]
  })
  const [dateEnd, setDateEnd] = useState(() => new Date().toISOString().split('T')[0])
  const [backupPreview, setBackupPreview] = useState<FullBackup | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const toggleTable = (table: ExportableTable) => {
    setSelectedTables(prev => {
      const next = new Set(prev)
      if (next.has(table)) {
        next.delete(table)
      } else {
        next.add(table)
      }
      return next
    })
  }

  const selectAllTables = () => {
    setSelectedTables(new Set(EXPORTABLE_TABLES))
  }

  const deselectAllTables = () => {
    setSelectedTables(new Set())
  }

  const loadBackupPreview = useCallback(async () => {
    try {
      const backup = await exportFullBackup()
      setBackupPreview(backup)
    } catch (error) {
      console.error('Error loading backup preview:', error)
    }
  }, [])

  const handleJSONExport = async () => {
    setIsExporting(true)
    setMessage(null)

    try {
      const backup = await exportFullBackup()
      downloadJSON(backup)
      setMessage({ type: 'success', text: 'Full backup exported successfully!' })
    } catch (error) {
      console.error('Error exporting JSON:', error)
      setMessage({ type: 'error', text: 'Failed to export backup. Please try again.' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleCSVExport = async () => {
    if (selectedTables.size === 0) {
      setMessage({ type: 'error', text: 'Please select at least one table to export.' })
      return
    }

    setIsExporting(true)
    setMessage(null)

    try {
      const dateRange = dateRangeEnabled
        ? { start: new Date(dateStart), end: new Date(dateEnd + 'T23:59:59') }
        : undefined

      const date = new Date().toISOString().split('T')[0]

      for (const table of selectedTables) {
        const csv = await exportTableToCSV(table, dateRange)
        const filename = `symptom-tracker-${table}-${date}.csv`
        downloadCSV(csv, filename)

        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      setMessage({ type: 'success', text: `Exported ${selectedTables.size} file(s) successfully!` })
    } catch (error) {
      console.error('Error exporting CSV:', error)
      setMessage({ type: 'error', text: 'Failed to export CSV. Please try again.' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExport = () => {
    if (exportFormat === 'json') {
      handleJSONExport()
    } else {
      handleCSVExport()
    }
  }

  // Load preview on mount
  useState(() => {
    loadBackupPreview()
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Export Data
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Backup your health data
              </p>
            </div>
            <Link
              href="/analytics"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Back to Analytics
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Format Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Export Format
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setExportFormat('json')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                exportFormat === 'json'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📦</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">JSON Backup</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete backup of all data. Best for migration or restoring.
              </p>
            </button>

            <button
              onClick={() => setExportFormat('csv')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                exportFormat === 'csv'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📊</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">CSV Export</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Spreadsheet format. Best for analysis in Excel or Google Sheets.
              </p>
            </button>
          </div>
        </div>

        {/* JSON Options */}
        {exportFormat === 'json' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Full Backup Details
            </h2>

            {backupPreview ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Records:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {backupPreview.metadata.totalRecords.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tables Included:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {backupPreview.metadata.tableCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Estimated Size:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {getBackupSize(backupPreview)}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Includes: users, symptoms, symptom logs, medications, triggers, foods, meals, flares, daily entries, and more.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Loading preview...</p>
            )}
          </div>
        )}

        {/* CSV Options */}
        {exportFormat === 'csv' && (
          <>
            {/* Table Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Select Tables
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllTables}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={deselectAllTables}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {EXPORTABLE_TABLES.map(table => (
                  <label
                    key={table}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedTables.has(table)
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTables.has(table)}
                      onChange={() => toggleTable(table)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {getTableDisplayName(table)}
                    </span>
                  </label>
                ))}
              </div>

              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {selectedTables.size} table(s) selected
              </p>
            </div>

            {/* Date Range */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="dateRangeEnabled"
                  checked={dateRangeEnabled}
                  onChange={(e) => setDateRangeEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                />
                <label
                  htmlFor="dateRangeEnabled"
                  className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                >
                  Filter by Date Range
                </label>
              </div>

              {dateRangeEnabled && (
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting || (exportFormat === 'csv' && selectedTables.size === 0)}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export {exportFormat === 'json' ? 'Full Backup' : `${selectedTables.size} CSV File(s)`}
            </>
          )}
        </button>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            About Your Data
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>All data is stored locally on your device</li>
            <li>Exports do not upload anything to the cloud</li>
            <li>JSON backups can be used to restore your data</li>
            <li>CSV files can be opened in spreadsheet applications</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
