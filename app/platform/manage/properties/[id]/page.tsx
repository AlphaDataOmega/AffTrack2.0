"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { DetailsPanel } from "@/app/components/DetailsPanel"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { BasicInfo } from "../components/steps/BasicInfo"
import { UserAccess } from "../components/steps/UserAccess"
import { 
  type Property,
  type PropertyForm,
  type FormStep,
  type ApiResponse,
  formStepConfigs,
  validateProperty
} from "../config"

function LoadingText() {
  return (
    <div className="px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </Card>
    </div>
  )
}

// Define form steps with components
const formSteps: FormStep[] = [
  {
    key: 'basic' as const,
    title: formStepConfigs[0].title,
    tips: [...formStepConfigs[0].tips],
    component: BasicInfo
  },
  {
    key: 'users' as const,
    title: formStepConfigs[1].title,
    tips: [...formStepConfigs[1].tips],
    component: UserAccess
  }
]

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [property, setProperty] = useState<Property | null>(null)
  const [form, setForm] = useState<PropertyForm | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    fetchProperty()
  }, [params.id])

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/manage/properties/${params.id}`)
      const data: ApiResponse<Property> = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch property")
      }

      setProperty(data.data || null)
      
      if (data.data) {
        // Transform API data to form state
        setForm({
          name: data.data.name,
          domain: data.data.domain,
          description: data.data.description || '',
          status: data.data.status,
          tags: data.data.tags,
          industry: data.data.industry || '',
          users: data.data.users.map(user => user.id)
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load property",
        variant: "destructive"
      })
      router.push("/platform/manage/properties")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form) return

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

      const response = await fetch(`/api/manage/properties/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to update property")
      }

      toast({
        title: "Success",
        description: "Property updated successfully"
      })

      router.push("/platform/manage/properties")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update property",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/manage/properties/${params.id}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to delete property")
      }

      toast({
        title: "Success",
        description: "Property deleted successfully"
      })

      router.push("/platform/manage/properties")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete property",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
      setShowDeleteDialog(false)
    }
  }

  if (isLoading || !form) {
    return <LoadingText />
  }

  const CurrentStepComponent = formSteps[currentStep - 1].component

  const stepDetails = formSteps.map(step => ({
    title: step.title,
    description: "Configure property settings",
    items: []
  }))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
            <p className="text-sm text-gray-500">
              Update property settings and access
            </p>
          </div>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Property</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                property and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

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
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(Math.min(formSteps.length, currentStep + 1))}
              >
                Next
              </Button>
            )}
          </div>
        </div>

        <DetailsPanel
          title="Edit Property"
          description="Update property settings"
          currentStep={currentStep}
          totalSteps={formSteps.length}
          stepDetails={stepDetails}
          tips={formSteps[currentStep - 1].tips}
          onStepClick={setCurrentStep}
        />
      </div>
    </div>
  )
} 