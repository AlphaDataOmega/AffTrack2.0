"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BasicInfo } from './components/steps/BasicInfo'
import { Integration } from './components/steps/Integration'
import { Mapping } from './components/steps/Mapping'
import { Validation } from './components/steps/Validation'
import { DetailsPanel } from './components/DetailsPanel'

interface FeedForm {
  basic: {
    name: string
    source: string
    type: string
    vertical: string
    description: string
    tags: string[]
  }
  integration: {
    endpoint: string
    apiKey: string
    method: string
    headers: {
      key: string
      value: string
    }[]
    format: string
  }
  mapping: {
    fields: {
      source: string
      target: string
      required: boolean
      transform: string
    }[]
  }
  validation: {
    rules: {
      field: string
      condition: string
      value: string
    }[]
    errorHandling: {
      onError: string
      retryAttempts: number
      notificationEmail: string
    }
  }
}

const initialForm: FeedForm = {
  basic: {
    name: '',
    source: '',
    type: '',
    vertical: '',
    description: '',
    tags: []
  },
  integration: {
    endpoint: '',
    apiKey: '',
    method: 'GET',
    headers: [],
    format: 'json'
  },
  mapping: {
    fields: []
  },
  validation: {
    rules: [],
    errorHandling: {
      onError: 'skip',
      retryAttempts: 3,
      notificationEmail: ''
    }
  }
}

export default function NewFeed() {
  const router = useRouter()
  const [form, setForm] = useState<FeedForm>(initialForm)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentStep === totalSteps && getCompletionStatus().completed) {
      console.log('Form submitted:', form)
      router.push('/leads/feeds')
    } else {
      setCurrentStep(prev => Math.min(totalSteps, prev + 1))
    }
  }

  const getCompletionStatus = () => {
    switch (currentStep) {
      case 1:
        return {
          completed: !!form.basic.name && !!form.basic.source && !!form.basic.type,
          total: 3,
          current: [!!form.basic.name, !!form.basic.source, !!form.basic.type].filter(Boolean).length
        }
      case 2:
        return {
          completed: !!form.integration.endpoint,
          total: 1,
          current: !!form.integration.endpoint ? 1 : 0
        }
      case 3:
        return {
          completed: form.mapping.fields.length > 0,
          total: 1,
          current: form.mapping.fields.length > 0 ? 1 : 0
        }
      case 4:
        return {
          completed: true,
          total: 1,
          current: 1
        }
      default:
        return { completed: false, total: 0, current: 0 }
    }
  }

  const steps = [
    { title: "Basic Information", description: "Enter feed details" },
    { title: "Integration Setup", description: "Configure data source" },
    { title: "Field Mapping", description: "Map data fields" },
    { title: "Validation Rules", description: "Set data validation" }
  ]

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfo form={form} setForm={setForm} />
      case 2:
        return <Integration form={form} setForm={setForm} />
      case 3:
        return <Mapping form={form} setForm={setForm} />
      case 4:
        return <Validation form={form} setForm={setForm} />
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
            onClick={() => router.push('/leads/feeds')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Feed</h1>
            <p className="mt-1 text-sm text-gray-500">Create a new data feed source</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
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
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
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
                  Create Feed
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