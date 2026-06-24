"use client"

import { Check } from "lucide-react"
import { WIZARD_STEPS, type WizardStepId } from "./types"

type Props = {
  currentStep: WizardStepId
  completedSteps: Set<WizardStepId>
}

export function WizardProgress({ currentStep, completedSteps }: Props) {
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep)

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between gap-2">
        {WIZARD_STEPS.map((step, i) => {
          const isDone = completedSteps.has(step.id) || i < currentIndex
          const isCurrent = step.id === currentStep

          return (
            <div key={step.id} className="flex flex-1 items-center gap-2 min-w-0">
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                    isDone
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                      : isCurrent
                        ? "bg-gray-900 text-white ring-4 ring-gray-900/10"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isDone && !isCurrent ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={`hidden text-xs font-medium sm:block truncate w-full text-center ${
                    isCurrent ? "text-gray-900" : isDone ? "text-emerald-600" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < WIZARD_STEPS.length - 1 && (
                <div
                  className={`mb-6 hidden h-0.5 flex-1 rounded-full sm:block transition-colors duration-500 ${
                    i < currentIndex ? "bg-emerald-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 sm:hidden">
        <div
          className="h-full rounded-full bg-gray-900 transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / WIZARD_STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
