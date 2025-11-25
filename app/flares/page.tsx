'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Flare } from '@/lib/db'
import { getActiveFlares } from '@/lib/flares/createFlare'
import { FlareCard } from '@/components/Flares/FlareCard'
import { FlareCreationFlow } from '@/components/Flares/FlareCreationFlow'
import { FlareUpdateModal } from '@/components/Flares/FlareUpdateModal'
import { FlareResolutionModal } from '@/components/Flares/FlareResolutionModal'

export default function FlaresPage() {
  const router = useRouter()
  const [flares, setFlares] = useState<Flare[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFlare, setSelectedFlare] = useState<Flare | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [resolveModalOpen, setResolveModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'severity'>('date')

  const loadFlares = async () => {
    setIsLoading(true)
    try {
      const activeFlares = await getActiveFlares()
      setFlares(activeFlares)
    } catch (error) {
      console.error('Error loading flares:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFlares()
  }, [])

  const sortedFlares = [...flares].sort((a, b) => {
    if (sortBy === 'date') {
      return b.startDate - a.startDate // Newest first
    } else {
      return b.currentSeverity - a.currentSeverity // Highest severity first
    }
  })

  const handleUpdate = (flare: Flare) => {
    setSelectedFlare(flare)
    setUpdateModalOpen(true)
  }

  const handleResolve = (flare: Flare) => {
    setSelectedFlare(flare)
    setResolveModalOpen(true)
  }

  const handleModalSuccess = () => {
    loadFlares() // Reload flares
    setSelectedFlare(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <p className="text-gray-600 dark:text-gray-400">Loading active flares</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Active Flares</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {flares.length} active {flares.length === 1 ? 'flare' : 'flares'}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('date')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'date'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Sort by Date
            </button>
            <button
              onClick={() => setSortBy('severity')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'severity'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Sort by Severity
            </button>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            + New Flare
          </button>
        </div>

        {/* Flares Grid */}
        {flares.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No Active Flares
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don&apos;t have any active flares at the moment.
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Track a New Flare
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedFlares.map((flare) => (
              <FlareCard
                key={flare.guid}
                flare={flare}
                onUpdate={() => handleUpdate(flare)}
                onResolve={() => handleResolve(flare)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <FlareCreationFlow
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false)
          loadFlares() // Reload flares after creating a new one
        }}
      />
      {selectedFlare && (
        <>
          <FlareUpdateModal
            isOpen={updateModalOpen}
            onClose={() => {
              setUpdateModalOpen(false)
              setSelectedFlare(null)
            }}
            flare={selectedFlare}
            onSuccess={handleModalSuccess}
          />
          <FlareResolutionModal
            isOpen={resolveModalOpen}
            onClose={() => {
              setResolveModalOpen(false)
              setSelectedFlare(null)
            }}
            flare={selectedFlare}
            onSuccess={handleModalSuccess}
          />
        </>
      )}
    </div>
  )
}
