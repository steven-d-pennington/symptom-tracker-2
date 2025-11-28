/**
 * Onboarding state management types and interfaces
 */

import { BodyImagePreference } from '@/lib/db'

export interface OnboardingState {
  currentStep: number
  completed: boolean
  selections: {
    symptoms: string[] // GUIDs of selected symptoms
    medications: string[] // GUIDs of selected medications
    triggers: string[] // GUIDs of selected triggers
    foods: string[] // GUIDs of selected foods
  }
  customItems: {
    symptoms: Array<{ name: string; category: string; description?: string }>
    medications: Array<{ name: string; dosage: string; frequency?: string }>
    triggers: Array<{ name: string; category: 'environmental' | 'lifestyle' | 'dietary' }>
    foods: Array<{ name: string; category?: string; allergenTags?: string[] }>
  }
  preferences: {
    name?: string
    theme: 'light' | 'dark' | 'system'
    bodyImagePreference?: BodyImagePreference | null
    notificationSettings: {
      enabled: boolean
      medicationReminders?: boolean
      dailyReflection?: boolean
      reminderTimes?: string[]
    }
  }
}

export const ONBOARDING_STEPS = [
  { id: 0, label: 'Welcome', path: 'welcome' },
  { id: 1, label: 'Profile', path: 'profile' },
  { id: 2, label: 'Body Map', path: 'bodymap' },
  { id: 3, label: 'Symptoms', path: 'symptoms' },
  { id: 4, label: 'Medications', path: 'medications' },
  { id: 5, label: 'Triggers', path: 'triggers' },
  { id: 6, label: 'Foods', path: 'foods' },
  { id: 7, label: 'Preferences', path: 'preferences' },
  { id: 8, label: 'Tutorial', path: 'tutorial' },
] as const

export const TOTAL_STEPS = ONBOARDING_STEPS.length

export function getInitialOnboardingState(): OnboardingState {
  return {
    currentStep: 0,
    completed: false,
    selections: {
      symptoms: [],
      medications: [],
      triggers: [],
      foods: [],
    },
    customItems: {
      symptoms: [],
      medications: [],
      triggers: [],
      foods: [],
    },
    preferences: {
      theme: 'system',
      notificationSettings: {
        enabled: false,
      },
    },
  }
}
