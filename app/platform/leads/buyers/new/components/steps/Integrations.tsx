"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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

  return (
    <div className="space-y-8">
      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Integration Setup</p>
            <p className="mt-1">
              Configure how leads will be delivered to this buyer
            </p>
          </div>
        </div>
      </Card>

      {/* Integration Settings */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postback URL
            <span className="text-red-500">*</span>
          </label>
          <Input
            type="url"
            value={form.integration.postbackUrl}
            onChange={(e) => updateIntegration('postbackUrl', e.target.value)}
            placeholder="https://your-domain.com/leads"
          />
          <p className="mt-1 text-sm text-gray-500">
            URL where lead data will be sent
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
            <span className="text-red-500">*</span>
          </label>
          <Input
            value={form.integration.apiKey}
            onChange={(e) => updateIntegration('apiKey', e.target.value)}
            placeholder="Enter API key"
          />
          <p className="mt-1 text-sm text-gray-500">
            Authentication key for API requests
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Webhook URL (Optional)
          </label>
          <Input
            type="url"
            value={form.integration.webhookUrl}
            onChange={(e) => updateIntegration('webhookUrl', e.target.value)}
            placeholder="https://your-domain.com/webhooks"
          />
          <p className="mt-1 text-sm text-gray-500">
            URL for receiving real-time notifications
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pingback Delay (seconds)
            </label>
            <Input
              type="number"
              value={form.integration.pingbackDelay}
              onChange={(e) => updateIntegration('pingbackDelay', e.target.value)}
              placeholder="60"
            />
            <p className="mt-1 text-sm text-gray-500">
              Delay before sending pingback
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Retry Attempts
            </label>
            <Input
              type="number"
              value={form.integration.retryAttempts}
              onChange={(e) => updateIntegration('retryAttempts', e.target.value)}
              placeholder="3"
            />
            <p className="mt-1 text-sm text-gray-500">
              Number of delivery retries
            </p>
          </div>
        </div>

        {/* Integration Example */}
        <div className="rounded-md bg-gray-50 p-4 mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Example Lead Payload</h4>
          <pre className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200 overflow-x-auto">
{`{
  "lead_id": "ld_123456789",
  "buyer_id": "by_123456789",
  "timestamp": "2024-03-21T10:30:00Z",
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "vertical": "${form.basic.vertical || '[vertical]'}"
  },
  "price": "${form.pricing?.leadPrice || '0.00'}",
  "currency": "${form.pricing?.currency || 'USD'}"
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}