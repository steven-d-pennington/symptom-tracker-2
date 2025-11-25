/**
 * Optimistic UI update utilities
 *
 * These utilities help implement optimistic updates where the UI updates
 * immediately before the async operation completes, then reconciles with
 * the actual result.
 */

export interface OptimisticUpdate<T> {
  optimisticValue: T
  actualPromise: Promise<T>
  rollback: () => void
}

/**
 * Creates an optimistic update wrapper
 *
 * Usage:
 * const update = createOptimisticUpdate(
 *   { ...currentItem, name: newName }, // optimistic value
 *   db.items.update(id, { name: newName }), // actual operation
 *   () => setItem(currentItem) // rollback function
 * )
 *
 * setItem(update.optimisticValue) // immediate UI update
 *
 * try {
 *   await update.actualPromise // wait for real operation
 * } catch (error) {
 *   update.rollback() // revert on failure
 * }
 */
export function createOptimisticUpdate<T>(
  optimisticValue: T,
  actualPromise: Promise<T>,
  rollback: () => void
): OptimisticUpdate<T> {
  return {
    optimisticValue,
    actualPromise,
    rollback
  }
}

/**
 * Execute an optimistic update with automatic rollback on failure
 */
export async function executeOptimistic<T>(
  setOptimistic: (value: T) => void,
  optimisticValue: T,
  operation: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<T | null> {
  const previousValue = optimisticValue // capture for potential rollback

  // Apply optimistic update immediately
  setOptimistic(optimisticValue)

  try {
    // Execute actual operation
    const result = await operation()
    // Update with actual result (may differ slightly from optimistic)
    setOptimistic(result)
    return result
  } catch (error) {
    // Rollback on failure
    setOptimistic(previousValue)
    onError?.(error as Error)
    return null
  }
}

/**
 * Debounced save utility for form inputs
 * Provides immediate local updates with debounced persistence
 */
export function createDebouncedSave<T>(
  saveFunction: (value: T) => Promise<void>,
  delay: number = 500
): {
  save: (value: T) => void
  flush: () => Promise<void>
  cancel: () => void
} {
  let timeoutId: NodeJS.Timeout | null = null
  let pendingValue: T | null = null
  let savePromise: Promise<void> | null = null

  const save = (value: T) => {
    pendingValue = value

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(async () => {
      if (pendingValue !== null) {
        savePromise = saveFunction(pendingValue)
        pendingValue = null
        await savePromise
        savePromise = null
      }
    }, delay)
  }

  const flush = async () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    if (pendingValue !== null) {
      savePromise = saveFunction(pendingValue)
      pendingValue = null
      await savePromise
      savePromise = null
    }

    // Wait for any in-flight save
    if (savePromise) {
      await savePromise
    }
  }

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    pendingValue = null
  }

  return { save, flush, cancel }
}

/**
 * Hook-compatible optimistic list operations
 */
export interface OptimisticListOperations<T extends { id?: number; guid: string }> {
  add: (item: T) => T
  update: (guid: string, updates: Partial<T>) => void
  remove: (guid: string) => void
  getItems: () => T[]
  reconcile: (actualItems: T[]) => void
}

export function createOptimisticList<T extends { id?: number; guid: string }>(
  initialItems: T[],
  onUpdate: (items: T[]) => void
): OptimisticListOperations<T> {
  let items = [...initialItems]

  const add = (item: T): T => {
    items = [...items, item]
    onUpdate(items)
    return item
  }

  const update = (guid: string, updates: Partial<T>) => {
    items = items.map(item =>
      item.guid === guid ? { ...item, ...updates } : item
    )
    onUpdate(items)
  }

  const remove = (guid: string) => {
    items = items.filter(item => item.guid !== guid)
    onUpdate(items)
  }

  const getItems = () => items

  const reconcile = (actualItems: T[]) => {
    items = actualItems
    onUpdate(items)
  }

  return { add, update, remove, getItems, reconcile }
}

/**
 * Pending operation tracker for showing save status
 */
export interface PendingOperations {
  pending: Set<string>
  add: (id: string) => void
  remove: (id: string) => void
  has: (id: string) => boolean
  count: () => number
  clear: () => void
}

export function createPendingTracker(
  onChange?: (count: number) => void
): PendingOperations {
  const pending = new Set<string>()

  const notifyChange = () => {
    onChange?.(pending.size)
  }

  return {
    pending,
    add: (id: string) => {
      pending.add(id)
      notifyChange()
    },
    remove: (id: string) => {
      pending.delete(id)
      notifyChange()
    },
    has: (id: string) => pending.has(id),
    count: () => pending.size,
    clear: () => {
      pending.clear()
      notifyChange()
    }
  }
}
