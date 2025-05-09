"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { affiliateFormSchema, type StepProps } from '../../types'

type PayoutMethod = "bank" | "paypal" | "wise" | "crypto"
type PayoutCurrency = "USD" | "EUR" | "GBP"

export function PayoutInfo({ form, setForm }: StepProps) {
  const handlePayoutChange = (field: keyof typeof form.payout, value: string) => {
    setForm({
      ...form,
      payout: {
        ...form.payout,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-8">
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Payout Information</p>
            <p className="mt-1">
              Configure how this affiliate will be paid
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div>
          <Label htmlFor="method">Payment Method</Label>
          <Select
            value={form.payout.method}
            onValueChange={(value: PayoutMethod) => handlePayoutChange('method', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank">Bank Transfer</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="wise">Wise</SelectItem>
              <SelectItem value="crypto">Cryptocurrency</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Choose how you want to receive payments
          </p>
        </div>

        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={form.payout.currency}
            onValueChange={(value: PayoutCurrency) => handlePayoutChange('currency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Select your preferred payment currency
          </p>
        </div>

        <div>
          <Label htmlFor="terms">Payment Terms</Label>
          <Textarea
            id="terms"
            value={form.payout.terms}
            onChange={(e) => handlePayoutChange('terms', e.target.value)}
            placeholder="Enter payment terms and conditions"
            rows={4}
            className={form.payout.terms.length > 1000 ? "border-red-200" : ""}
          />
          <div className="flex justify-between mt-1">
            <p className="text-sm text-gray-500">
              Additional payment terms or requirements
            </p>
            <p className="text-sm text-gray-500">
              {form.payout.terms.length}/1000
            </p>
          </div>
          {form.payout.terms.length > 1000 && (
            <p className="text-sm text-red-600 mt-1">
              Terms cannot exceed 1000 characters
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 