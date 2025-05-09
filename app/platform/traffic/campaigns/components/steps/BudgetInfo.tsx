"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { HelpCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type StepProps, CampaignType } from '../../types'

export function BudgetInfo({ form, setForm }: StepProps) {
  const handleBudgetChange = (field: string, value: any) => {
    setForm({
      ...form,
      budget: {
        ...form.budget,
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
            <p className="font-medium">Campaign Budget</p>
            <p className="mt-1">
              Set your campaign type, bid strategy, and budget limits
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div>
          <Label htmlFor="campaignType" className="required">Campaign Type</Label>
          <Select
            value={form.budget.campaignType}
            onValueChange={(value: CampaignType) => {
              handleBudgetChange('campaignType', value)
              // Reset bid amounts when changing campaign type
              handleBudgetChange('bidAmount', undefined)
              handleBudgetChange('targetCpa', undefined)
              handleBudgetChange('revshareRate', undefined)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select campaign type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CampaignType.CPC}>
                Cost Per Click (CPC)
              </SelectItem>
              <SelectItem value={CampaignType.CPA}>
                Cost Per Action (CPA)
              </SelectItem>
              <SelectItem value={CampaignType.REVSHARE}>
                Revenue Share
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Choose how you want to pay for your campaign
          </p>
        </div>

        {form.budget.campaignType === CampaignType.CPC && (
          <div>
            <Label htmlFor="bidAmount" className="required">Bid Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <Input
                id="bidAmount"
                type="number"
                min="0.01"
                step="0.01"
                className="pl-7"
                value={form.budget.bidAmount || ''}
                onChange={(e) => handleBudgetChange('bidAmount', parseFloat(e.target.value) || null)}
                placeholder="0.00"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Maximum amount you're willing to pay per click
            </p>
          </div>
        )}

        {form.budget.campaignType === CampaignType.CPA && (
          <div>
            <Label htmlFor="targetCpa" className="required">Target CPA</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <Input
                id="targetCpa"
                type="number"
                min="0.01"
                step="0.01"
                className="pl-7"
                value={form.budget.targetCpa || ''}
                onChange={(e) => handleBudgetChange('targetCpa', parseFloat(e.target.value) || null)}
                placeholder="0.00"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Target cost per action you want to achieve
            </p>
          </div>
        )}

        {form.budget.campaignType === CampaignType.REVSHARE && (
          <div>
            <Label htmlFor="revshareRate" className="required">Revenue Share Rate</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">%</span>
              <Input
                id="revshareRate"
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                className="pl-7"
                value={form.budget.revshareRate || ''}
                onChange={(e) => handleBudgetChange('revshareRate', parseFloat(e.target.value) || null)}
                placeholder="0.00"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Percentage of revenue you'll share with the affiliate
            </p>
          </div>
        )}

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label>Daily Budget</Label>
              <p className="text-sm text-gray-500">
                Set a daily spending limit
              </p>
            </div>
            <Switch
              checked={!form.budget.dailyUnlimited}
              onCheckedChange={(checked) => handleBudgetChange('dailyUnlimited', !checked)}
            />
          </div>

          {!form.budget.dailyUnlimited && (
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                className="pl-7"
                value={form.budget.daily || ''}
                onChange={(e) => handleBudgetChange('daily', parseFloat(e.target.value) || null)}
                placeholder="0.00"
              />
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label>Total Budget</Label>
              <p className="text-sm text-gray-500">
                Set a total campaign spending limit
              </p>
            </div>
            <Switch
              checked={!form.budget.totalUnlimited}
              onCheckedChange={(checked) => handleBudgetChange('totalUnlimited', !checked)}
            />
          </div>

          {!form.budget.totalUnlimited && (
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                className="pl-7"
                value={form.budget.total || ''}
                onChange={(e) => handleBudgetChange('total', parseFloat(e.target.value) || null)}
                placeholder="0.00"
              />
            </div>
          )}
        </div>

        <Card className="p-4 bg-gray-50">
          <p className="text-sm font-medium mb-2">Budget Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Campaign Type:</span>
              <span className="font-medium">
                {form.budget.campaignType === CampaignType.CPC ? 'Cost Per Click' : form.budget.campaignType === CampaignType.CPA ? 'Cost Per Action' : 'Revenue Share'}
              </span>
            </div>
            {form.budget.campaignType === CampaignType.CPC && form.budget.bidAmount && (
              <div className="flex justify-between">
                <span>Bid Amount:</span>
                <span className="font-medium">${form.budget.bidAmount.toFixed(2)}</span>
              </div>
            )}
            {form.budget.campaignType === CampaignType.CPA && form.budget.targetCpa && (
              <div className="flex justify-between">
                <span>Target CPA:</span>
                <span className="font-medium">${form.budget.targetCpa.toFixed(2)}</span>
              </div>
            )}
            {form.budget.campaignType === CampaignType.REVSHARE && form.budget.revshareRate && (
              <div className="flex justify-between">
                <span>Revenue Share Rate:</span>
                <span className="font-medium">{form.budget.revshareRate.toFixed(2)}%</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Daily Budget:</span>
              <span className="font-medium">
                {form.budget.dailyUnlimited 
                  ? 'Unlimited' 
                  : form.budget.daily 
                    ? `$${form.budget.daily.toFixed(2)}` 
                    : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Budget:</span>
              <span className="font-medium">
                {form.budget.totalUnlimited 
                  ? 'Unlimited' 
                  : form.budget.total 
                    ? `$${form.budget.total.toFixed(2)}` 
                    : 'Not set'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 