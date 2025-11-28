'use client'

import { useState, useCallback } from 'react'
import { HurleyStage } from '@/lib/hs/types'
import {
  determineHurleyStage,
  setRegionHurleyStatus,
  getHurleyStageLabel,
  HURLEY_STAGE_INFO,
  HurleyAssessment,
} from '@/lib/hs/hurley'
import { HurleyStageIndicator, HurleyStageCard } from './HurleyStageIndicator'

interface HurleyAssessmentWizardProps {
  regionId: string
  regionName: string
  isOpen: boolean
  onClose: () => void
  onComplete: (stage: HurleyStage) => void
  initialAssessment?: HurleyAssessment
}

type Step = 'sinus-tracts' | 'interconnected' | 'scarring' | 'result'

interface StepContent {
  question: string
  explanation: string
  yesLabel: string
  noLabel: string
}

const STEP_CONTENT: Record<Exclude<Step, 'result'>, StepContent> = {
  'sinus-tracts': {
    question: 'Do you have sinus tracts (tunnels under the skin) in this area?',
    explanation:
      'Sinus tracts are tunnels that form under the skin, often draining pus or fluid. They can connect multiple lesions.',
    yesLabel: 'Yes, I have tunnels that drain',
    noLabel: 'No, just bumps/abscesses',
  },
  interconnected: {
    question: 'Are multiple lesions connected by tunnels?',
    explanation:
      'Interconnected tunnels means the tunnels connect two or more lesions, creating a network under the skin.',
    yesLabel: 'Yes, tunnels connect multiple lesions',
    noLabel: 'No, tunnels are isolated (or no tunnels)',
  },
  scarring: {
    question: 'Is there significant scarring in this area?',
    explanation:
      'Scarring includes thickened skin, discoloration, or fibrous tissue from healed lesions. Minor marks don\'t count.',
    yesLabel: 'Yes, I have significant scarring',
    noLabel: 'No, minimal or no scarring',
  },
}

/**
 * Guided wizard for assessing Hurley stage of a body region
 */
export function HurleyAssessmentWizard({
  regionId,
  regionName,
  isOpen,
  onClose,
  onComplete,
  initialAssessment,
}: HurleyAssessmentWizardProps) {
  const [step, setStep] = useState<Step>('sinus-tracts')
  const [assessment, setAssessment] = useState<HurleyAssessment>(
    initialAssessment ?? {
      hasSinusTracts: false,
      lesionsInterconnected: false,
      hasScarring: false,
    }
  )
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showLearnMore, setShowLearnMore] = useState(false)

  const determinedStage = determineHurleyStage(assessment)

  const handleAnswer = useCallback(
    (answer: boolean) => {
      switch (step) {
        case 'sinus-tracts':
          setAssessment((prev) => ({ ...prev, hasSinusTracts: answer }))
          // If yes, ask about interconnected; if no, skip to scarring
          setStep(answer ? 'interconnected' : 'scarring')
          break
        case 'interconnected':
          setAssessment((prev) => ({ ...prev, lesionsInterconnected: answer }))
          // If interconnected, it's Stage III, go to result
          // Otherwise, ask about scarring
          setStep(answer ? 'result' : 'scarring')
          break
        case 'scarring':
          setAssessment((prev) => ({ ...prev, hasScarring: answer }))
          setStep('result')
          break
      }
    },
    [step]
  )

  const handleBack = useCallback(() => {
    switch (step) {
      case 'interconnected':
        setStep('sinus-tracts')
        break
      case 'scarring':
        setStep(assessment.hasSinusTracts ? 'interconnected' : 'sinus-tracts')
        break
      case 'result':
        setStep('scarring')
        break
    }
  }, [step, assessment.hasSinusTracts])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await setRegionHurleyStatus({
        regionId,
        assessment,
        notes: notes || undefined,
      })
      onComplete(determinedStage)
      onClose()
    } catch (error) {
      console.error('Error saving Hurley status:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setStep('sinus-tracts')
    setAssessment({
      hasSinusTracts: false,
      lesionsInterconnected: false,
      hasScarring: false,
    })
    setNotes('')
  }

  if (!isOpen) return null

  const stepContent = step !== 'result' ? STEP_CONTENT[step] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Hurley Assessment
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {regionName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {step !== 'result' ? (
            // Question steps
            <div className="space-y-6">
              {/* Progress indicator */}
              <div className="flex items-center gap-2">
                {['sinus-tracts', 'interconnected', 'scarring'].map((s, i) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full ${
                      ['sinus-tracts', 'interconnected', 'scarring'].indexOf(step) >= i
                        ? 'bg-purple-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* Question */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {stepContent!.question}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stepContent!.explanation}
                </p>
              </div>

              {/* Answer buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleAnswer(true)}
                  className="w-full p-4 text-left rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stepContent!.yesLabel}
                  </span>
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  className="w-full p-4 text-left rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stepContent!.noLabel}
                  </span>
                </button>
              </div>

              {/* Back button */}
              {step !== 'sinus-tracts' && (
                <button
                  onClick={handleBack}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  ← Go back
                </button>
              )}
            </div>
          ) : (
            // Result step
            <div className="space-y-6">
              {/* Result header */}
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Based on your answers
                </p>
                <div className="flex items-center justify-center gap-3">
                  <HurleyStageIndicator stage={determinedStage} size="lg" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getHurleyStageLabel(determinedStage)}
                  </span>
                </div>
              </div>

              {/* Summary of answers */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sinus tracts:</span>
                  <span className={assessment.hasSinusTracts ? 'text-red-600' : 'text-green-600'}>
                    {assessment.hasSinusTracts ? 'Yes' : 'No'}
                  </span>
                </div>
                {assessment.hasSinusTracts && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Interconnected:</span>
                    <span className={assessment.lesionsInterconnected ? 'text-red-600' : 'text-yellow-600'}>
                      {assessment.lesionsInterconnected ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Significant scarring:</span>
                  <span className={assessment.hasScarring ? 'text-yellow-600' : 'text-green-600'}>
                    {assessment.hasScarring ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {/* Learn more toggle */}
              <button
                onClick={() => setShowLearnMore(!showLearnMore)}
                className="w-full text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                {showLearnMore ? 'Hide details' : 'Learn more about this stage'}
              </button>

              {showLearnMore && (
                <HurleyStageCard stage={determinedStage} />
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Any additional observations..."
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Assessment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface HurleyQuickAssessProps {
  regionId: string
  regionName: string
  currentStage: HurleyStage | null
  onUpdate: () => void
}

/**
 * Compact inline component for viewing/updating Hurley stage
 */
export function HurleyQuickAssess({
  regionId,
  regionName,
  currentStage,
  onUpdate,
}: HurleyQuickAssessProps) {
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex items-center gap-3">
          <HurleyStageIndicator
            stage={currentStage}
            size="md"
            showLabel
            showTooltip
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentStage ? 'Tap to update' : 'Tap to assess'}
          </span>
        </div>
        <button
          onClick={() => setWizardOpen(true)}
          className="px-3 py-1.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
        >
          {currentStage ? 'Update' : 'Assess'}
        </button>
      </div>

      <HurleyAssessmentWizard
        regionId={regionId}
        regionName={regionName}
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={() => {
          onUpdate()
          setWizardOpen(false)
        }}
      />
    </>
  )
}
