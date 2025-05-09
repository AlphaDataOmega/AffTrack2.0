"use client"

import { Card } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface RoutingSetupProps {
  form: any
  setForm: (form: any) => void
}

// This would come from your API/database
const AVAILABLE_OFFERS = [
  { id: "1", name: "Weight Loss Program", network: "MaxBounty" },
  { id: "2", name: "Crypto Trading Course", network: "ClickBank" },
  { id: "3", name: "VPN Subscription", network: "CJ Affiliate" }
]

// This would come from your API/database
const AVAILABLE_SPLIT_TESTS = [
  { id: "1", name: "Homepage Offer Test", status: "active", variants: 3 },
  { id: "2", name: "Landing Page Test", status: "active", variants: 2 },
  { id: "3", name: "Product Page Test", status: "paused", variants: 4 }
]

export function RoutingSetup({ form, setForm }: RoutingSetupProps) {
  const updateRouting = (field: string, value: any) => {
    setForm({
      ...form,
      routing: {
        ...form.routing,
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
            <p className="font-medium">Traffic Routing</p>
            <p className="mt-1">
              Choose where to send traffic from this placement
            </p>
          </div>
        </div>
      </Card>

      {/* Routing Type Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Routing Type</h3>
        <RadioGroup
          value={form.routing.type}
          onValueChange={(value: "direct" | "split") => {
            updateRouting('type', value)
            // Reset the other fields when switching types
            if (value === 'direct') {
              updateRouting('splitTest', undefined)
            } else {
              updateRouting('directOffer', undefined)
            }
          }}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="direct" id="direct" />
            <Label htmlFor="direct">Direct to Offer</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="split" id="split" />
            <Label htmlFor="split">Split Test</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Direct Offer Selection */}
      {form.routing.type === 'direct' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Select Offer</h3>
          <Select
            value={form.routing.directOffer}
            onValueChange={(value) => updateRouting('directOffer', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose an offer" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_OFFERS.map((offer) => (
                <SelectItem key={offer.id} value={offer.id}>
                  {offer.name} ({offer.network})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.routing.directOffer && (
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(`/ads/offers/${form.routing.directOffer}`, '_blank')}
            >
              View Offer Details
            </Button>
          )}
        </div>
      )}

      {/* Split Test Selection */}
      {form.routing.type === 'split' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Select Split Test</h3>
          <Select
            value={form.routing.splitTest?.name}
            onValueChange={(value) => {
              const splitTest = AVAILABLE_SPLIT_TESTS.find(test => test.id === value)
              updateRouting('splitTest', { name: value, variants: [] })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a split test" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_SPLIT_TESTS.filter(test => test.status === 'active').map((test) => (
                <SelectItem key={test.id} value={test.id}>
                  {test.name} ({test.variants} variants)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.routing.splitTest?.name && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open(`/ads/split-tests/${form.routing.splitTest.name}`, '_blank')}
              >
                View Split Test
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open('/ads/split-tests/new', '_blank')}
              >
                Create New Split Test
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 