"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BasicInfo } from './components/steps/BasicInfo'
import { TargetingSetup } from './components/steps/TargetingSetup'
import { RoutingSetup } from './components/steps/RoutingSetup'
import { DetailsPanel } from './components/DetailsPanel'

interface PlacementForm {
  name: string
  type: "banner" | "native" | "popup" | "sticky"
  size: string
  pageUrl: string
  position: string
  targeting: {
    devices: string[]
    countries: string[]
    languages: string[]
    timeSchedule?: {
      days: string[]
      startTime?: string
      endTime?: string
    }
  }
  routing: {
    type: "direct" | "split"
    directOffer?: string
    splitTest?: {
      name: string
      variants: {
        offerId: string
        weight: number
      }[]
    }
  }
  customCss?: string
  customJs?: string
}

const initialForm: PlacementForm = {
  name: '',
  type: 'banner',
  size: '',
  pageUrl: '',
  position: '',
  targeting: {
    devices: [],
    countries: [],
    languages: []
  },
  routing: {
    type: 'direct'
  }
}

export default function NewPlacement() {
  const router = useRouter()
  const [form, setForm] = useState<PlacementForm>(initialForm)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentStep === totalSteps && getCompletionStatus().completed) {
      console.log('Form submitted:', form)
      router.push('/ads/placements')
    } else {
      setCurrentStep(prev => Math.min(totalSteps, prev + 1))
    }
  }

  const getCompletionStatus = () => {
    switch (currentStep) {
      case 1:
        return {
          completed: !!form.name && !!form.type && !!form.size && !!form.pageUrl,
          total: 4,
          current: [!!form.name, !!form.type, !!form.size, !!form.pageUrl].filter(Boolean).length
        }
      case 2:
        return {
          completed: form.targeting.devices.length > 0,
          total: 1,
          current: form.targeting.devices.length > 0 ? 1 : 0
        }
      case 3:
        const hasDirectOffer = form.routing.type === 'direct' && !!form.routing.directOffer
        const hasSplitTest = form.routing.type === 'split' && 
          !!form.routing.splitTest?.name && 
          (form.routing.splitTest?.variants?.length ?? 0) > 0
        return {
          completed: hasDirectOffer || hasSplitTest,
          total: 1,
          current: hasDirectOffer || hasSplitTest ? 1 : 0
        }
      default:
        return { completed: false, total: 0, current: 0 }
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfo form={form} setForm={setForm} />
      case 2:
        return <TargetingSetup form={form} setForm={setForm} />
      case 3:
        return <RoutingSetup form={form} setForm={setForm} />
      default:
        return null
    }
  }

  const status = getCompletionStatus()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/ads/placements')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Placement</h1>
            <p className="mt-1 text-sm text-gray-500">Create a new ad placement</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[...Array(totalSteps)].map((_, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  currentStep > index + 1
                    ? "bg-green-500 text-white"
                    : currentStep === index + 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                )}>
                  {currentStep > index + 1 ? '✓' : index + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600">
                  {index === 0 ? 'Basic Info' : 
                   index === 1 ? 'Targeting' : 
                   'Traffic Routing'}
                </span>
              </div>
              {index < totalSteps - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4",
                  currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-8">
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            {renderStep()}
            
            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit"
                  className="bg-green-500 hover:bg-green-600"
                  disabled={!status.completed}
                >
                  Create Placement
                </Button>
              )}
            </div>
          </form>
        </div>

        <DetailsPanel 
          currentStep={currentStep}
          form={form}
          status={status}
        />
      </div>
    </div>
  )
} 