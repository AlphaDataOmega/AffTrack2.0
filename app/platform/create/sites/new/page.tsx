"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BasicInfo } from './components/steps/BasicInfo'
import { Theme } from './components/steps/Theme'
import { Fonts } from './components/steps/Fonts'
import { Repository } from './components/steps/Repository'
import { Deploy } from './components/steps/Deploy'
import { DetailsPanel } from './components/DetailsPanel'

interface SiteForm {
  name: string
  type: string
  description: string
  theme: {
    name: string
    color: string
    layout: string
  }
  fonts: {
    heading: string
    body: string
  }
  repository: {
    type: string
    url: string
    branch: string
  }
  deploy: {
    platform: string
    domain: string
    ssl: boolean
  }
}

const initialForm: SiteForm = {
  name: '',
  type: '',
  description: '',
  theme: {
    name: '',
    color: '#3b82f6',
    layout: 'default'
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter'
  },
  repository: {
    type: 'github',
    url: '',
    branch: 'main'
  },
  deploy: {
    platform: 'netlify',
    domain: '',
    ssl: true
  }
}

export default function NewSite() {
  const router = useRouter()
  const [form, setForm] = useState<SiteForm>(initialForm)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', form)
    router.push('/create/sites/1/build')
  }

  const getCompletionStatus = () => {
    switch (currentStep) {
      case 1:
        return {
          completed: !!form.name && !!form.type && !!form.description,
          total: 3,
          current: [!!form.name, !!form.type, !!form.description].filter(Boolean).length
        }
      case 2:
        return {
          completed: !!form.theme.name && !!form.theme.color && !!form.theme.layout,
          total: 3,
          current: [!!form.theme.name, !!form.theme.color, !!form.theme.layout].filter(Boolean).length
        }
      case 3:
        return {
          completed: !!form.fonts.heading && !!form.fonts.body,
          total: 2,
          current: [!!form.fonts.heading, !!form.fonts.body].filter(Boolean).length
        }
      case 4:
        return {
          completed: !!form.repository.type && !!form.repository.url && !!form.repository.branch,
          total: 3,
          current: [!!form.repository.type, !!form.repository.url, !!form.repository.branch].filter(Boolean).length
        }
      case 5:
        return {
          completed: !!form.deploy.platform && !!form.deploy.domain,
          total: 2,
          current: [!!form.deploy.platform, !!form.deploy.domain].filter(Boolean).length
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
        return <Theme form={form} setForm={setForm} />
      case 3:
        return <Fonts form={form} setForm={setForm} />
      case 4:
        return <Repository form={form} setForm={setForm} />
      case 5:
        return <Deploy form={form} setForm={setForm} />
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
            onClick={() => router.push('/create/sites')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Site</h1>
            <p className="mt-1 text-sm text-gray-500">Set up your site configuration and theme</p>
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
                   index === 1 ? 'Theme' :
                   index === 2 ? 'Fonts' :
                   index === 3 ? 'Repository' :
                   'Deploy'}
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

            <div className="mt-8 flex justify-between">
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
                <Button type="submit" className="bg-green-500 hover:bg-green-600">
                  Create Site
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Details Panel */}
        <DetailsPanel 
          currentStep={currentStep}
          form={form}
          status={status}
        />
      </div>
    </div>
  )
}