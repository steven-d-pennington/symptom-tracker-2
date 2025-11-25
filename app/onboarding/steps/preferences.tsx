interface PreferencesStepProps {
  theme: 'light' | 'dark' | 'system'
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void
  notificationsEnabled: boolean
  onNotificationsChange: (enabled: boolean) => void
  onNext: () => void
}

export function PreferencesStep({
  theme,
  onThemeChange,
  notificationsEnabled,
  onNotificationsChange,
  onNext,
}: PreferencesStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        Configure Preferences
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        Customize your experience (you can change these later)
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8 space-y-6">
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onThemeChange('light')}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-2">☀️</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Light</div>
            </button>

            <button
              onClick={() => onThemeChange('dark')}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-2">🌙</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark</div>
            </button>

            <button
              onClick={() => onThemeChange('system')}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === 'system'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">System</div>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Notifications
          </label>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Enable Reminders
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Get reminders for medications and daily reflections
              </div>
            </div>
            <button
              onClick={() => onNotificationsChange(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            You can configure specific reminder times in settings
          </p>
        </div>

        {/* Privacy Reminder */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex gap-2">
            <div className="text-green-500 flex-shrink-0">✓</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-semibold mb-1">Privacy intact:</p>
              <p>
                All preferences are stored locally on your device. No data is sent to external
                servers.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
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
