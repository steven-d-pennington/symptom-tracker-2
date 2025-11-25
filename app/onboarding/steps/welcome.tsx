interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Pocket Symptom Tracker
      </h1>

      <div className="mb-8">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-6">
          Privacy First
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Your health data stays on your device. <strong>Always.</strong>
        </p>

        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3">
            <div className="text-green-500 text-2xl flex-shrink-0">✓</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">No cloud storage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All your data is stored locally on your device using IndexedDB
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-green-500 text-2xl flex-shrink-0">✓</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">No tracking</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We don&apos;t collect analytics or track your usage
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-green-500 text-2xl flex-shrink-0">✓</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">No data sharing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your information never leaves your device unless you export it
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-green-500 text-2xl flex-shrink-0">✓</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">You own your data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Export to JSON, CSV, or PDF anytime you want
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={onNext}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Get Started
        </button>
        <a
          href="https://github.com/yourusername/symptom-tracker"
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold rounded-lg transition-colors"
        >
          Learn More
        </a>
      </div>
    </div>
  )
}
