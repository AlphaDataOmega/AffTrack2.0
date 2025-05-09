"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertCircle, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DetailsPanelProps {
  currentStep: number
  form: any
  status: {
    completed: boolean
    total: number
    current: number
  }
}

export function DetailsPanel({ currentStep, form, status }: DetailsPanelProps) {
  const getStepDetails = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Basic Information",
          description: "Enter buyer details",
          items: [
            { label: "Name", value: form.basic.name || "Not set" },
            { label: "Company", value: form.basic.company || "Not set" },
            { label: "Email", value: form.basic.email || "Not set" },
            { label: "Phone", value: form.basic.phone || "Not set" },
            { 
              label: "Vertical", 
              value: form.basic.vertical ? (
                <Badge variant="secondary" className="capitalize">
                  {form.basic.vertical}
                </Badge>
              ) : "Not set" 
            },
            {
              label: "Tags",
              value: form.basic.tags?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {form.basic.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-gray-100">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : "No tags"
            }
          ]
        }
      case 2:
        return {
          title: "Integration Setup",
          description: "Configure data delivery",
          items: [
            { label: "Postback URL", value: form.integration.postbackUrl || "Not set" },
            { label: "API Key", value: form.integration.apiKey || "Not set" },
            { label: "Webhook URL", value: form.integration.webhookUrl || "Not set" },
            { label: "Pingback Delay", value: form.integration.pingbackDelay ? `${form.integration.pingbackDelay} seconds` : "Not set" },
            { label: "Retry Attempts", value: form.integration.retryAttempts || "Not set" }
          ]
        }
      case 3:
        return {
          title: "Pricing & Terms",
          description: "Set pricing model and terms",
          items: [
            { 
              label: "Pricing Model", 
              value: form.pricing.model ? (
                <Badge variant="secondary" className="capitalize">
                  {form.pricing.model.replace('_', ' ')}
                </Badge>
              ) : "Not set" 
            },
            { 
              label: "Lead Price", 
              value: form.pricing.leadPrice ? 
                `${form.pricing.currency} ${form.pricing.leadPrice}` : 
                "Not set" 
            },
            { label: "Min Volume", value: form.pricing.minVolume || "Not set" },
            { label: "Max Volume", value: form.pricing.maxVolume || "Not set" },
            { 
              label: "Billing Frequency", 
              value: form.pricing.billingFrequency ? (
                <Badge variant="outline" className="capitalize">
                  {form.pricing.billingFrequency}
                </Badge>
              ) : "Not set" 
            },
            { 
              label: "Payment Terms", 
              value: form.pricing.paymentTerms ? (
                <Badge variant="outline" className="uppercase">
                  {form.pricing.paymentTerms}
                </Badge>
              ) : "Not set" 
            }
          ]
        }
      case 4:
        return {
          title: "Lead Filters",
          description: "Define acceptance criteria",
          items: [
            {
              label: "Countries",
              value: form.filters.countries.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {form.filters.countries.map((country: string) => (
                    <Badge key={country} variant="secondary">
                      {country}
                    </Badge>
                  ))}
                </div>
              ) : "No countries selected"
            },
            { 
              label: "Age Range", 
              value: form.filters.age.min || form.filters.age.max ? 
                `${form.filters.age.min || '0'} - ${form.filters.age.max || '∞'}` : 
                "Not set" 
            },
            {
              label: "Custom Rules",
              value: form.filters.customRules.length > 0 ? (
                <div className="space-y-1">
                  {form.filters.customRules.map((rule: any, index: number) => (
                    <div key={index} className="text-sm">
                      {rule.field} {rule.operator} {rule.value}
                    </div>
                  ))}
                </div>
              ) : "No custom rules"
            }
          ]
        }
      default:
        return {
          title: "",
          description: "",
          items: []
        }
    }
  }

  const details = getStepDetails()

  return (
    <div className="w-80 flex-shrink-0">
      <Card className="p-6">
        <div className="space-y-6">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step {currentStep} Progress</span>
              <span className="text-sm text-gray-500">
                {status.current}/{status.total}
              </span>
            </div>
            <Progress value={(status.current / status.total) * 100} />
          </div>

          {/* Step Info */}
          <div>
            <h3 className="font-medium text-gray-900">{details.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{details.description}</p>
          </div>

          {/* Current Values */}
          <div className="space-y-4">
            {details.items.map((item, index) => (
              <div key={index}>
                <div className="text-sm text-gray-500">{item.label}</div>
                <div className="mt-1">
                  {typeof item.value === 'string' ? (
                    <span className="font-medium text-gray-900">{item.value}</span>
                  ) : (
                    item.value
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="pt-4 border-t border-gray-200">
            {status.completed ? (
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Step completed</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Required fields missing</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tips Card */}
      <Card className="p-4 mt-6 bg-blue-50 border-blue-100">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Setup Tips</p>
            <p className="mt-1">
              {currentStep === 1 ? 'Enter accurate buyer information to ensure proper communication and tracking.' :
               currentStep === 2 ? 'Configure integration settings carefully to ensure reliable lead delivery.' :
               currentStep === 3 ? 'Set competitive pricing and clear payment terms for better relationships.' :
               'Define specific lead criteria to ensure quality and prevent rejections.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
} 