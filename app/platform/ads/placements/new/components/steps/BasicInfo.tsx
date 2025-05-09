"use client"

import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface BasicInfoProps {
  form: any
  setForm: (form: any) => void
}

const AD_SIZES = {
  banner: [
    { value: "728x90", label: "Leaderboard (728x90)" },
    { value: "468x60", label: "Banner (468x60)" },
    { value: "300x250", label: "Medium Rectangle (300x250)" },
    { value: "336x280", label: "Large Rectangle (336x280)" },
    { value: "160x600", label: "Wide Skyscraper (160x600)" }
  ],
  native: [
    { value: "feed", label: "Feed Ad" },
    { value: "content", label: "In-Content" },
    { value: "sidebar", label: "Sidebar Widget" }
  ],
  popup: [
    { value: "640x480", label: "Standard (640x480)" },
    { value: "550x450", label: "Medium (550x450)" },
    { value: "300x300", label: "Small (300x300)" }
  ],
  sticky: [
    { value: "bottom", label: "Bottom Bar" },
    { value: "top", label: "Top Bar" },
    { value: "side", label: "Side Bar" }
  ]
}

const POSITIONS = [
  { value: "header", label: "Header" },
  { value: "footer", label: "Footer" },
  { value: "sidebar", label: "Sidebar" },
  { value: "content", label: "In-Content" },
  { value: "overlay", label: "Overlay" },
  { value: "custom", label: "Custom Position" }
]

export function BasicInfo({ form, setForm }: BasicInfoProps) {
  return (
    <div className="space-y-8">
      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Placement Information</p>
            <p className="mt-1">
              Configure the basic settings for your ad placement
            </p>
          </div>
        </div>
      </Card>

      {/* Form Fields */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placement Name
            <span className="text-red-500">*</span>
          </label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Homepage Header Banner"
          />
          <p className="mt-1 text-sm text-gray-500">
            A descriptive name to identify this placement
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ad Type
            <span className="text-red-500">*</span>
          </label>
          <Select
            value={form.type}
            onValueChange={(value: "banner" | "native" | "popup" | "sticky") => {
              setForm({ 
                ...form, 
                type: value,
                size: '' // Reset size when type changes
              })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ad type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="banner">Banner Ad</SelectItem>
              <SelectItem value="native">Native Ad</SelectItem>
              <SelectItem value="popup">Popup/Overlay</SelectItem>
              <SelectItem value="sticky">Sticky Ad</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.type && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ad Size
              <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.size}
              onValueChange={(value) => setForm({ ...form, size: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ad size" />
              </SelectTrigger>
              <SelectContent>
                {AD_SIZES[form.type].map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Page URL
            <span className="text-red-500">*</span>
          </label>
          <Input
            type="url"
            value={form.pageUrl}
            onChange={(e) => setForm({ ...form, pageUrl: e.target.value })}
            placeholder="Enter the page URL where this ad will appear"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Position
            <span className="text-red-500">*</span>
          </label>
          <Select
            value={form.position}
            onValueChange={(value) => setForm({ ...form, position: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              {POSITIONS.map((pos) => (
                <SelectItem key={pos.value} value={pos.value}>
                  {pos.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {form.position === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom CSS
            </label>
            <Textarea
              value={form.customCss}
              onChange={(e) => setForm({ ...form, customCss: e.target.value })}
              placeholder="Enter custom CSS for positioning (optional)"
              className="font-mono text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Custom CSS rules to position the ad (e.g., margin, padding, position)
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 