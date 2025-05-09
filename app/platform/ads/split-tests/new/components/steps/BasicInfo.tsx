"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { HelpCircle } from "lucide-react"
import { Label } from "@/components/ui/label"

interface BasicInfoProps {
  form: any
  setForm: (form: any) => void
}

const PLACEMENTS = [
  { value: "homepage", label: "Homepage" },
  { value: "landing", label: "Landing Pages" },
  { value: "blog", label: "Blog Posts" },
  { value: "product", label: "Product Pages" },
  { value: "category", label: "Category Pages" },
  { value: "custom", label: "Custom Page" }
]

export function BasicInfo({ form, setForm }: BasicInfoProps) {
  return (
    <div className="space-y-8">
      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Split Test Information</p>
            <p className="mt-1">
              Configure the basic settings for your split test
            </p>
          </div>
        </div>
      </Card>

      {/* Form Fields */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Name
            <span className="text-red-500">*</span>
          </label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Homepage Hero Offer Test"
          />
          <p className="mt-1 text-sm text-gray-500">
            A descriptive name to identify this test
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
            <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe what you're testing and your hypothesis"
            className="min-h-[100px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placement
            <span className="text-red-500">*</span>
          </label>
          <Select
            value={form.placement}
            onValueChange={(value) => setForm({ ...form, placement: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select placement" />
            </SelectTrigger>
            <SelectContent>
              {PLACEMENTS.map((placement) => (
                <SelectItem key={placement.value} value={placement.value}>
                  {placement.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Test Settings */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Test Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-700">Auto-Optimize</Label>
                <p className="text-sm text-gray-500">
                  Automatically adjust traffic based on performance
                </p>
              </div>
              <Switch
                checked={form.autoOptimize}
                onCheckedChange={(checked) => setForm({ ...form, autoOptimize: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-700">Auto-End Test</Label>
                <p className="text-sm text-gray-500">
                  Automatically end test when conditions are met
                </p>
              </div>
              <Switch
                checked={form.autoEndEnabled}
                onCheckedChange={(checked) => setForm({ ...form, autoEndEnabled: checked })}
              />
            </div>

            {form.autoEndEnabled && (
              <div className="space-y-4 pl-4 border-l-2 border-gray-100">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Minimum Confidence
                  </Label>
                  <Select
                    value={form.minimumConfidence.toString()}
                    onValueChange={(value) => setForm({ ...form, minimumConfidence: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select confidence level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90% confidence</SelectItem>
                      <SelectItem value="95">95% confidence</SelectItem>
                      <SelectItem value="99">99% confidence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Minimum Sample Size
                  </Label>
                  <Input
                    type="number"
                    value={form.minimumSampleSize}
                    onChange={(e) => setForm({ ...form, minimumSampleSize: parseInt(e.target.value) })}
                    placeholder="e.g., 1000"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Minimum number of visitors before ending test
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 