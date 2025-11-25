import { db, Trigger } from '../db'
import { generateGUID, getCurrentTimestamp } from '../utils'

export type TriggerCategory = 'environmental' | 'lifestyle' | 'dietary'

/**
 * Create a new trigger
 */
export async function createTrigger(data: {
  name: string
  category: TriggerCategory
  description?: string
}): Promise<Trigger> {
  const now = getCurrentTimestamp()

  const trigger: Trigger = {
    guid: generateGUID(),
    name: data.name.trim(),
    category: data.category,
    description: data.description?.trim(),
    isActive: true,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  }

  await db.triggers.add(trigger)
  console.log('Trigger created:', trigger.guid)
  return trigger
}

/**
 * Update a trigger
 */
export async function updateTrigger(
  guid: string,
  updates: Partial<Pick<Trigger, 'name' | 'category' | 'description'>>
): Promise<void> {
  const existing = await getTriggerById(guid)
  if (!existing) {
    throw new Error('Trigger not found')
  }

  await db.triggers.where('guid').equals(guid).modify({
    ...updates,
    updatedAt: getCurrentTimestamp(),
  })
}

/**
 * Deactivate a trigger (soft delete)
 */
export async function deactivateTrigger(guid: string): Promise<void> {
  await db.triggers.where('guid').equals(guid).modify({
    isActive: false,
    updatedAt: getCurrentTimestamp(),
  })
}

/**
 * Reactivate a trigger
 */
export async function reactivateTrigger(guid: string): Promise<void> {
  await db.triggers.where('guid').equals(guid).modify({
    isActive: true,
    updatedAt: getCurrentTimestamp(),
  })
}

/**
 * Get a single trigger by ID
 */
export async function getTriggerById(guid: string): Promise<Trigger | undefined> {
  return await db.triggers.where('guid').equals(guid).first()
}

/**
 * Get all triggers
 */
export async function getAllTriggers(): Promise<Trigger[]> {
  return await db.triggers.toArray()
}

/**
 * Search triggers by name
 */
export async function searchTriggers(query: string): Promise<Trigger[]> {
  const lowerQuery = query.toLowerCase()
  return await db.triggers
    .filter((t) => t.name.toLowerCase().includes(lowerQuery))
    .toArray()
}
