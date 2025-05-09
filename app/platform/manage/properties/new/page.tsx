"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { DetailsPanel } from "@/app/components/DetailsPanel"
import { BasicInfo } from "../components/steps/BasicInfo"
import { UserAccess } from "../components/steps/UserAccess"
import { 
  type PropertyForm, 
  type FormStep,
  defaultForm, 
  formStepConfigs, 
  validateProperty 
} from "../config"

// Define form steps with components
const formSteps: FormStep[] = [
  {
    ...formStepConfigs[0],
    component: BasicInfo
  },
  {
    ...formStepConfigs[1],
    component: UserAccess
  }
]

export default function NewPropertyPage() {
  const router = useRouter()
  const [form, setForm] = useState<PropertyForm>(defaultForm)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    const validation = validateProperty(form)
    
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/manage/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to create property")
      }

      toast({
        title: "Success",
        description: "Property created successfully"
      })

      router.push("/platform/manage/properties")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create property",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const CurrentStepComponent = formSteps[currentStep - 1].component

  const stepDetails = formSteps.map(step => ({
    title: step.title,
    description: "Configure property settings",
    items: []
  }))

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Property</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a new property to start tracking
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          <CurrentStepComponent form={form} setForm={setForm} />
          
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            {currentStep === formSteps.length ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isSubmitting ? "Creating..." : "Create Property"}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(Math.min(formSteps.length, currentStep + 1))}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Next
              </Button>
            )}
          </div>
        </div>

        <DetailsPanel
          title="New Property"
          description="Complete all steps to create your property"
          currentStep={currentStep}
          totalSteps={formSteps.length}
          stepDetails={stepDetails}
          isNew={true}
          tips={formSteps[currentStep - 1].tips}
          onStepClick={setCurrentStep}
        />
      </div>
    </div>
  )
} 