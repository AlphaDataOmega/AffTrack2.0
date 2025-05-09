"use client"

import { useState, useEffect } from 'react'
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
import { Button } from "@/components/ui/button"
import { X, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { AffiliateStatus, type StepProps, type Property } from '../../types'

export function BasicInfo({ form, setForm }: StepProps) {
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
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
        console.error('[PROPERTIES_FETCH_ERROR]', error)
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
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    )
  }

  const propertyOptions = properties.map(p => ({
    value: p.id,
    label: `${p.name} (${p.domain || 'No Domain'})`
  }))

  return (
    <div className="space-y-8">
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Basic Information</p>
            <p className="mt-1">
              Enter the basic details about this affiliate
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div>
          <Label htmlFor="properties" className="required">Properties</Label>
          <MultiSelect
            options={propertyOptions}
            value={form.basic.propertyIds}
            onValueChange={(values: string[]) => {
              setForm({
                ...form,
                basic: {
                  ...form.basic,
                  propertyIds: values
                }
              })
            }}
            placeholder="Select properties"
          />
          <p className="text-sm text-gray-500 mt-1">
            Select the properties this affiliate will be associated with
          </p>
        </div>

        <div>
          <Label htmlFor="name" className="required">Affiliate Name</Label>
          <Input
            id="name"
            value={form.basic.name}
            onChange={(e) => 
              setForm({
                ...form,
                basic: { ...form.basic, name: e.target.value }
              })
            }
            placeholder="Enter affiliate name"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.basic.description}
            onChange={(e) => 
              setForm({
                ...form,
                basic: { ...form.basic, description: e.target.value }
              })
            }
            placeholder="Enter description"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={form.basic.company}
            onChange={(e) => 
              setForm({
                ...form,
                basic: { ...form.basic, company: e.target.value }
              })
            }
            placeholder="Enter company name"
          />
        </div>

        <div>
          <Label htmlFor="status" className="required">Status</Label>
          <Select
            value={form.basic.status}
            onValueChange={(value: AffiliateStatus) => 
              setForm({
                ...form,
                basic: { ...form.basic, status: value }
              })
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(AffiliateStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Tags</Label>
          <Input
            type="text"
            placeholder="Add tags (press Enter)"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                e.preventDefault()
                const newTag = e.currentTarget.value
                if (!form.basic.tags.includes(newTag)) {
                  setForm({
                    ...form,
                    basic: {
                      ...form.basic,
                      tags: [...form.basic.tags, newTag]
                    }
                  })
                }
                e.currentTarget.value = ''
              }
            }}
          />
          <p className="mt-1 text-sm text-gray-500">
            Add tags to help organize and filter your affiliates
          </p>
          
          {form.basic.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {form.basic.tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md"
                >
                  <span className="text-sm">{tag}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-blue-100"
                    onClick={() => {
                      setForm({
                        ...form,
                        basic: {
                          ...form.basic,
                          tags: form.basic.tags.filter(t => t !== tag)
                        }
                      })
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}