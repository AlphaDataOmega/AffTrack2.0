"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DetailsPanel } from "@/app/components/DetailsPanel"
import { logActivity, logError, ActivityContext, ActivityOperation } from "@/lib/activity"
import { BaseFormData, baseFeatureSchema } from "../types"

interface StepConfig {
  title: string
  description: string
  tips?: string[]
  Component: React.ComponentType
}

interface FeaturePageProps {
  params: { id: string }
  steps: StepConfig[]
  apiEndpoint: string
  featureType: keyof typeof ActivityContext
  labels: {
    new: string
    edit: string
    create: string
    update: string
  }
}

function LoadingSkeleton() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        <div>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded mt-2 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-[1fr,300px] gap-6">
        <div className="space-y-6">
          <div className="h-[200px] bg-gray-200 rounded animate-pulse" />
          <div className="h-[50px] bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-[400px] bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  )
}

export function FeaturePage({
  params,
  steps,
  apiEndpoint,
  featureType,
  labels
}: FeaturePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const isNew = params.id === 'new'

  const form = useForm<BaseFormData>({
    resolver: zodResolver(baseFeatureSchema),
    defaultValues: {
      status: "PENDING",
    },
  })

  useEffect(() => {
    const fetchFeature = async () => {
      if (isNew) {
        setIsFetching(false)
        return
      }

      try {
        setIsFetching(true)
        const response = await fetch(`${apiEndpoint}?id=${params.id}`)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || 'Failed to fetch feature')
        }
        
        const { data, error } = await response.json()
        if (error) throw new Error(error.message)
        
        form.reset({
          ...data,
          properties: data.properties?.map((p: any) => ({
            id: p.id,
            name: p.name || '',
            domain: p.domain || ''
          })) || []
        }, {
          keepDirty: true
        })
      } catch (error) {
        await logError(featureType, error, {
          component: 'FeaturePage',
          featureId: params.id
        })
        toast({
          title: "Error",
          description: "Failed to load feature",
          variant: "destructive",
        })
        router.back()
      } finally {
        setIsFetching(false)
      }
    }

    fetchFeature()
  }, [params.id, form, apiEndpoint, featureType, router])

  const onSubmit = async (data: BaseFormData) => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${apiEndpoint}${!isNew ? `?id=${params.id}` : ""}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save feature")
      }

      await logActivity(`${ActivityContext[featureType]} ${isNew ? ActivityOperation.CREATE : ActivityOperation.UPDATE}`, {
        featureId: params.id,
        changes: data,
        component: 'FeaturePage'
      })

      toast({
        title: "Success",
        description: `Feature ${isNew ? "created" : "updated"} successfully`,
      })

      router.back()
      router.refresh()
    } catch (error) {
      await logError(featureType, error, {
        component: 'FeaturePage',
        featureId: params.id,
        changes: data
      })
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save feature",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return <LoadingSkeleton />
  }

  const StepComponent = steps[currentStep].Component

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? labels.new : labels.edit}
          </h1>
          <p className="text-sm text-gray-500">
            {isNew ? `Add a new ${labels.create.toLowerCase()}` : `Update your ${labels.update.toLowerCase()}`}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-[1fr,300px] gap-6">
            <div className="space-y-6">
              <StepComponent />

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                {currentStep === steps.length - 1 ? (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isNew ? `Creating ${labels.create}...` : `Updating ${labels.update}...`}
                      </>
                    ) : (
                      isNew ? `Create ${labels.create}` : `Update ${labels.update}`
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>

            <DetailsPanel
              currentStep={currentStep + 1}
              totalSteps={steps.length}
              stepDetails={steps}
              onStepClick={setCurrentStep}
              tips={steps[currentStep].tips}
            />
          </div>
        </form>
      </Form>
    </div>
  )
} 