"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertCircle } from "lucide-react"
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
          description: "Configure test details",
          items: [
            { label: "Name", value: form.name || "Not set" },
            { label: "Description", value: form.description || "Not set" },
            { label: "Placement", value: form.placement || "Not set" },
            { 
              label: "Auto-Optimize", 
              value: form.autoOptimize ? 
                <Badge variant="secondary" className="bg-green-100 text-green-700">Enabled</Badge> : 
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">Disabled</Badge>
            },
            { 
              label: "Auto-End Test", 
              value: form.autoEndEnabled ? 
                <div className="space-y-1">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Enabled</Badge>
                  <div className="text-sm text-gray-600">
                    {form.minimumConfidence}% confidence
                    <br />
                    Min. {form.minimumSampleSize} samples
                  </div>
                </div> : 
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">Disabled</Badge>
            }
          ]
        }
      case 2:
        return {
          title: "Test Variants",
          description: "Configure traffic distribution",
          items: [
            { 
              label: "Variants", 
              value: form.variants.length ? 
                <div className="space-y-2">
                  {form.variants.map((variant: any, index: number) => (
                    <div key={variant.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{variant.name}</span>
                      <Badge variant="outline" className="bg-gray-50">
                        {variant.weight}%
                      </Badge>
                    </div>
                  ))}
                </div> : 
                "No variants added" 
            },
            { 
              label: "Traffic Distribution", 
              value: form.variants.length ? (
                <div className="space-y-1">
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                    {form.variants.map((variant: any) => (
                      <div 
                        key={variant.id}
                        className="h-full bg-blue-500"
                        style={{ width: `${variant.weight}%` }}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    {form.variants.reduce((sum: number, v: any) => sum + (parseInt(v.weight) || 0), 0)}% allocated
                  </div>
                </div>
              ) : 
              "Not configured"
            },
            { 
              label: "Selected Offers",
              value: form.variants.length ? 
                <div className="space-y-1">
                  {form.variants.map((variant: any) => (
                    <div key={variant.id} className="text-sm">
                      {variant.name}: {variant.offerId ? 
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {AVAILABLE_OFFERS.find(o => o.id === variant.offerId)?.name || variant.offerId}
                        </Badge> : 
                        <span className="text-gray-500">No offer selected</span>
                      }
                    </div>
                  ))}
                </div> : 
                "No variants added"
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
    </div>
  )
}

// Using the same mock data as VariantSetup
const AVAILABLE_OFFERS = [
  { id: "1", name: "Weight Loss Program", network: "MaxBounty" },
  { id: "2", name: "Crypto Trading Course", network: "ClickBank" },
  { id: "3", name: "VPN Subscription", network: "CJ Affiliate" }
] 