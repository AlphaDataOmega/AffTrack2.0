"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { HelpCircle, Plus, X } from "lucide-react"

interface ValidationProps {
  form: any
  setForm: (form: any) => void
}

export function Validation({ form, setForm }: ValidationProps) {
  const addRule = () => {
    setForm({
      ...form,
      validation: {
        ...form.validation,
        rules: [
          ...(form.validation.rules || []),
          { field: '', condition: '', value: '' }
        ]
      }
    })
  }

  const updateRule = (index: number, field: string, value: string) => {
    const newRules = [...form.validation.rules]
    newRules[index] = {
      ...newRules[index],
      [field]: value
    }
    setForm({
      ...form,
      validation: {
        ...form.validation,
        rules: newRules
      }
    })
  }

  const removeRule = (index: number) => {
    const newRules = form.validation.rules.filter((_: any, i: number) => i !== index)
    setForm({
      ...form,
      validation: {
        ...form.validation,
        rules: newRules
      }
    })
  }

  const updateErrorHandling = (field: string, value: any) => {
    setForm({
      ...form,
      validation: {
        ...form.validation,
        errorHandling: {
          ...form.validation.errorHandling,
          [field]: value
        }
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Data Validation</p>
            <p className="mt-1">
              Set up validation rules and error handling for incoming data
            </p>
          </div>
        </div>
      </Card>

      {/* Validation Rules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Validation Rules</h3>
            <p className="text-sm text-gray-500">
              Define rules to validate incoming data
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRule}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </Button>
        </div>

        <div className="space-y-4">
          {form.validation.rules?.map((rule: any, index: number) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-4">
                <Select
                  value={rule.field}
                  onValueChange={(value) => updateRule(index, 'field', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="zip">ZIP Code</SelectItem>
                    <SelectItem value="age">Age</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-4">
                <Select
                  value={rule.condition}
                  onValueChange={(value) => updateRule(index, 'condition', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">Required</SelectItem>
                    <SelectItem value="email">Valid Email</SelectItem>
                    <SelectItem value="phone">Valid Phone</SelectItem>
                    <SelectItem value="min">Minimum Value</SelectItem>
                    <SelectItem value="max">Maximum Value</SelectItem>
                    <SelectItem value="regex">Regex Pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3">
                <Input
                  placeholder="Value"
                  value={rule.value}
                  onChange={(e) => updateRule(index, 'value', e.target.value)}
                />
              </div>

              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRule(index)}
                  className="h-10 w-10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {form.validation.rules?.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-sm text-gray-500">
              No validation rules defined. Click "Add Rule" to start.
            </p>
          </div>
        )}
      </div>

      {/* Error Handling */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Error Handling</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              On Error Action
            </label>
            <Select
              value={form.validation.errorHandling.onError}
              onValueChange={(value) => updateErrorHandling('onError', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skip">Skip Record</SelectItem>
                <SelectItem value="retry">Retry</SelectItem>
                <SelectItem value="flag">Flag for Review</SelectItem>
                <SelectItem value="reject">Reject Feed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Retry Attempts
            </label>
            <Input
              type="number"
              value={form.validation.errorHandling.retryAttempts}
              onChange={(e) => updateErrorHandling('retryAttempts', e.target.value)}
              placeholder="Number of retry attempts"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notification Email
            </label>
            <Input
              type="email"
              value={form.validation.errorHandling.notificationEmail}
              onChange={(e) => updateErrorHandling('notificationEmail', e.target.value)}
              placeholder="Email for error notifications"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 