import { db } from '../db'
import { updateUserPreferences } from '../initDB'
import { generateGUID, getCurrentTimestamp } from '../utils'
import { OnboardingState } from './onboardingState'

/**
 * Complete onboarding and save all user selections
 */
export async function completeOnboarding(state: OnboardingState): Promise<void> {
  const now = getCurrentTimestamp()

  try {
    await db.transaction(
      'rw',
      [
        db.users,
        db.symptoms,
        db.medications,
        db.triggers,
        db.foods,
      ],
      async () => {
        // 1. Activate selected preset symptoms
        if (state.selections.symptoms.length > 0) {
          await db.symptoms
            .where('guid')
            .anyOf(state.selections.symptoms)
            .modify({ isActive: true, updatedAt: now })
        }

        // 2. Create custom symptoms
        for (const custom of state.customItems.symptoms) {
          await db.symptoms.add({
            guid: generateGUID(),
            name: custom.name,
            category: custom.category,
            description: custom.description,
            severityScale: { min: 1, max: 10 },
            isActive: true,
            isDefault: false,
            createdAt: now,
            updatedAt: now,
          })
        }

        // 3. Activate selected preset medications
        if (state.selections.medications.length > 0) {
          await db.medications
            .where('guid')
            .anyOf(state.selections.medications)
            .modify({ isActive: true, updatedAt: now })
        }

        // 4. Create custom medications
        for (const custom of state.customItems.medications) {
          await db.medications.add({
            guid: generateGUID(),
            name: custom.name,
            dosage: custom.dosage,
            frequency: custom.frequency || 'as-needed',
            schedule: { times: [] },
            isActive: true,
            isDefault: false,
            createdAt: now,
            updatedAt: now,
          })
        }

        // 5. Activate selected preset triggers
        if (state.selections.triggers.length > 0) {
          await db.triggers
            .where('guid')
            .anyOf(state.selections.triggers)
            .modify({ isActive: true, updatedAt: now })
        }

        // 6. Create custom triggers
        for (const custom of state.customItems.triggers) {
          await db.triggers.add({
            guid: generateGUID(),
            name: custom.name,
            category: custom.category,
            isActive: true,
            isDefault: false,
            createdAt: now,
            updatedAt: now,
          })
        }

        // 7. Activate selected preset foods
        if (state.selections.foods.length > 0) {
          await db.foods
            .where('guid')
            .anyOf(state.selections.foods)
            .modify({ isActive: true, updatedAt: now })
        }

        // 8. Create custom foods
        for (const custom of state.customItems.foods) {
          await db.foods.add({
            guid: generateGUID(),
            name: custom.name,
            category: custom.category || 'Custom',
            allergenTags: custom.allergenTags || [],
            isActive: true,
            isDefault: false,
            createdAt: now,
            updatedAt: now,
          })
        }

        // 9. Update user preferences
        await updateUserPreferences({
          name: state.preferences.name,
          theme: state.preferences.theme,
          notificationSettings: state.preferences.notificationSettings,
          onboardingCompleted: true,
          onboardingCompletedAt: now,
        })

        console.log('Onboarding completed successfully')
      }
    )
  } catch (error) {
    console.error('Error completing onboarding:', error)
    throw error
  }
}

/**
 * Check if user needs onboarding
 */
export async function needsOnboarding(): Promise<boolean> {
  try {
    const users = await db.users.toArray()
    if (users.length === 0) {
      return true
    }
    const user = users[0]
    return !user.onboardingCompleted
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return true
  }
}
