interface TutorialStepProps {
  onComplete: () => void
  onSkip: () => void
}

export function TutorialStep({ onComplete, onSkip }: TutorialStepProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        Quick Tutorial
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        Learn the key features in under a minute
      </p>

      <div className="space-y-6 mb-8">
        {/* Feature 1: Symptom Logging */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-2xl">
              🩺
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Track Symptoms
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Log symptoms with severity ratings (1-10). Add notes, photos, and precise body
                locations using the interactive body map.
              </p>
            </div>
          </div>
        </div>

        {/* Feature 2: Flare Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-2xl">
              🔴
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Monitor Flares
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create flares on the body map, track their progression over time, and record
                interventions that help (ice, heat, medications).
              </p>
            </div>
          </div>
        </div>

        {/* Feature 3: Food & Trigger Tracking */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-2xl">
              🍽️
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Log Food & Triggers
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Record what you eat and environmental triggers. The app analyzes correlations with
                your symptoms automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Feature 4: Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-2xl">
              📊
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Discover Insights
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                View correlation reports, heat maps of problem areas, and trends over time. Export
                reports as PDF for your doctor.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
        <div className="flex gap-2">
          <div className="text-blue-500 flex-shrink-0">💡</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="font-semibold mb-1">Pro tip:</p>
            <p>
              Consistency is key! Log symptoms daily for the best correlation analysis results.
              Even logging &quot;no symptoms&quot; helps establish patterns.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-between">
        <button
          onClick={onSkip}
          className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-semibold transition-colors"
        >
          Skip Tutorial
        </button>
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
        >
          Get Started! 🎉
        </button>
      </div>
    </div>
  )
}
