"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { BasicInfo } from "../components/steps/BasicInfo"
import { ContactInfo } from "../components/steps/ContactInfo"
import { PayoutInfo } from "../components/steps/PayoutInfo"
import { DetailsPanel } from "@/app/components/DetailsPanel"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { ErrorBoundary } from 'react-error-boundary'
import { z } from "zod"
import { affiliateFormSchema, type AffiliateForm, AffiliateStatus } from "../types"

const DEFAULT_FORM_VALUES: AffiliateForm = {
  basic: {
    propertyIds: [],
    name: '',
    description: '',
    company: '',
    status: AffiliateStatus.PENDING,
    tags: []
  },
  contact: {
    contactName: '',
    email: '',
    phone: '',
    skype: '',
    website: ''
  },
  payout: {
    method: undefined,
    currency: undefined,
    terms: ''
  }
}

const steps = [
  { 
    key: 'basic',
    title: 'Basic Information',
    component: BasicInfo,
    tips: [
      'Select properties to associate with this affiliate',
      'Choose a descriptive name for easy identification',
      'Add relevant tags for better organization',
      'Set the initial status of the affiliate'
    ].slice()
  },
  { 
    key: 'contact',
    title: 'Contact Details',
    component: ContactInfo,
    tips: [
      'Enter accurate contact information',
      'Verify email address format',
      'Include alternative contact methods',
      'Add website URL if available'
    ].slice()
  },
  {
    key: 'payout',
    title: 'Payout Information',
    component: PayoutInfo,
    tips: [
      'Select preferred payment method',
      'Choose payment currency',
      'Specify any special payment terms',
      'Review payout details carefully'
    ].slice()
  }
]

function LoadingSkeleton() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <div className="grid grid-cols-[1fr,300px] gap-6">
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </div>
        <Skeleton className="h-[400px] w-[300px]" />
      </div>
    </div>
  )
}

function AffiliateFormContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = useParams()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [form, setForm] = useState<AffiliateForm>(DEFAULT_FORM_VALUES)
  const isNew = id === 'new'

  const getStepDetails = () => [
    {
      title: 'Basic Information',
      description: 'Enter the basic details of your affiliate'
    },
    {
      title: 'Contact Details',
      description: 'Add contact information for communication'
    },
    {
      title: 'Payout Information',
      description: 'Configure payment details and terms'
    }
  ]

  useEffect(() => {
    const fetchAffiliate = async () => {
      if (id === 'new') {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/traffic/affiliates?id=${id}`)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || 'Failed to fetch affiliate')
        }
        
        const { data, error } = await response.json()
        if (error) throw new Error(error.message)
        
        setForm({
          basic: {
            propertyIds: data.properties?.map((p: { id: string }) => p.id) || [],
            name: data.name,
            description: data.description || '',
            company: data.company || '',
            status: data.status,
            tags: data.tags || []
          },
          contact: {
            contactName: data.contactName,
            email: data.email,
            phone: data.phone,
            skype: data.skype,
            website: data.website || ''
          },
          payout: {
            method: data.payout?.method,
            currency: data.payout?.currency,
            terms: data.payout?.terms || ''
          }
        })
      } catch (error) {
        console.error('[AFFILIATE_FETCH_ERROR]', error)
        setError(error instanceof Error ? error.message : 'Failed to load affiliate')
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load affiliate",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchAffiliate()
    }
  }, [id, session?.user?.id])

  const validateStep = (step: number) => {
    try {
      const stepKey = steps[step - 1].key as keyof typeof affiliateFormSchema.shape
      const validation = affiliateFormSchema.shape[stepKey].safeParse(
        form[stepKey]
      )
      
      if (!validation.success) {
        const firstError = validation.error.errors[0]
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive"
        })
        return false
      }
      return true
    } catch (error) {
      console.error('[VALIDATION_ERROR]', error)
      return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      const formData = {
        id: id === 'new' ? undefined : id,
        ...form.basic,
        ...form.contact,
        ...form.payout
      }

      const method = isNew ? 'POST' : 'PUT'
      const response = await fetch('/api/traffic/affiliates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        if (error.error?.details) {
          const validationErrors = error.error.details
            .map((err: any) => err.message)
            .join(', ')
          throw new Error(`Validation failed: ${validationErrors}`)
        }
        throw new Error(error.error?.message || 'Failed to save affiliate')
      }

      toast({
        title: "Success",
        description: isNew ? "Affiliate created successfully" : "Affiliate updated successfully"
      })

      router.push('/platform/traffic/affiliates')
      router.refresh()

    } catch (error) {
      console.error('[AFFILIATE_SUBMIT_ERROR]', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save affiliate",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <LoadingSkeleton />

  const CurrentStepComponent = steps[currentStep - 1].component

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/platform/traffic/affiliates')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Create Affiliate' : 'Edit Affiliate'}
          </h1>
          <p className="text-sm text-gray-500">
            {isNew ? 'Create a new affiliate' : 'Edit affiliate details'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr,300px] gap-6">
        <div className="space-y-6">
          <div>
            <CurrentStepComponent form={form} setForm={setForm} />
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            {currentStep === steps.length ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (isNew ? 'Create Affiliate' : 'Save Changes')}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </div>

        <DetailsPanel
          currentStep={currentStep}
          totalSteps={steps.length}
          stepDetails={getStepDetails()}
          onStepClick={setCurrentStep}
          tips={steps[currentStep - 1].tips}
        />
      </div>
    </div>
  )
}

export default function AffiliateFormPage() {
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </div>
      )}
      onError={(error) => {
        console.error('[AFFILIATE_ERROR]', error)
      }}
    >
      <AffiliateFormContent />
    </ErrorBoundary>
  )
}
