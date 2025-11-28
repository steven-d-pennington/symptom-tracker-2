'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { StepIndicator } from '@/components/onboarding/StepIndicator'
import { WelcomeStep } from './steps/welcome'
import { ProfileStep } from './steps/profile'
import { BodyMapStep } from './steps/bodymap'
import { SymptomsStep } from './steps/symptoms'
import { MedicationsStep } from './steps/medications'
import { TriggersStep } from './steps/triggers'
import { FoodsStep } from './steps/foods'
import { PreferencesStep } from './steps/preferences'
import { TutorialStep } from './steps/tutorial'
import { BodyImagePreference } from '@/lib/db'
import {
  OnboardingState,
  getInitialOnboardingState,
  ONBOARDING_STEPS,
  TOTAL_STEPS,
} from '@/lib/onboarding/onboardingState'
import { completeOnboarding } from '@/lib/onboarding/completeOnboarding'

export default function OnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [state, setState] = useState<OnboardingState>(getInitialOnboardingState())
  const [presetData, setPresetData] = useState({
    symptoms: [] as any[],
    medications: [] as any[],
    triggers: [] as any[],
    foods: [] as any[],
  })

  // Load preset data
  useEffect(() => {
    async function loadPresets() {
      try {
        const [symptoms, medications, triggers, foods] = await Promise.all([
          db.symptoms.toArray(),
          db.medications.toArray(),
          db.triggers.toArray(),
          db.foods.toArray(),
        ])

        setPresetData({ symptoms, medications, triggers, foods })
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading presets:', error)
        setIsLoading(false)
      }
    }

    loadPresets()
  }, [])

  const nextStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, TOTAL_STEPS - 1),
    }))
  }

  const skipStep = () => {
    nextStep()
  }

  const handleComplete = async () => {
    try {
      await completeOnboarding(state)
      router.push('/')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Error completing onboarding. Please try again.')
    }
  }

  // Step handlers
  const handleNameChange = (name: string) => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, name },
    }))
  }

  const handleSymptomToggle = (id: string) => {
    setState((prev) => ({
      ...prev,
      selections: {
        ...prev.selections,
        symptoms: prev.selections.symptoms.includes(id)
          ? prev.selections.symptoms.filter((s) => s !== id)
          : [...prev.selections.symptoms, id],
      },
    }))
  }

  const handleSymptomCustom = (name: string, category: string) => {
    setState((prev) => ({
      ...prev,
      customItems: {
        ...prev.customItems,
        symptoms: [...prev.customItems.symptoms, { name, category }],
      },
    }))
  }

  const handleMedicationToggle = (id: string) => {
    setState((prev) => ({
      ...prev,
      selections: {
        ...prev.selections,
        medications: prev.selections.medications.includes(id)
          ? prev.selections.medications.filter((m) => m !== id)
          : [...prev.selections.medications, id],
      },
    }))
  }

  const handleMedicationCustom = (name: string, dosage: string) => {
    setState((prev) => ({
      ...prev,
      customItems: {
        ...prev.customItems,
        medications: [...prev.customItems.medications, { name, dosage }],
      },
    }))
  }

  const handleTriggerToggle = (id: string) => {
    setState((prev) => ({
      ...prev,
      selections: {
        ...prev.selections,
        triggers: prev.selections.triggers.includes(id)
          ? prev.selections.triggers.filter((t) => t !== id)
          : [...prev.selections.triggers, id],
      },
    }))
  }

  const handleTriggerCustom = (
    name: string,
    category: 'environmental' | 'lifestyle' | 'dietary'
  ) => {
    setState((prev) => ({
      ...prev,
      customItems: {
        ...prev.customItems,
        triggers: [...prev.customItems.triggers, { name, category }],
      },
    }))
  }

  const handleFoodToggle = (id: string) => {
    setState((prev) => ({
      ...prev,
      selections: {
        ...prev.selections,
        foods: prev.selections.foods.includes(id)
          ? prev.selections.foods.filter((f) => f !== id)
          : [...prev.selections.foods, id],
      },
    }))
  }

  const handleFoodCustom = (name: string, category: string) => {
    setState((prev) => ({
      ...prev,
      customItems: {
        ...prev.customItems,
        foods: [...prev.customItems.foods, { name, category }],
      },
    }))
  }

  // Remove custom item handlers
  const handleRemoveSymptomCustom = (index: number) => {
    setState((prev) => ({
      ...prev,
      customItems: {
        ...prev.customItems,
        symptoms: prev.customItems.symptoms.filter((_, i) => i !== index),
      },
    }))
  }

  const handleRemoveMedicationCustom = (index: number) => {
    setState((prev) => ({
      ...prev,
      customItems: {
        ...prev.customItems,
        medications: prev.customItems.medications.filter((_, i) => i !== index),
      },
    }))
  }

  const handleRemoveTriggerCustom = (index: number) => {
    setState((prev) => ({
      ...prev,
      customItems: {
        ...prev.customItems,
        triggers: prev.customItems.triggers.filter((_, i) => i !== index),
      },
    }))
  }

  const handleRemoveFoodCustom = (index: number) => {
    setState((prev) => ({
      ...prev,
      customItems: {
        ...prev.customItems,
        foods: prev.customItems.foods.filter((_, i) => i !== index),
      },
    }))
  }

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, theme },
    }))
  }

  const handleNotificationsChange = (enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notificationSettings: { ...prev.preferences.notificationSettings, enabled },
      },
    }))
  }

  const handleBodyImagePreferenceChange = (pref: BodyImagePreference | null) => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, bodyImagePreference: pref },
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <p className="text-gray-600 dark:text-gray-400">Preparing onboarding</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Step Indicator */}
        {state.currentStep > 0 && (
          <StepIndicator
            currentStep={state.currentStep}
            totalSteps={TOTAL_STEPS}
            steps={ONBOARDING_STEPS.map((step, index) => ({
              label: step.label,
              completed: index < state.currentStep,
            }))}
          />
        )}

        {/* Current Step */}
        <div className="mt-8">
          {state.currentStep === 0 && <WelcomeStep onNext={nextStep} />}

          {state.currentStep === 1 && (
            <ProfileStep
              name={state.preferences.name || ''}
              onNameChange={handleNameChange}
              onNext={nextStep}
              onSkip={skipStep}
            />
          )}

          {state.currentStep === 2 && (
            <BodyMapStep
              bodyImagePreference={state.preferences.bodyImagePreference}
              onPreferenceChange={handleBodyImagePreferenceChange}
              onNext={nextStep}
              onSkip={skipStep}
            />
          )}

          {state.currentStep === 3 && (
            <SymptomsStep
              symptoms={presetData.symptoms}
              selectedIds={state.selections.symptoms}
              customItems={state.customItems.symptoms}
              onToggle={handleSymptomToggle}
              onAddCustom={handleSymptomCustom}
              onRemoveCustom={handleRemoveSymptomCustom}
              onNext={nextStep}
              onSkip={skipStep}
            />
          )}

          {state.currentStep === 4 && (
            <MedicationsStep
              medications={presetData.medications}
              selectedIds={state.selections.medications}
              customItems={state.customItems.medications}
              onToggle={handleMedicationToggle}
              onAddCustom={handleMedicationCustom}
              onRemoveCustom={handleRemoveMedicationCustom}
              onNext={nextStep}
              onSkip={skipStep}
            />
          )}

          {state.currentStep === 5 && (
            <TriggersStep
              triggers={presetData.triggers}
              selectedIds={state.selections.triggers}
              customItems={state.customItems.triggers}
              onToggle={handleTriggerToggle}
              onAddCustom={handleTriggerCustom}
              onRemoveCustom={handleRemoveTriggerCustom}
              onNext={nextStep}
              onSkip={skipStep}
            />
          )}

          {state.currentStep === 6 && (
            <FoodsStep
              foods={presetData.foods}
              selectedIds={state.selections.foods}
              customItems={state.customItems.foods}
              onToggle={handleFoodToggle}
              onAddCustom={handleFoodCustom}
              onRemoveCustom={handleRemoveFoodCustom}
              onNext={nextStep}
              onSkip={skipStep}
            />
          )}

          {state.currentStep === 7 && (
            <PreferencesStep
              theme={state.preferences.theme}
              onThemeChange={handleThemeChange}
              notificationsEnabled={state.preferences.notificationSettings.enabled}
              onNotificationsChange={handleNotificationsChange}
              onNext={nextStep}
            />
          )}

          {state.currentStep === 8 && (
            <TutorialStep onComplete={handleComplete} onSkip={handleComplete} />
          )}
        </div>
      </div>
    </div>
  )
}
