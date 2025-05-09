"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { HelpCircle, Plus, X } from "lucide-react"

interface IntegrationProps {
  form: any
  setForm: (form: any) => void
}

export function Integration({ form, setForm }: IntegrationProps) {
  const updateIntegration = (field: string, value: string) => {
    setForm({
      ...form,
      integration: {
        ...form.integration,
        [field]: value
      }
    })
  }

  const addHeader = () => {
    setForm({
      ...form,
      integration: {
        ...form.integration,
        headers: [
          ...(form.integration.headers || []),
          { key: '', value: '' }
        ]
      }
    })
  }

  const updateHeader = (index: number, field: string, value: string) => {
    const newHeaders = [...form.integration.headers]
    newHeaders[index] = {
      ...newHeaders[index],
      [field]: value
    }
    setForm({
      ...form,
      integration: {
        ...form.integration,
        headers: newHeaders
      }
    })
  }

  const removeHeader = (index: number) => {
    const newHeaders = form.integration.headers.filter((_: any, i: number) => i !== index)
    setForm({
      ...form,
      integration: {
        ...form.integration,
        headers: newHeaders
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
            <p className="font-medium">Integration Setup</p>
            <p className="mt-1">
              Configure how to connect to your data feed source
            </p>
          </div>
        </div>
      </Card>

      {/* Integration Settings */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endpoint URL
            <span className="text-red-500">*</span>
          </label>
          <Input
            type="url"
            value={form.integration.endpoint}
            onChange={(e) => updateIntegration('endpoint', e.target.value)}
            placeholder="https://api.example.com/leads"
          />
          <p className="mt-1 text-sm text-gray-500">
            The URL where we'll fetch the data from
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request Method
            </label>
            <Select
              value={form.integration.method}
              onValueChange={(value) => updateIntegration('method', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Response Format
            </label>
            <Select
              value={form.integration.format}
              onValueChange={(value) => updateIntegration('format', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <Input
            value={form.integration.apiKey}
            onChange={(e) => updateIntegration('apiKey', e.target.value)}
            placeholder="Enter API key"
            type="password"
          />
          <p className="mt-1 text-sm text-gray-500">
            Authentication key for accessing the API
          </p>
        </div>

        {/* Headers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Request Headers</h3>
              <p className="text-sm text-gray-500">
                Add any custom headers needed for the request
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addHeader}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Header
            </Button>
          </div>

          <div className="space-y-3">
            {form.integration.headers?.map((header: any, index: number) => (
              <div key={index} className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Header name"
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Header value"
                    value={header.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHeader(index)}
                  className="h-10 w-10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 