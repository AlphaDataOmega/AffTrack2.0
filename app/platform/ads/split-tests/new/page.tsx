"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BasicInfo } from './components/steps/BasicInfo'
import { VariantSetup } from './components/steps/VariantSetup'
import { DetailsPanel } from './components/DetailsPanel'

interface SplitTestForm {
  name: string
  description: string
  placement: string
  status: "draft" | "active"
  variants: {
    id: string
    name: string
    offerId: string
    weight: number
    description?: string
  }[]
  targeting?: {
    devices: string[]
    countries: string[]
    languages: string[]
  }
  startDate?: string
  endDate?: string
  minimumConfidence: number
  minimumSampleSize: number
  autoOptimize: boolean
  autoEndEnabled: boolean
  autoEndConditions?: {
    confidence: number
    conversions: number
    days: number
  }
}

const initialForm: SplitTestForm = {
  name: '',
  description: '',
  placement: '',
  status: 'draft',
  variants: [],
  minimumConfidence: 95,
  minimumSampleSize: 100,
  autoOptimize: false,
  autoEndEnabled: false
}

export default function NewSplitTest() {
  const router = useRouter()
  const [form, setForm] = useState<SplitTestForm>(initialForm)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentStep === totalSteps && getCompletionStatus().completed) {
      console.log('Form submitted:', form)
      router.push('/ads/split-tests')
    } else {
      setCurrentStep(prev => Math.min(totalSteps, prev + 1))
    }
  }

  const getCompletionStatus = () => {
    switch (currentStep) {
      case 1:
        return {
          completed: !!form.name && !!form.description && !!form.placement,
          total: 3,
          current: [!!form.name, !!form.description, !!form.placement].filter(Boolean).length
        }
      case 2:
        const hasValidVariants = form.variants.length >= 2 && 
          form.variants.every(v => v.offerId && v.weight > 0) &&
          form.variants.reduce((sum, v) => sum + v.weight, 0) === 100
        return {
          completed: hasValidVariants,
          total: 1,
          current: hasValidVariants ? 1 : 0
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
        return <VariantSetup form={form} setForm={setForm} />
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
            onClick={() => router.push('/ads/split-tests')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Split Test</h1>
            <p className="mt-1 text-sm text-gray-500">Set up a new A/B test for your offers</p>
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
                  {index === 0 ? 'Basic Info' : 'Variants Setup'}
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
                  Create Split Test
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