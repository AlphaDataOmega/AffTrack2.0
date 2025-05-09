"use client"

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
          description: "Configure site details",
          items: [
            { label: "Site Name", value: form.name || "Not set" },
            { label: "Type", value: form.type ? (
              <Badge variant="secondary" className="capitalize">
                {form.type}
              </Badge>
            ) : "Not set" }
          ]
        }
      case 2:
        return {
          title: "Theme Setup",
          description: "Configure site appearance",
          items: [
            { 
              label: "Theme", 
              value: form.theme?.name ? (
                <Badge variant="secondary" className="capitalize">
                  {form.theme.name}
                </Badge>
              ) : "Not set" 
            },
            { 
              label: "Layout", 
              value: form.theme?.layout ? (
                <Badge variant="outline" className="capitalize">
                  {form.theme.layout}
                </Badge>
              ) : "Not set" 
            }
          ]
        }
      case 3:
        return {
          title: "Typography",
          description: "Configure site fonts",
          items: [
            { 
              label: "Fonts", 
              value: form.fonts?.heading || form.fonts?.body ? (
                <div className="space-y-1">
                  {form.fonts.heading && (
                    <div className="text-sm">
                      Heading: <Badge variant="secondary">{form.fonts.heading}</Badge>
                    </div>
                  )}
                  {form.fonts.body && (
                    <div className="text-sm">
                      Body: <Badge variant="secondary">{form.fonts.body}</Badge>
                    </div>
                  )}
                </div>
              ) : "Not set"
            }
          ]
        }
      case 4:
        return {
          title: "Repository Setup",
          description: "Configure source control",
          items: [
            { 
              label: "Repository", 
              value: form.repository?.url ? (
                <div className="space-y-1">
                  <div className="font-medium text-sm">{form.repository.url}</div>
                  <Badge variant="outline">
                    Branch: {form.repository.branch}
                  </Badge>
                </div>
              ) : "Not set"
            }
          ]
        }
      case 5:
        return {
          title: "Deployment",
          description: "Configure hosting settings",
          items: [
            { 
              label: "Domain", 
              value: form.deploy?.domain ? (
                <div className="space-y-1">
                  <div className="font-medium text-sm">{form.deploy.domain}</div>
                  <Badge 
                    variant="secondary" 
                    className={form.deploy.ssl ? 
                      "bg-green-100 text-green-700" : 
                      "bg-gray-100 text-gray-700"
                    }
                  >
                    SSL {form.deploy.ssl ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              ) : "Not set"
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
              {currentStep === 1 ? 'Choose a descriptive name and appropriate site type for better organization.' :
               currentStep === 2 ? 'Select a theme that matches your brand identity and target audience.' :
               currentStep === 3 ? 'Choose fonts that are both attractive and readable.' :
               currentStep === 4 ? 'Ensure your repository is properly configured and accessible.' :
               'Configure your deployment settings carefully for optimal performance.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}