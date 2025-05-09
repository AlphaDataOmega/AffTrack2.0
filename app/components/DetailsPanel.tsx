"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, AlertCircle, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DetailItem {
  label: string
  value: string | React.ReactNode
  type?: 'text' | 'badge' | 'status'
}

export interface StepDetail {
  title: string
  description: string
  items: DetailItem[]
}

export interface DetailsPanelProps {
  currentStep: number
  totalSteps: number
  stepDetails: StepDetail[]
  isLoading?: boolean
  error?: string
  onStepClick?: (step: number) => void
}

export function DetailsPanel({
  currentStep,
  totalSteps,
  stepDetails,
  isLoading = false,
  error,
  onStepClick
}: DetailsPanelProps) {
  if (isLoading) {
    return (
      <Card className="w-[300px] p-6  max-h-min">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-[300px] p-6  max-h-min">
        <div className="flex items-center gap-3 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <h3 className="text-sm font-medium">Error</h3>
        </div>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </Card>
    )
  }

  const currentStepDetails = stepDetails[currentStep - 1]

  return (
    <Card className="w-[300px] p-6 max-h-min">
      <div className="space-y-6">
        {/* Step Navigation */}
        {onStepClick && (
          <div className="space-y-3">
            {stepDetails.map((step, index) => (
              <button
                key={index}
                onClick={() => onStepClick(index + 1)}
                className={cn(
                  "w-full flex items-center gap-3 text-left",
                  currentStep > index + 1 && "text-green-600",
                  currentStep === index + 1 && "text-blue-600",
                  currentStep < index + 1 && "text-gray-400"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-sm border",
                    currentStep > index + 1 && "bg-green-100 border-green-600",
                    currentStep === index + 1 && "bg-blue-100 border-blue-600",
                    currentStep < index + 1 && "border-gray-300"
                  )}
                >
                  {currentStep > index + 1 ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className="text-sm font-medium">{step.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Current Step Info */}
        {currentStepDetails && (
          <div>
            <h3 className="font-medium text-gray-900">{currentStepDetails.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{currentStepDetails.description}</p>
          </div>
        )}
      </div>
    </Card>
  )
} 