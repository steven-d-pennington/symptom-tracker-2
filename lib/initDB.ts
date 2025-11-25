import { db, User } from './db'
import { PRESET_SYMPTOMS } from './presets/symptoms'
import { PRESET_TRIGGERS } from './presets/triggers'
import { PRESET_FOODS } from './presets/foods'
import { generateGUID, getCurrentTimestamp } from './utils'

/**
 * Initialize database with preset data and default user
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Check if database is already initialized
    const userCount = await db.users.count()

    if (userCount > 0) {
      // Database already initialized
      return
    }

    const now = getCurrentTimestamp()

    // Create default user
    const defaultUser: User = {
      guid: generateGUID(),
      theme: 'system',
      notificationSettings: {},
      privacySettings: {},
      createdAt: now,
      updatedAt: now,
    }

    await db.users.add(defaultUser)

    // Add preset symptoms
    const symptoms = PRESET_SYMPTOMS.map(symptom => ({
      ...symptom,
      createdAt: now,
      updatedAt: now,
    }))
    await db.symptoms.bulkAdd(symptoms)

    // Add preset triggers
    const triggers = PRESET_TRIGGERS.map(trigger => ({
      ...trigger,
      createdAt: now,
      updatedAt: now,
    }))
    await db.triggers.bulkAdd(triggers)

    // Add preset foods
    const foods = PRESET_FOODS.map(food => ({
      ...food,
      createdAt: now,
      updatedAt: now,
    }))
    await db.foods.bulkAdd(foods)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}

/**
 * Get the current user (single-user system)
 */
export async function getCurrentUser(): Promise<User | undefined> {
  const users = await db.users.toArray()
  return users[0]
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  updates: Partial<Omit<User, 'id' | 'guid' | 'createdAt'>>
): Promise<void> {
  const user = await getCurrentUser()

  if (!user || !user.id) {
    throw new Error('User not found')
  }

  await db.users.update(user.id, {
    ...updates,
    updatedAt: getCurrentTimestamp(),
  })
}
