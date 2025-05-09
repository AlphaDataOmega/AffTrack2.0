"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { BasicInfo } from "../components/steps/BasicInfo"
import { TrackingInfo } from "../components/steps/TrackingInfo"
import { TargetingInfo } from "../components/steps/TargetingInfo"
import { DestinationsInfo } from "../components/steps/DestinationsInfo"
import { BudgetInfo } from "../components/steps/BudgetInfo"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { ErrorBoundary } from 'react-error-boundary'
import { z } from "zod"
import { 
  campaignFormSchema, 
  type CampaignForm, 
  CampaignStatus,
  DestinationType,
  DistributionType,
  CampaignType 
} from "../types"
import { DetailsPanel, type StepDetail } from "@/app/components/DetailsPanel"

const DEFAULT_FORM_VALUES: CampaignForm = {
  basic: {
    propertyIds: [],
    name: '',
    description: '',
    type: '',
    sourceType: '',
    affiliateId: undefined,
    adNetworkId: undefined,
    status: CampaignStatus.DRAFT
  },
  tracking: {
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmContent: '',
    utmTerm: ''
  },
  targeting: {
    countries: [],
    devices: [],
    browsers: [],
    languages: []
  },
  destinations: {
    destinationType: DestinationType.SINGLE,
    distribution: DistributionType.EVEN,
    destinations: [],
    rules: []
  },
  budget: {
    campaignType: CampaignType.CPC,
    bidAmount: undefined,
    targetCpa: undefined,
    daily: null,
    total: null,
    dailyUnlimited: true,
    totalUnlimited: true
  }
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="p-6 text-center">
      <h3 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  )
}

const steps = [
  { 
    key: 'basic', 
    title: 'Basic Information', 
    component: BasicInfo,
    tips: [
      'Choose a descriptive name that clearly identifies your campaign',
      'Select the appropriate campaign type based on your goals',
      'Add relevant properties to target your campaign effectively',
      'Set the initial status to draft while configuring'
    ].slice()
  },
  { 
    key: 'tracking', 
    title: 'Tracking Setup', 
    component: TrackingInfo,
    tips: [
      'Use consistent UTM naming conventions across campaigns',
      'Make UTM parameters descriptive but concise',
      'Avoid special characters in UTM parameters',
      'Test your tracking links before launching'
    ].slice()
  },
  { 
    key: 'targeting', 
    title: 'Targeting Options', 
    component: TargetingInfo,
    tips: [
      'Focus on specific geographic regions for better performance',
      'Consider device compatibility when selecting targets',
      'Choose languages based on your target audience',
      'Target browsers your audience commonly uses'
    ].slice()
  },
  {
    key: 'destinations',
    title: 'Destinations',
    component: DestinationsInfo,
    tips: [
      'Choose between single destination or split testing',
      'Use descriptive names for your destinations',
      'Ensure destination URLs are valid and accessible',
      'Configure distribution rules based on your testing goals'
    ].slice()
  },
  { 
    key: 'budget', 
    title: 'Budget & Bidding', 
    component: BudgetInfo,
    tips: [
      'Start with a conservative daily budget to test performance',
      'Set realistic CPA targets based on your profit margins',
      'Monitor and adjust bids based on performance data',
      'Consider using unlimited budgets for high-performing campaigns'
    ].slice()
  }
] as const

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

function CampaignFormContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = useParams()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [form, setForm] = useState<CampaignForm>(DEFAULT_FORM_VALUES)
  const isNew = id === 'new'

  const getStepDetails = (): StepDetail[] => [
    {
      title: 'Basic Information',
      description: 'Enter the basic details of your campaign'
    },
    {
      title: 'Tracking Setup',
      description: 'Configure campaign tracking parameters'
    },
    {
      title: 'Targeting Options',
      description: 'Define your campaign targeting criteria'
    },
    {
      title: 'Destinations',
      description: 'Configure campaign destinations and distribution'
    },
    {
      title: 'Budget & Bidding',
      description: 'Set your campaign budget and bidding options'
    }
  ]

  useEffect(() => {
    const fetchCampaign = async () => {
      if (id === 'new') {
        setIsLoading(false)
        return
      }

      try {
        console.log('[FETCH_CAMPAIGN] Fetching campaign:', id);
        const response = await fetch(`/api/traffic/campaigns?id=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('[FETCH_CAMPAIGN] Error response:', errorData);
          throw new Error(errorData.error?.message || 'Failed to fetch campaign')
        }
        
        const data = await response.json()
        console.log('[FETCH_CAMPAIGN] Raw response:', data);
        
        if (!data?.data) {
          console.error('[FETCH_CAMPAIGN] No data in response');
          throw new Error('No campaign data received')
        }

        const campaign = data.data
        console.log('[FETCH_CAMPAIGN] Campaign data:', campaign);
        
        const newForm = {
          basic: {
            propertyIds: campaign.properties?.map((p: { id: string }) => p.id) || [],
            name: campaign.name || '',
            description: campaign.description || '',
            type: campaign.type || '',
            sourceType: campaign.sourceType || '',
            affiliateId: campaign.affiliateId || null,
            adNetworkId: campaign.adNetworkId || null,
            status: campaign.status || CampaignStatus.DRAFT
          },
          tracking: {
            utmSource: campaign.utmSource || '',
            utmMedium: campaign.utmMedium || '',
            utmCampaign: campaign.utmCampaign || '',
            utmContent: campaign.utmContent || '',
            utmTerm: campaign.utmTerm || ''
          },
          targeting: {
            countries: campaign.countries || [],
            devices: campaign.devices || [],
            browsers: campaign.browsers || [],
            languages: campaign.languages || []
          },
          destinations: {
            destinationType: campaign.destinationType || DestinationType.SINGLE,
            distribution: campaign.distribution || DistributionType.EVEN,
            destinations: campaign.destinations?.map((dest: any) => ({
              id: dest.id,
              name: dest.name || '',
              url: dest.url || '',
              weight: dest.weight || 0,
              isDefault: dest.isDefault || false,
              rules: dest.rules || [],
              clicks: dest.clicks || 0,
              conversions: dest.conversions || 0,
              revenue: dest.revenue || 0,
              ctr: dest.ctr,
              cr: dest.cr,
              epc: dest.epc,
              rpc: dest.rpc,
              testStartedAt: dest.testStartedAt ? new Date(dest.testStartedAt) : undefined,
              testEndedAt: dest.testEndedAt ? new Date(dest.testEndedAt) : undefined
            })) || [],
            rules: campaign.rules || []
          },
          budget: {
            campaignType: campaign.campaignType || CampaignType.CPC,
            bidAmount: campaign.bidAmount,
            targetCpa: campaign.targetCpa,
            daily: campaign.daily,
            total: campaign.total,
            dailyUnlimited: campaign.dailyUnlimited ?? true,
            totalUnlimited: campaign.totalUnlimited ?? true
          }
        }

        console.log('[FETCH_CAMPAIGN] Setting form with:', newForm);
        setForm(newForm)
      } catch (error) {
        console.error('[CAMPAIGN_FETCH_ERROR] Detailed error:', error)
        setError(error instanceof Error ? error.message : 'Failed to load campaign')
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load campaign",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchCampaign()
    }
  }, [id, session?.user?.id])

  const validateStep = (step: number) => {
    try {
      switch (step) {
        case 1:
          console.log('Validating basic info:', form.basic);
          campaignFormSchema.shape.basic.parse(form.basic)
          break
        case 2:
          campaignFormSchema.shape.tracking.parse(form.tracking)
          break
        case 3:
          campaignFormSchema.shape.targeting.parse(form.targeting)
          break
        case 4:
          campaignFormSchema.shape.destinations.parse(form.destinations)
          break
        case 5:
          campaignFormSchema.shape.budget.parse(form.budget)
          break
      }
      return true
    } catch (error) {
      console.error(`[VALIDATION_ERROR] Step ${step}:`, error);
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => {
          const field = err.path.join('.');
          return `${field}: ${err.message}`;
        }).join(', ');
        toast({
          title: "Validation Error",
          description: errors,
          variant: "destructive"
        })
      }
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
      const method = isNew ? 'POST' : 'PUT'
      console.log('[SUBMIT_CAMPAIGN] Sending request:', {
        method,
        id: id === 'new' ? undefined : id,
        form
      });
      
      const response = await fetch('/api/traffic/campaigns', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: id === 'new' ? undefined : id,
          propertyIds: form.basic.propertyIds,
          name: form.basic.name,
          description: form.basic.description,
          type: form.basic.type,
          sourceType: form.basic.sourceType,
          affiliateId: form.basic.affiliateId,
          adNetworkId: form.basic.adNetworkId,
          status: form.basic.status,
          utmSource: form.tracking.utmSource,
          utmMedium: form.tracking.utmMedium,
          utmCampaign: form.tracking.utmCampaign,
          utmContent: form.tracking.utmContent,
          utmTerm: form.tracking.utmTerm,
          countries: form.targeting.countries,
          devices: form.targeting.devices,
          browsers: form.targeting.browsers,
          languages: form.targeting.languages,
          destinationType: form.destinations.destinationType,
          distribution: form.destinations.distribution,
          destinations: form.destinations.destinations,
          campaignType: form.budget.campaignType,
          bidAmount: form.budget.bidAmount,
          targetCpa: form.budget.targetCpa,
          revshareRate: form.budget.revshareRate,
          daily: form.budget.daily,
          total: form.budget.total,
          dailyUnlimited: form.budget.dailyUnlimited,
          totalUnlimited: form.budget.totalUnlimited
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('[SUBMIT_CAMPAIGN] Error response:', error);
        throw new Error(error.error?.message || 'Failed to save campaign')
      }

      const result = await response.json();
      console.log('[SUBMIT_CAMPAIGN] Success:', result);

      toast({
        title: "Success",
        description: isNew ? "Campaign created successfully" : "Campaign updated successfully"
      })

      router.push('/platform/traffic/campaigns')
      router.refresh()

    } catch (error) {
      console.error('[CAMPAIGN_SUBMIT_ERROR]', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save campaign",
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
          onClick={() => router.push('/platform/traffic/campaigns')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Create Campaign' : 'Edit Campaign'}
          </h1>
          <p className="text-sm text-gray-500">
            {isNew ? 'Create a new campaign' : 'Edit campaign details'}
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
                {isSubmitting ? 'Saving...' : (isNew ? 'Create Campaign' : 'Save Changes')}
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

export default function CampaignFormPage() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        fetch('/api/activity/error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            path: window.location.pathname
          })
        })
      }}
      onReset={() => {
        window.location.reload()
      }}
    >
      <CampaignFormContent />
    </ErrorBoundary>
  )
} 