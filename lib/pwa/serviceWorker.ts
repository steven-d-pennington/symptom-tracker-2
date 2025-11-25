'use client'

export interface ServiceWorkerStatus {
  isSupported: boolean
  isRegistered: boolean
  isOnline: boolean
  updateAvailable: boolean
}

let swRegistration: ServiceWorkerRegistration | null = null
let updateAvailableCallback: (() => void) | null = null

export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    console.log('[PWA] Service workers not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })

    swRegistration = registration
    console.log('[PWA] Service worker registered:', registration.scope)

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[PWA] New service worker available')
          if (updateAvailableCallback) {
            updateAvailableCallback()
          }
        }
      })
    })

    // Check for updates periodically (every hour)
    setInterval(() => {
      registration.update()
    }, 60 * 60 * 1000)

    return registration
  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error)
    return null
  }
}

export function onUpdateAvailable(callback: () => void): void {
  updateAvailableCallback = callback
}

export function skipWaiting(): void {
  if (swRegistration?.waiting) {
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (!isServiceWorkerSupported()) return false

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      await registration.unregister()
    }
    console.log('[PWA] Service workers unregistered')
    return true
  } catch (error) {
    console.error('[PWA] Failed to unregister service workers:', error)
    return false
  }
}

export function getServiceWorkerStatus(): ServiceWorkerStatus {
  return {
    isSupported: isServiceWorkerSupported(),
    isRegistered: swRegistration !== null,
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    updateAvailable: false // Updated via callback
  }
}

// Listen for online/offline events
export function setupNetworkListeners(
  onOnline?: () => void,
  onOffline?: () => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  const handleOnline = () => {
    console.log('[PWA] Back online')
    onOnline?.()
  }

  const handleOffline = () => {
    console.log('[PWA] Gone offline')
    onOffline?.()
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}
