'use client'

import { useState, useEffect } from 'react'
import { TriggerEvent, Trigger } from '@/lib/db'
import { db } from '@/lib/db'
import { Intensity } from '@/lib/triggers/logTrigger'

interface TriggerCardProps {
  event: TriggerEvent
  onDelete?: (guid: string) => void
}

const INTENSITY_COLORS: Record<Intensity, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const INTENSITY_DOTS: Record<Intensity, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
}

const CATEGORY_ICONS: Record<string, string> = {
  environmental: '🌍',
  lifestyle: '🏃',
  dietary: '🍽️',
}

export function TriggerCard({ event, onDelete }: TriggerCardProps) {
  const [trigger, setTrigger] = useState<Trigger | null>(null)

  useEffect(() => {
    async function loadTrigger() {
      const t = await db.triggers.where('guid').equals(event.triggerId).first()
      if (t) setTrigger(t)
    }
    loadTrigger()
  }, [event.triggerId])

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (!trigger) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{CATEGORY_ICONS[trigger.category]}</span>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {trigger.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${INTENSITY_COLORS[event.intensity]}`}>
            <span className={`w-2 h-2 rounded-full ${INTENSITY_DOTS[event.intensity]}`}></span>
            {event.intensity.charAt(0).toUpperCase() + event.intensity.slice(1)}
          </span>
        </div>
      </div>

      {event.notes && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
          {event.notes}
        </p>
      )}

      {onDelete && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            onClick={() => onDelete(event.guid)}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
