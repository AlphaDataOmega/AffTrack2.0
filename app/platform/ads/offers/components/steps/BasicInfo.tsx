"use client"

import { useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Card } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { logError } from "@/lib/activity"
import { BaseFormData, STATUS_OPTIONS } from "../../types"

interface Property {
  id: string
  name: string
  domain: string
}

export function BasicInfo() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<BaseFormData>()
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async (retryCount = 0) => {
      try {
        setLoading(true)
        const response = await fetch('/api/manage/properties')
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || 'Failed to fetch properties')
        }
        
        const { data, error } = await response.json()
        if (error) throw new Error(error.message)
        
        setProperties(data || [])
      } catch (error) {
        // Retry logic for network errors
        if (retryCount < 3 && error instanceof Error && error.message.includes('fetch')) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return fetchProperties(retryCount + 1)
        }

        await logError('PROPERTY', error, {
          component: 'BasicInfo',
          retryCount
        })
        toast({
          title: "Error",
          description: "Failed to load properties",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [toast])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-[200px] bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-[150px] bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  const propertyOptions = properties.map(p => ({
    value: p.id,
    label: `${p.name} (${p.domain || 'No Domain'})`
  }))

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-100">
        <div className="p-4 flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Basic Information</p>
            <p className="mt-1">
              Enter the basic details including properties and status
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div>
          <Label htmlFor="properties" className="required">Properties</Label>
          <MultiSelect
            options={propertyOptions}
            value={watch("properties")?.map(p => p.id) || []}
            onValueChange={(values) => {
              setValue("properties", values.map(id => {
                const property = properties.find(p => p.id === id)
                return {
                  id,
                  name: property?.name || '',
                  domain: property?.domain || ''
                }
              }), { shouldValidate: true })
            }}
            placeholder="Select properties"
          />
          {errors.properties && (
            <p className="text-sm text-red-500 mt-1">{errors.properties.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Select the properties this item will be associated with
          </p>
        </div>

        <div>
          <Label htmlFor="status" className="required">Status</Label>
          <Select
            value={watch("status")}
            onValueChange={(value) => setValue("status", value, { shouldValidate: true })}
          >
            <SelectTrigger id="status" className={errors.status ? "border-red-500" : ""}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Set the current status
          </p>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Enter description"
            rows={3}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Add any additional details
          </p>
        </div>
      </div>
    </div>
  )
} 