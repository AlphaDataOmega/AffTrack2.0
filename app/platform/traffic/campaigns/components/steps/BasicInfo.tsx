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
import { HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { CampaignStatus, type StepProps, type Property } from '../../types'

const CAMPAIGN_TYPES = [
  { value: 'social', label: 'Social Media' },
  { value: 'search', label: 'Search Engine' },
  { value: 'display', label: 'Display Ads' },
  { value: 'email', label: 'Email Marketing' },
  { value: 'affiliate', label: 'Affiliate Marketing' }
]

const SOURCE_TYPES = [
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'adnetwork', label: 'Ad Network' }
]

const STATUS_OPTIONS = [
  { value: CampaignStatus.DRAFT, label: 'Draft' },
  { value: CampaignStatus.ACTIVE, label: 'Active' },
  { value: CampaignStatus.PAUSED, label: 'Paused' },
  { value: CampaignStatus.ARCHIVED, label: 'Archived' }
]

interface TrafficSource {
  id: string
  name: string
  status: string
}

export function BasicInfo({ form, setForm }: StepProps) {
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSources, setLoadingSources] = useState(false)

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

  useEffect(() => {
    const fetchSources = async () => {
      if (!form.basic.sourceType) return

      try {
        setLoadingSources(true)
        const endpoint = form.basic.sourceType === 'affiliate' 
          ? '/api/traffic/affiliates'
          : '/api/traffic/adnetworks'
        
        const response = await fetch(endpoint)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || `Failed to fetch ${form.basic.sourceType}s`)
        }
        
        const { data, error } = await response.json()
        if (error) throw new Error(error.message)
        
        setTrafficSources(data || [])
      } catch (error) {
        console.error('[SOURCES_FETCH_ERROR]', error)
        toast({
          title: "Error",
          description: `Failed to load ${form.basic.sourceType}s`,
          variant: "destructive",
        })
      } finally {
        setLoadingSources(false)
      }
    }

    fetchSources()
  }, [form.basic.sourceType, toast])

  const handleSourceChange = (sourceId: string) => {
    setForm({
      ...form,
      basic: {
        ...form.basic,
        affiliateId: form.basic.sourceType === 'affiliate' ? sourceId : undefined,
        adNetworkId: form.basic.sourceType === 'adnetwork' ? sourceId : undefined
      }
    })
  }

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

  const sourceOptions = trafficSources.map(source => ({
    value: source.id,
    label: source.name,
    disabled: source.status !== 'ACTIVE'
  }))

  const selectedSourceId = form.basic.sourceType === 'affiliate' 
    ? form.basic.affiliateId 
    : form.basic.adNetworkId

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-100">
        <div className="p-4 flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Basic Campaign Information</p>
            <p className="mt-1">
              Enter the basic details about this campaign including properties, name, and traffic source
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div>
          <Label htmlFor="status" className="required">Campaign Status</Label>
          <Select
            value={form.basic.status || CampaignStatus.DRAFT}
            onValueChange={(value: CampaignStatus) => 
              setForm({
                ...form,
                basic: { ...form.basic, status: value }
              })
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select campaign status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Control whether this campaign is active, paused, or in draft mode
          </p>
        </div>

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
            Select the properties this campaign will be associated with
          </p>
        </div>

        <div>
          <Label htmlFor="name" className="required">Campaign Name</Label>
          <Input
            id="name"
            value={form.basic.name}
            onChange={(e) => 
              setForm({
                ...form,
                basic: { ...form.basic, name: e.target.value }
              })
            }
            placeholder="Enter campaign name"
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
            placeholder="Enter campaign description"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="type" className="required">Campaign Type</Label>
          <Select
            value={form.basic.type}
            onValueChange={(value) => {
              setForm({
                ...form,
                basic: { 
                  ...form.basic, 
                  type: value,
                  sourceType: '', // Reset source type when campaign type changes
                  affiliateId: undefined, // Reset affiliate when campaign type changes
                  adNetworkId: undefined // Reset ad network when campaign type changes
                }
              })
            }}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select campaign type" />
            </SelectTrigger>
            <SelectContent>
              {CAMPAIGN_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Choose the type of marketing campaign
          </p>
        </div>

        <div>
          <Label htmlFor="sourceType" className="required">Source Type</Label>
          <Select
            value={form.basic.sourceType}
            onValueChange={(value) => 
              setForm({
                ...form,
                basic: { 
                  ...form.basic, 
                  sourceType: value,
                  affiliateId: undefined, // Reset affiliate when source type changes
                  adNetworkId: undefined // Reset ad network when source type changes
                }
              })
            }
          >
            <SelectTrigger id="sourceType">
              <SelectValue placeholder="Select source type" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Choose between affiliate or ad network traffic source
          </p>
        </div>

        {form.basic.sourceType && (
          <div>
            <Label htmlFor="source" className="required">Traffic Source</Label>
            <Select
              value={selectedSourceId}
              onValueChange={handleSourceChange}
              disabled={loadingSources}
            >
              <SelectTrigger id="source">
                <SelectValue 
                  placeholder={loadingSources 
                    ? `Loading ${form.basic.sourceType}s...` 
                    : `Select ${form.basic.sourceType}`
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((source) => (
                  <SelectItem 
                    key={source.value} 
                    value={source.value}
                    disabled={source.disabled}
                  >
                    {source.label}
                    {source.disabled && " (Inactive)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Select the specific {form.basic.sourceType} for this campaign
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 