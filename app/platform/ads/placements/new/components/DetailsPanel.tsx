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
          description: "Configure placement details",
          items: [
            { 
              label: "Ad Type", 
              value: form.type ? 
                <Badge variant="secondary" className="capitalize">
                  {form.type}
                </Badge> : 
                "Not set" 
            },
            { 
              label: "Size", 
              value: form.size ? 
                <Badge variant="outline" className="font-mono">
                  {form.size}
                </Badge> : 
                "Not set" 
            },
            { label: "Name", value: form.name || "Not set" },
            { label: "Page URL", value: form.pageUrl || "Not set" },
            { label: "Position", value: form.position || "Not set" },
            { 
              label: "Custom CSS", 
              value: form.customCss ? 
                <div className="font-mono text-xs bg-gray-50 p-1 rounded">
                  {form.customCss}
                </div> : 
                "None" 
            }
          ]
        }
      case 2:
        return {
          title: "Targeting Settings",
          description: "Define who sees this placement",
          items: [
            { 
              label: "Devices", 
              value: form.targeting.devices.length ? 
                <div className="flex flex-wrap gap-1">
                  {form.targeting.devices.map((device: string) => (
                    <Badge key={device} variant="secondary" className="capitalize">
                      {device}
                    </Badge>
                  ))}
                </div> : 
                "Not set" 
            },
            { 
              label: "Countries", 
              value: form.targeting.countries.length ? 
                form.targeting.countries.join(", ") : 
                "Not set" 
            },
            { 
              label: "Languages", 
              value: form.targeting.languages.length ? 
                form.targeting.languages.join(", ") : 
                "Not set" 
            },
            { 
              label: "Schedule", 
              value: form.targeting.timeSchedule ? 
                <div className="space-y-1 text-sm">
                  <div>Days: {form.targeting.timeSchedule.days.join(", ")}</div>
                  {form.targeting.timeSchedule.startTime && (
                    <div>
                      Time: {form.targeting.timeSchedule.startTime} - {form.targeting.timeSchedule.endTime}
                    </div>
                  )}
                </div> : 
                "Always active" 
            }
          ]
        }
      case 3:
        return {
          title: "Traffic Routing",
          description: "Configure traffic destination",
          items: [
            { 
              label: "Routing Type", 
              value: form.routing.type ? 
                <Badge variant="secondary" className="capitalize">
                  {form.routing.type === 'direct' ? 'Direct to Offer' : 'Split Test'}
                </Badge> : 
                "Not set" 
            },
            ...(form.routing.type === 'direct' ? [
              { 
                label: "Selected Offer", 
                value: form.routing.directOffer ? 
                  <div className="text-sm font-medium">
                    {AVAILABLE_OFFERS.find(o => o.id === form.routing.directOffer)?.name || form.routing.directOffer}
                  </div> : 
                  "Not selected" 
              }
            ] : [
              { 
                label: "Split Test", 
                value: form.routing.splitTest?.name ? 
                  <div className="text-sm font-medium">
                    {AVAILABLE_SPLIT_TESTS.find(t => t.id === form.routing.splitTest.name)?.name || form.routing.splitTest.name}
                  </div> : 
                  "Not selected" 
              }
            ])
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
                <div className="mt-1 font-medium text-gray-900">
                  {typeof item.value === 'string' ? item.value : item.value}
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

// Using the same mock data as RoutingSetup
const AVAILABLE_OFFERS = [
  { id: "1", name: "Weight Loss Program", network: "MaxBounty" },
  { id: "2", name: "Crypto Trading Course", network: "ClickBank" },
  { id: "3", name: "VPN Subscription", network: "CJ Affiliate" }
]

const AVAILABLE_SPLIT_TESTS = [
  { id: "1", name: "Homepage Offer Test", status: "active", variants: 3 },
  { id: "2", name: "Landing Page Test", status: "active", variants: 2 },
  { id: "3", name: "Product Page Test", status: "paused", variants: 4 }
] 