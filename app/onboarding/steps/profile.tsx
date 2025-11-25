interface ProfileStepProps {
  name: string
  onNameChange: (name: string) => void
  onNext: () => void
  onSkip: () => void
}

export function ProfileStep({ name, onNameChange, onNext, onSkip }: ProfileStepProps) {
  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        Create Your Profile
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        Optional - No email or password required
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <div className="mb-6">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            What should we call you? (Optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={50}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This is just for personalizing your experience. You can leave it blank or change it
            later.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-2">
            <div className="text-blue-500 flex-shrink-0">ℹ️</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-semibold mb-1">Privacy reminder:</p>
              <p>
                We&apos;ll never ask for your email, phone number, or create an account. Your data stays
                completely private on your device.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-between">
        <button
          onClick={onSkip}
          className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-semibold transition-colors"
        >
          Skip
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
