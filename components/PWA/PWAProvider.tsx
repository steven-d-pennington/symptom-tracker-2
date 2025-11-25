'use client'

import { useEffect, useState } from 'react'
import { registerServiceWorker, onUpdateAvailable, skipWaiting } from '@/lib/pwa/serviceWorker'
import { InstallPrompt, UpdatePrompt, OfflineIndicator } from './InstallPrompt'

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // Register service worker
    registerServiceWorker()

    // Listen for updates
    onUpdateAvailable(() => {
      setUpdateAvailable(true)
    })
  }, [])

  const handleUpdate = () => {
    skipWaiting()
    window.location.reload()
  }

  return (
    <>
      {children}
      <OfflineIndicator />
      <InstallPrompt />
      {updateAvailable && <UpdatePrompt onUpdate={handleUpdate} />}
    </>
  )
}
