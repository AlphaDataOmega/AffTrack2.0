"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BasicInfo } from './components/steps/BasicInfo'
import { Integration } from './components/steps/Integrations'
import { Pricing } from './components/steps/Pricings'
import { Filters } from './components/steps/Filter'
import { DetailsPanel } from './components/DetailsPanel'

interface BuyerForm {
  basic: {
    name: string
    company: string
    email: string
    phone: string
    vertical: string
    tags: string[]
  }
  integration: {
    postbackUrl: string
    apiKey: string
    webhookUrl: string
    pingbackDelay: string
    retryAttempts: string
  }
  pricing: {
    model: string
    leadPrice: string
    minVolume: string
    maxVolume: string
    currency: string
    billingFrequency: string
    paymentTerms: string
  }
  filters: {
    countries: string[]
    states: string[]
    age: {
      min: string
      max: string
    }
    customRules: {
      field: string
      operator: string
      value: string
    }[]
  }
}

const initialForm: BuyerForm = {
  basic: {
    name: '',
    company: '',
    email: '',
    phone: '',
    vertical: '',
    tags: []
  },
  integration: {
    postbackUrl: '',
    apiKey: '',
    webhookUrl: '',
    pingbackDelay: '60',
    retryAttempts: '3'
  },
  pricing: {
    model: '',
    leadPrice: '',
    minVolume: '',
    maxVolume: '',
    currency: 'USD',
    billingFrequency: 'monthly',
    paymentTerms: 'net30'
  },
  filters: {
    countries: [],
    states: [],
    age: { min: '', max: '' },
    customRules: []
  }
}

export default function NewBuyer() {
  const router = useRouter()
  const [form, setForm] = useState<BuyerForm>(initialForm)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentStep === totalSteps && getCompletionStatus().completed) {
      console.log('Form submitted:', form)
      router.push('/leads/buyers')
    } else {
      setCurrentStep(prev => Math.min(totalSteps, prev + 1))
    }
  }

  const getCompletionStatus = () => {
    switch (currentStep) {
      case 1:
        return {
          completed: !!form.basic.name && !!form.basic.company && !!form.basic.email,
          total: 3,
          current: [!!form.basic.name, !!form.basic.company, !!form.basic.email].filter(Boolean).length
        }
      case 2:
        return {
          completed: !!form.integration.postbackUrl && !!form.integration.apiKey,
          total: 2,
          current: [!!form.integration.postbackUrl, !!form.integration.apiKey].filter(Boolean).length
        }
      case 3:
        return {
          completed: !!form.pricing.model && !!form.pricing.leadPrice,
          total: 2,
          current: [!!form.pricing.model, !!form.pricing.leadPrice].filter(Boolean).length
        }
      case 4:
        return {
          completed: form.filters.countries.length > 0,
          total: 1,
          current: form.filters.countries.length > 0 ? 1 : 0
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
        return <Integration form={form} setForm={setForm} />
      case 3:
        return <Pricing form={form} setForm={setForm} />
      case 4:
        return <Filters form={form} setForm={setForm} />
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
            onClick={() => router.push('/leads/buyers')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Buyer</h1>
            <p className="mt-1 text-sm text-gray-500">Create a new data buyer account</p>
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
                   index === 1 ? 'Integration' : 
                   index === 2 ? 'Pricing' :
                   'Filters'}
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
                  Create Buyer
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