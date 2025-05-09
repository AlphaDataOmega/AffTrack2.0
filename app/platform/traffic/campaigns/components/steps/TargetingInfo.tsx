"use client"

import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"
import { MultiSelect } from "@/components/ui/multi-select"
import { type StepProps } from '../../types'

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' }
]

const DEVICES = [
  { value: 'desktop', label: 'Desktop' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' }
]

const BROWSERS = [
  { value: 'chrome', label: 'Chrome' },
  { value: 'firefox', label: 'Firefox' },
  { value: 'safari', label: 'Safari' },
  { value: 'edge', label: 'Edge' }
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' }
]

export function TargetingInfo({ form, setForm }: StepProps) {
  return (
    <div className="space-y-8">
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Campaign Targeting</p>
            <p className="mt-1">
              Define your target audience and campaign criteria
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div>
          <Label htmlFor="countries" className="required">Target Countries</Label>
          <MultiSelect
            options={COUNTRIES}
            value={form.targeting.countries}
            onValueChange={(values: string[]) => {
              setForm({
                ...form,
                targeting: { ...form.targeting, countries: values }
              })
            }}
            placeholder="Select countries"
          />
        </div>

        <div>
          <Label htmlFor="devices" className="required">Target Devices</Label>
          <MultiSelect
            options={DEVICES}
            value={form.targeting.devices}
            onValueChange={(values: string[]) => {
              setForm({
                ...form,
                targeting: { ...form.targeting, devices: values }
              })
            }}
            placeholder="Select devices"
          />
        </div>

        <div>
          <Label htmlFor="browsers" className="required">Target Browsers</Label>
          <MultiSelect
            options={BROWSERS}
            value={form.targeting.browsers}
            onValueChange={(values: string[]) => {
              setForm({
                ...form,
                targeting: { ...form.targeting, browsers: values }
              })
            }}
            placeholder="Select browsers"
          />
        </div>

        <div>
          <Label htmlFor="languages" className="required">Target Languages</Label>
          <MultiSelect
            options={LANGUAGES}
            value={form.targeting.languages}
            onValueChange={(values: string[]) => {
              setForm({
                ...form,
                targeting: { ...form.targeting, languages: values }
              })
            }}
            placeholder="Select languages"
          />
        </div>
      </div>
    </div>
  )
} 