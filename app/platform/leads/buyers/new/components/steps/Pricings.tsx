 "use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle } from "lucide-react"

interface PricingProps {
  form: any
  setForm: (form: any) => void
}

export function Pricing({ form, setForm }: PricingProps) {
  const updatePricing = (field: string, value: string) => {
    setForm({
      ...form,
      pricing: {
        ...form.pricing,
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
            <p className="font-medium">Pricing & Terms</p>
            <p className="mt-1">
              Set up pricing model and payment terms for this buyer
            </p>
          </div>
        </div>
      </Card>

      {/* Pricing Settings */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pricing Model
            <span className="text-red-500">*</span>
          </label>
          <Select
            value={form.pricing.model}
            onValueChange={(value) => updatePricing('model', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select pricing model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Price</SelectItem>
              <SelectItem value="variable">Variable Price</SelectItem>
              <SelectItem value="tiered">Tiered Pricing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Price
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={form.pricing.leadPrice}
              onChange={(e) => updatePricing('leadPrice', e.target.value)}
              placeholder="Enter price per lead"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <Select
              value={form.pricing.currency}
              onValueChange={(value) => updatePricing('currency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Volume
            </label>
            <Input
              type="number"
              value={form.pricing.minVolume}
              onChange={(e) => updatePricing('minVolume', e.target.value)}
              placeholder="Min leads per month"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Volume
            </label>
            <Input
              type="number"
              value={form.pricing.maxVolume}
              onChange={(e) => updatePricing('maxVolume', e.target.value)}
              placeholder="Max leads per month"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Frequency
            </label>
            <Select
              value={form.pricing.billingFrequency}
              onValueChange={(value) => updatePricing('billingFrequency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Terms
            </label>
            <Select
              value={form.pricing.paymentTerms}
              onValueChange={(value) => updatePricing('paymentTerms', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net15">Net 15</SelectItem>
                <SelectItem value="net30">Net 30</SelectItem>
                <SelectItem value="net45">Net 45</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}