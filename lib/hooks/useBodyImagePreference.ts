'use client'

import { useState, useEffect, useCallback } from 'react'
import { BodyImagePreference } from '@/lib/db'
import {
  getBodyImagePreference,
  updateBodyImagePreference,
} from '@/lib/settings/userSettings'

interface UseBodyImagePreferenceReturn {
  preference: BodyImagePreference | null
  isLoading: boolean
  error: Error | null
  updatePreference: (pref: BodyImagePreference | null) => Promise<void>
}

/**
 * Hook to load and manage the user's body image preference
 */
export function useBodyImagePreference(): UseBodyImagePreferenceReturn {
  const [preference, setPreference] = useState<BodyImagePreference | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load preference on mount
  useEffect(() => {
    let mounted = true

    async function loadPreference() {
      try {
        const pref = await getBodyImagePreference()
        if (mounted) {
          setPreference(pref)
          setIsLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load preference'))
          setIsLoading(false)
        }
      }
    }

    loadPreference()

    return () => {
      mounted = false
    }
  }, [])

  // Update preference
  const updatePref = useCallback(async (newPref: BodyImagePreference | null) => {
    try {
      await updateBodyImagePreference(newPref)
      setPreference(newPref)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update preference'))
      throw err
    }
  }, [])

  return {
    preference,
    isLoading,
    error,
    updatePreference: updatePref,
  }
}
