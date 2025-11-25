'use client'

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/db'
import {
  generateTestData,
  clearAllData,
  getDataStats,
  DataGenerationProgress
} from '@/lib/admin/dataGenerator'

interface TableInfo {
  name: string
  count: number
  data?: Record<string, unknown>[]
}

export function SuperAdmin() {
  // Data Generator State
  const [years, setYears] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState<DataGenerationProgress | null>(null)
  const [generationResult, setGenerationResult] = useState<{
    success: boolean
    stats?: Record<string, number>
    error?: string
  } | null>(null)

  // Database Stats State
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loadingStats, setLoadingStats] = useState(true)

  // IndexedDB Viewer State
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([])
  const [loadingTable, setLoadingTable] = useState(false)
  const [tableOffset, setTableOffset] = useState(0)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const tableLimit = 50

  // Clearing State
  const [clearing, setClearing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Load initial stats
  const loadStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const data = await getDataStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  // Handle data generation
  const handleGenerate = async () => {
    setGenerating(true)
    setGenerationResult(null)
    setProgress(null)

    try {
      const result = await generateTestData({
        years,
        onProgress: setProgress
      })
      setGenerationResult(result)
      await loadStats()
    } catch (error) {
      setGenerationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setGenerating(false)
    }
  }

  // Handle data clearing
  const handleClear = async () => {
    setClearing(true)
    setShowClearConfirm(false)

    try {
      const result = await clearAllData()
      if (result.success) {
        setGenerationResult({
          success: true,
          stats: { cleared: 1 }
        })
      } else {
        setGenerationResult({
          success: false,
          error: result.error
        })
      }
      await loadStats()
      setSelectedTable(null)
      setTableData([])
    } catch (error) {
      setGenerationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setClearing(false)
    }
  }

  // Load table data for IndexedDB viewer
  const loadTableData = async (tableName: string, offset: number = 0) => {
    setLoadingTable(true)
    setSelectedTable(tableName)
    setTableOffset(offset)
    setExpandedRows(new Set())

    try {
      // Access database table dynamically
      const dbAny = db as unknown as Record<string, {
        offset: (n: number) => { limit: (n: number) => { toArray: () => Promise<Record<string, unknown>[]> } }
      }>
      const table = dbAny[tableName]

      if (table && typeof table.offset === 'function') {
        const data = await table.offset(offset).limit(tableLimit).toArray()
        setTableData(data)
      }
    } catch (error) {
      console.error('Error loading table:', error)
      setTableData([])
    } finally {
      setLoadingTable(false)
    }
  }

  // Delete a record
  const handleDeleteRecord = async (tableName: string, id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      // Access database table dynamically
      const dbAny = db as unknown as Record<string, {
        delete: (id: number) => Promise<void>
      }>
      const table = dbAny[tableName]

      if (table && typeof table.delete === 'function') {
        await table.delete(id)
        await loadTableData(tableName, tableOffset)
        await loadStats()
      }
    } catch (error) {
      console.error('Error deleting record:', error)
      alert('Error deleting record')
    }
  }

  // Toggle row expansion
  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  // Format value for display
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'object') {
      if (value instanceof ArrayBuffer) {
        return `[ArrayBuffer: ${value.byteLength} bytes]`
      }
      return JSON.stringify(value, null, 2)
    }
    if (typeof value === 'number' && value > 1000000000000) {
      return new Date(value).toLocaleString()
    }
    return String(value)
  }

  // Table names from db
  const tableNames = [
    'users',
    'symptoms',
    'symptomInstances',
    'medications',
    'medicationEvents',
    'triggers',
    'triggerEvents',
    'foods',
    'foodEvents',
    'foodCombinationCorrelations',
    'flares',
    'flareEvents',
    'flareBodyLocations',
    'dailyEntries',
    'bodyMapLocations',
    'photoAttachments',
    'photoComparisons',
    'uxEvents'
  ]

  return (
    <div className="space-y-8">
      {/* Data Generator Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🔧</span>
          Test Data Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Generate realistic test data simulating a daily user with chronic symptoms and flares.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end mb-4">
          <div>
            <label htmlFor="years" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Period (Years)
            </label>
            <select
              id="years"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              disabled={generating}
              className="block w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={1}>1 Year</option>
              <option value={2}>2 Years</option>
              <option value={3}>3 Years</option>
              <option value={4}>4 Years</option>
              <option value={5}>5 Years</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? 'Generating...' : 'Generate Data'}
          </button>
        </div>

        {/* Progress bar */}
        {progress && generating && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>{progress.message}</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Generation result */}
        {generationResult && (
          <div className={`p-4 rounded-md ${
            generationResult.success
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            {generationResult.success ? (
              <div>
                <p className="font-medium mb-2">✓ Data generation complete!</p>
                {generationResult.stats && !generationResult.stats.cleared && (
                  <ul className="text-sm grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {Object.entries(generationResult.stats).map(([key, value]) => (
                      <li key={key}>{key}: {value.toLocaleString()}</li>
                    ))}
                  </ul>
                )}
                {generationResult.stats?.cleared && (
                  <p className="text-sm">All data has been cleared.</p>
                )}
              </div>
            ) : (
              <p>✗ Error: {generationResult.error}</p>
            )}
          </div>
        )}
      </section>

      {/* Database Statistics Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Database Statistics
          </h2>
          <button
            onClick={loadStats}
            disabled={loadingStats}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            {loadingStats ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loadingStats ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(stats).map(([key, value]) => (
              <div
                key={key}
                className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg"
              >
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* IndexedDB Viewer Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🗃️</span>
          IndexedDB Viewer
        </h2>

        {/* Table selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tableNames.map((name) => (
            <button
              key={name}
              onClick={() => loadTableData(name, 0)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedTable === name
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {name}
              {stats[name] !== undefined && (
                <span className="ml-1 text-xs opacity-70">({stats[name]})</span>
              )}
            </button>
          ))}
        </div>

        {/* Table data */}
        {selectedTable && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {loadingTable ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            ) : tableData.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No records in this table
              </div>
            ) : (
              <>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 font-medium">
                          #
                        </th>
                        <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 font-medium">
                          ID
                        </th>
                        <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 font-medium">
                          GUID
                        </th>
                        <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 font-medium">
                          Data Preview
                        </th>
                        <th className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {tableData.map((row, index) => (
                        <>
                          <tr
                            key={`row-${index}`}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                            onClick={() => toggleRowExpansion(index)}
                          >
                            <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                              {tableOffset + index + 1}
                            </td>
                            <td className="px-3 py-2 text-gray-900 dark:text-white font-mono">
                              {String(row.id || '-')}
                            </td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                              {row.guid ? String(row.guid).substring(0, 8) + '...' : '-'}
                            </td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400 truncate max-w-xs">
                              {Object.entries(row)
                                .filter(([k]) => !['id', 'guid', 'encryptedData', 'thumbnailData'].includes(k))
                                .slice(0, 3)
                                .map(([k, v]) => `${k}: ${formatValue(v).substring(0, 20)}`)
                                .join(', ')}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (row.id) handleDeleteRecord(selectedTable, row.id as number)
                                }}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                          {expandedRows.has(index) && (
                            <tr key={`expanded-${index}`}>
                              <td colSpan={5} className="px-3 py-2 bg-gray-50 dark:bg-gray-900">
                                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-64">
                                  {JSON.stringify(
                                    Object.fromEntries(
                                      Object.entries(row).filter(
                                        ([k]) => !['encryptedData', 'thumbnailData'].includes(k)
                                      )
                                    ),
                                    null,
                                    2
                                  )}
                                </pre>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => loadTableData(selectedTable, Math.max(0, tableOffset - tableLimit))}
                    disabled={tableOffset === 0}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {tableOffset + 1} - {tableOffset + tableData.length}
                    {stats[selectedTable] !== undefined && ` of ${stats[selectedTable]}`}
                  </span>
                  <button
                    onClick={() => loadTableData(selectedTable, tableOffset + tableLimit)}
                    disabled={tableData.length < tableLimit}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Clear Data Section */}
      <section className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-6 border border-red-200 dark:border-red-800">
        <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          Clear All Data
        </h2>
        <p className="text-red-700 dark:text-red-300 mb-4">
          This will permanently delete all data except user settings. This action cannot be undone.
        </p>

        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Clear All Data
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleClear}
              disabled={clearing}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {clearing ? 'Clearing...' : 'Yes, Clear Everything'}
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              disabled={clearing}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
