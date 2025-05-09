"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { HelpCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { type StepProps } from '../../types'

export function TrackingInfo({ form, setForm }: StepProps) {
  const handleTrackingChange = (field: string, value: string) => {
    setForm({
      ...form,
      tracking: {
        ...form.tracking,
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
            <p className="font-medium">Campaign Tracking</p>
            <p className="mt-1">
              Set up UTM parameters to track traffic sources and campaign performance
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div>
          <Label htmlFor="utmSource" className="required">UTM Source</Label>
          <Input
            id="utmSource"
            value={form.tracking.utmSource}
            onChange={(e) => handleTrackingChange('utmSource', e.target.value)}
            placeholder="e.g., google, facebook, newsletter"
          />
          <p className="text-sm text-gray-500 mt-1">
            The referrer (e.g., google, facebook, newsletter)
          </p>
        </div>

        <div>
          <Label htmlFor="utmMedium" className="required">UTM Medium</Label>
          <Input
            id="utmMedium"
            value={form.tracking.utmMedium}
            onChange={(e) => handleTrackingChange('utmMedium', e.target.value)}
            placeholder="e.g., cpc, banner, email"
          />
          <p className="text-sm text-gray-500 mt-1">
            Marketing medium (e.g., cpc, banner, email)
          </p>
        </div>

        <div>
          <Label htmlFor="utmCampaign" className="required">UTM Campaign</Label>
          <Input
            id="utmCampaign"
            value={form.tracking.utmCampaign}
            onChange={(e) => handleTrackingChange('utmCampaign', e.target.value)}
            placeholder="e.g., spring_sale, product_launch"
          />
          <p className="text-sm text-gray-500 mt-1">
            The specific product promotion or strategic campaign
          </p>
        </div>

        <div>
          <Label htmlFor="utmContent">UTM Content</Label>
          <Input
            id="utmContent"
            value={form.tracking.utmContent}
            onChange={(e) => handleTrackingChange('utmContent', e.target.value)}
            placeholder="e.g., logo_link, header_banner"
          />
          <p className="text-sm text-gray-500 mt-1">
            Optional: Use to differentiate similar content or links within the same ad
          </p>
        </div>

        <div>
          <Label htmlFor="utmTerm">UTM Term</Label>
          <Input
            id="utmTerm"
            value={form.tracking.utmTerm}
            onChange={(e) => handleTrackingChange('utmTerm', e.target.value)}
            placeholder="e.g., running+shoes, marketing+software"
          />
          <p className="text-sm text-gray-500 mt-1">
            Optional: Identify paid search keywords
          </p>
        </div>

        <Card className="p-4 bg-gray-50">
          <p className="text-sm font-medium mb-2">Preview URL Parameters</p>
          <div className="text-xs font-mono bg-white p-3 rounded border break-all">
            ?utm_source={form.tracking.utmSource}
            &utm_medium={form.tracking.utmMedium}
            &utm_campaign={form.tracking.utmCampaign}
            {form.tracking.utmContent && `&utm_content=${form.tracking.utmContent}`}
            {form.tracking.utmTerm && `&utm_term=${form.tracking.utmTerm}`}
          </div>
        </Card>
      </div>
    </div>
  )
} 