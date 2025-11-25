'use client'

import { useEffect, useState } from 'react'
import { initializeDatabase } from '@/lib/initDB'

export function Providers({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeDatabase()
      .then(() => {
        setIsInitialized(true)
      })
      .catch((err) => {
        console.error('Failed to initialize database:', err)
        setError('Failed to initialize database')
      })
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p>Initializing Pocket Symptom Tracker</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
