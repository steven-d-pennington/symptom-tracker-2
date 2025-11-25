interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  steps: Array<{ label: string; completed: boolean }>
}

export function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Progress bar */}
      <div className="relative">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
          <div
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
          />
        </div>
      </div>

      {/* Step labels */}
      <div className="flex justify-between mt-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex flex-col items-center ${
              index <= currentStep ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-1 ${
                index < currentStep
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : index === currentStep
                    ? 'bg-white dark:bg-gray-800 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              }`}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className="text-xs hidden sm:block">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Current step text */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Step {currentStep + 1} of {totalSteps}
        </p>
      </div>
    </div>
  )
}
