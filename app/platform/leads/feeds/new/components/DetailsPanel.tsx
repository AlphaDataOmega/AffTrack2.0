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
          description: "Enter feed details",
          items: [
            { label: "Feed Name", value: form.basic.name || "Not set" },
            { label: "Source", value: form.basic.source || "Not set" },
            { 
              label: "Type", 
              value: form.basic.type ? (
                <Badge variant="secondary" className="capitalize">
                  {form.basic.type}
                </Badge>
              ) : "Not set" 
            },
            { 
              label: "Vertical", 
              value: form.basic.vertical ? (
                <Badge variant="secondary" className="capitalize">
                  {form.basic.vertical}
                </Badge>
              ) : "Not set" 
            },
            { label: "Description", value: form.basic.description || "Not set" },
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
          description: "Configure data source",
          items: [
            { label: "Endpoint", value: form.integration.endpoint || "Not set" },
            { label: "API Key", value: form.integration.apiKey ? "••••••••" : "Not set" },
            { 
              label: "Method", 
              value: form.integration.method ? (
                <Badge variant="secondary">
                  {form.integration.method}
                </Badge>
              ) : "Not set" 
            },
            { 
              label: "Format", 
              value: form.integration.format ? (
                <Badge variant="secondary" className="uppercase">
                  {form.integration.format}
                </Badge>
              ) : "Not set" 
            },
            {
              label: "Headers",
              value: form.integration.headers?.length > 0 ? (
                <div className="space-y-1">
                  {form.integration.headers.map((header: any, index: number) => (
                    <div key={index} className="text-sm">
                      {header.key}: {header.value}
                    </div>
                  ))}
                </div>
              ) : "No headers"
            }
          ]
        }
      case 3:
        return {
          title: "Field Mapping",
          description: "Map data fields",
          items: [
            {
              label: "Mapped Fields",
              value: form.mapping.fields?.length > 0 ? (
                <div className="space-y-1">
                  {form.mapping.fields.map((field: any, index: number) => (
                    <div key={index} className="text-sm">
                      {field.source} → {field.target}
                      {field.required && (
                        <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
                          Required
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : "No fields mapped"
            }
          ]
        }
      case 4:
        return {
          title: "Data Validation",
          description: "Set validation rules",
          items: [
            {
              label: "Validation Rules",
              value: form.validation.rules?.length > 0 ? (
                <div className="space-y-1">
                  {form.validation.rules.map((rule: any, index: number) => (
                    <div key={index} className="text-sm">
                      {rule.field} must be {rule.condition} {rule.value}
                    </div>
                  ))}
                </div>
              ) : "No rules defined"
            },
            { 
              label: "Error Action", 
              value: form.validation.errorHandling?.onError ? (
                <Badge variant="secondary" className="capitalize">
                  {form.validation.errorHandling.onError}
                </Badge>
              ) : "Not set" 
            },
            { label: "Retry Attempts", value: form.validation.errorHandling?.retryAttempts || "Not set" },
            { label: "Notification Email", value: form.validation.errorHandling?.notificationEmail || "Not set" }
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
              {currentStep === 1 ? 'Enter accurate feed information to ensure proper organization and tracking.' :
               currentStep === 2 ? 'Configure integration settings carefully to ensure reliable data fetching.' :
               currentStep === 3 ? 'Map all required fields and ensure data types match.' :
               'Set validation rules to maintain data quality and handle errors appropriately.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
} 