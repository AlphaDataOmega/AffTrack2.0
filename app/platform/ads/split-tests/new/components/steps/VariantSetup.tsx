"use client"

import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { HelpCircle, Plus, X, AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect } from "react"

interface VariantSetupProps {
  form: any
  setForm: (form: any) => void
}

// This would come from your API/database
const AVAILABLE_OFFERS = [
  { id: "1", name: "Weight Loss Program", network: "MaxBounty" },
  { id: "2", name: "Crypto Trading Course", network: "ClickBank" },
  { id: "3", name: "VPN Subscription", network: "CJ Affiliate" }
]

export function VariantSetup({ form, setForm }: VariantSetupProps) {
  const [adjustingVariantId, setAdjustingVariantId] = useState<string | null>(null)

  const addVariant = () => {
    const newVariant = {
      id: crypto.randomUUID(),
      name: `Variant ${form.variants.length + 1}`,
      offerId: '',
      weight: 0,
      description: ''
    }
    setForm({
      ...form,
      variants: [...form.variants, newVariant]
    })
    redistributeWeights()
  }

  const removeVariant = (variantId: string) => {
    setForm({
      ...form,
      variants: form.variants.filter((v: any) => v.id !== variantId)
    })
    redistributeWeights()
  }

  const updateVariant = (variantId: string, field: string, value: any) => {
    setForm({
      ...form,
      variants: form.variants.map((v: any) => 
        v.id === variantId ? { ...v, [field]: value } : v
      )
    })
  }

  const handleSliderChange = (variantId: string, newWeight: number) => {
    setAdjustingVariantId(variantId)
    const adjustingVariant = form.variants.find((v: any) => v.id === variantId)
    const oldWeight = adjustingVariant.weight
    const weightDiff = newWeight - oldWeight

    // Calculate how much to distribute from/to other variants
    const otherVariants = form.variants.filter((v: any) => v.id !== variantId)
    const totalOtherWeight = otherVariants.reduce((sum: number, v: any) => sum + v.weight, 0)
    
    if (totalOtherWeight === 0) {
      redistributeWeights()
      return
    }

    const updatedVariants = form.variants.map((v: any) => {
      if (v.id === variantId) {
        return { ...v, weight: newWeight }
      } else {
        // Proportionally adjust other variants
        const proportion = v.weight / totalOtherWeight
        const adjustment = weightDiff * proportion
        return { ...v, weight: Math.max(0, v.weight - adjustment) }
      }
    })

    setForm({
      ...form,
      variants: updatedVariants
    })
  }

  const handleSliderCommit = () => {
    setAdjustingVariantId(null)
    // Round numbers and ensure total is 100%
    const total = form.variants.reduce((sum: number, v: any) => sum + v.weight, 0)
    if (total !== 100) {
      redistributeWeights()
    }
  }

  const redistributeWeights = () => {
    const variantCount = form.variants.length
    if (variantCount > 0) {
      const evenWeight = Math.floor(100 / variantCount)
      const remainder = 100 - (evenWeight * variantCount)
      
      setForm({
        ...form,
        variants: form.variants.map((v: any, index: number) => ({
          ...v,
          weight: evenWeight + (index === 0 ? remainder : 0)
        }))
      })
    }
  }

  useEffect(() => {
    if (form.variants.length > 0 && form.variants.every((v: any) => v.weight === 0)) {
      redistributeWeights()
    }
  }, [form.variants.length])

  const totalWeight = form.variants.reduce((sum: number, v: any) => sum + v.weight, 0)
  const isValidWeight = Math.abs(totalWeight - 100) < 0.1

  return (
    <div className="space-y-8">
      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Test Variants</p>
            <p className="mt-1">
              Add variants and configure traffic distribution
            </p>
          </div>
        </div>
      </Card>

      {/* Variants */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Variants</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
            className="gap-2"
            disabled={form.variants.length >= 5}
          >
            <Plus className="w-4 h-4" />
            Add Variant
          </Button>
        </div>

        {form.variants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No variants added yet. Click "Add Variant" to start.
          </div>
        )}

        <div className="space-y-4">
          {form.variants.map((variant: any, index: number) => (
            <Card key={variant.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{variant.name}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(variant.id)}
                    disabled={form.variants.length <= 2}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Traffic Distribution
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[variant.weight]}
                        onValueChange={([value]) => handleSliderChange(variant.id, value)}
                        onValueCommit={handleSliderCommit}
                        min={0}
                        max={100}
                        step={1}
                        className="my-2"
                      />
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round(variant.weight)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Select Offer
                  </Label>
                  <Select
                    value={variant.offerId}
                    onValueChange={(value) => updateVariant(variant.id, 'offerId', value)}
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
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    value={variant.description}
                    onChange={(e) => updateVariant(variant.id, 'description', e.target.value)}
                    placeholder="Optional notes about this variant"
                    className="h-20"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Weight Warning */}
        {form.variants.length > 0 && !isValidWeight && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">
              Traffic weights must add up to 100% (currently {Math.round(totalWeight)}%)
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 