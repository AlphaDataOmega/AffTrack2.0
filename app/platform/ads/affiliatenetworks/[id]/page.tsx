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
import { NetworkFormData, networkSchema } from "../types"
import { BasicInfo } from "../components/steps/BasicInfo"
import { ContactDetails } from "../components/steps/ContactDetails"
import { PlatformDetails } from "../components/steps/PlatformDetails"
import { PaymentDetails } from "../components/steps/PaymentDetails"
import { logActivity, logError, ActivityContext, ActivityOperation } from "@/lib/activity"

const FORM_STEPS = [
  {
    title: "Network Details",
    description: "Basic information about the network"
  },
  {
    title: "Contact Information",
    description: "Contact details for network representatives"
  },
  {
    title: "Platform Access",
    description: "Platform login and API credentials"
  },
  {
    title: "Payment Terms",
    description: "Payment and payout settings"
  }
]

const STEP_TIPS = [
  [
    "Enter the network's display name",
    "Provide the legal company name",
    "Add a description of the network",
    "Set the network's status",
  ],
  [
    "Add primary contact details",
    "Include alternative contact methods",
    "Specify communication preferences",
  ],
  [
    "Enter the platform URL",
    "Add API credentials if available",
    "Provide login credentials",
  ],
  [
    "Set payment frequency",
    "Choose payment currency",
    "Specify minimum payout amount",
  ]
]

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

export default function NetworkPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const isNew = params.id === 'new'

  const form = useForm<NetworkFormData>({
    resolver: zodResolver(networkSchema),
    defaultValues: {
      status: "PENDING",
      contact: {},
      platform: {},
      paymentTerms: {
        paymentFrequency: "NET30",
        currency: "USD",
        minimumPayout: 0,
      },
    },
  })

  useEffect(() => {
    const fetchNetwork = async () => {
      if (isNew) {
        setIsFetching(false)
        return
      }

      try {
        setIsFetching(true)
        const response = await fetch(`/api/ads/affiliatenetworks?id=${params.id}`)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || 'Failed to fetch network')
        }
        
        const { data, error } = await response.json()
        if (error) throw new Error(error.message)
        
        console.log('Fetched network data:', data) // Debug log
        
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
        await logError('NETWORK', error, {
          component: 'NetworkPage',
          networkId: params.id
        })
        toast({
          title: "Error",
          description: "Failed to load network",
          variant: "destructive",
        })
        router.push('/platform/ads/affiliatenetworks')
      } finally {
        setIsFetching(false)
      }
    }

    fetchNetwork()
  }, [params.id, form])

  const onSubmit = async (data: NetworkFormData) => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/ads/affiliatenetworks${!isNew ? `?id=${params.id}` : ""}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save network")
      }

      await logActivity(`${ActivityContext.NETWORK} ${isNew ? ActivityOperation.CREATE : ActivityOperation.UPDATE}`, {
        networkId: params.id,
        changes: data,
        component: 'NetworkPage'
      })

      toast({
        title: "Success",
        description: `Network ${isNew ? "created" : "updated"} successfully`,
      })

      router.push("/platform/ads/affiliatenetworks")
      router.refresh()
    } catch (error) {
      await logError('NETWORK', error, {
        component: 'NetworkPage',
        networkId: params.id,
        changes: data
      })
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save network",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return <LoadingSkeleton />
  }

  const StepComponent = [
    BasicInfo,
    ContactDetails,
    PlatformDetails,
    PaymentDetails
  ][currentStep]

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "New Network" : "Edit Network"}
          </h1>
          <p className="text-sm text-gray-500">
            {isNew ? "Add a new affiliate network" : "Update your affiliate network settings"}
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
                {currentStep === FORM_STEPS.length - 1 ? (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isNew ? "Creating..." : "Updating..."}
                      </>
                    ) : (
                      isNew ? "Create Network" : "Update Network"
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
              totalSteps={FORM_STEPS.length}
              stepDetails={FORM_STEPS}
              onStepClick={setCurrentStep}
              tips={STEP_TIPS[currentStep]}
            />
          </div>
        </form>
      </Form>
    </div>
  )
} 