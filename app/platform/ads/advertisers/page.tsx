"use client"

import { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Plus, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ErrorBoundary } from "react-error-boundary"
import { useToast } from "@/hooks/use-toast"
import { logActivity, logError, ActivityContext } from "@/lib/activity"
import { formatDate } from "@/lib/utils"
import { FeatureTable } from "./components/feature-table"
import { BaseFormData, STATUS_OPTIONS } from "./types"

// Activity Types
const ActivityTypes = {
  FETCH: `${ActivityContext.PROPERTY} FETCH`,
  DELETE: `${ActivityContext.PROPERTY} DELETE`,
  ERROR: `${ActivityContext.PROPERTY} ERROR`
} as const

interface Property {
  id: string
  name: string
  domain: string
}

interface AdvertiserForm {
  basic: {
    name: string
    company: string
    description: string
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
    tags: string[]
    contactName: string
    website: string
    phone: string
    email: string
  }
  properties: Property[]
}

const DEFAULT_FORM_VALUES: AdvertiserForm = {
  basic: {
    name: '',
    company: '',
    description: '',
    status: 'PENDING',
    tags: [],
    contactName: '',
    website: '',
    phone: '',
    email: ''
  },
  properties: []
}

interface Filters {
  propertyId: string | null
  search: string
  status: string
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  useEffect(() => {
    logError('PROPERTY', error, {
      component: 'AdvertisersPage'
    })
  }, [error])

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-3 text-red-800">
        <AlertTriangle className="h-5 w-5" />
        <h3 className="text-sm font-medium">Error Loading Advertisers</h3>
      </div>
      <div className="mt-2 text-sm text-red-700">
        {error.message}
      </div>
      <Button
        className="mt-4"
        variant="outline"
        onClick={resetErrorBoundary}
      >
        Try Again
      </Button>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <Card>
        <div className="p-6 space-y-4">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    </div>
  )
}

function AdvertisersContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [properties, setProperties] = useState<Property[]>([])
  const [items, setItems] = useState<BaseFormData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState<AdvertiserForm>(DEFAULT_FORM_VALUES)
  const [filters, setFilters] = useState<Filters>({
    propertyId: null,
    search: '',
    status: 'all'
  })

  // Check if we're on the new route
  const isNewRoute = window.location.pathname.endsWith('/new')

  const fetchProperties = async (retryCount = 0) => {
    try {
      const response = await fetch('/api/properties')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to fetch properties')
      }
      
      const { data } = await response.json()
      setProperties(data || [])
      if (data?.length > 0 && !isNewRoute) {
        setFilters(prev => ({ ...prev, propertyId: data[0].id }))
      }
    } catch (error) {
      // Retry logic for network errors
      if (retryCount < 3 && error instanceof Error && error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
        return fetchProperties(retryCount + 1)
      }

      await logError('PROPERTY', error, {
        retryCount,
        component: 'fetchProperties'
      })
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchItems = async (retryCount = 0) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/platform/ads/advertisers${filters.propertyId ? `?propertyId=${filters.propertyId}` : ''}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch advertisers')
      }

      const { data } = await response.json()
      setItems(data || [])
    } catch (error) {
      // Retry logic for network errors
      if (retryCount < 3 && error instanceof Error && error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
        return fetchItems(retryCount + 1)
      }

      await logError('PROPERTY', error, {
        retryCount,
        component: 'fetchItems',
        filters
      })
      toast({
        title: "Error",
        description: "Failed to load advertisers",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchProperties()
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (filters.propertyId && !isNewRoute) {
      fetchItems()
    }
  }, [filters.propertyId])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/platform/ads/advertisers?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete advertiser')
      }

      await logActivity(ActivityTypes.DELETE, {
        advertiserId: id,
        propertyId: filters.propertyId || undefined
      })

      await fetchItems()
      toast({
        title: "Success",
        description: "Advertiser deleted successfully"
      })
    } catch (error) {
      await logError('PROPERTY', error, {
        component: 'handleDelete',
        advertiserId: id,
        propertyId: filters.propertyId || undefined
      })
      toast({
        title: "Error",
        description: "Failed to delete advertiser",
        variant: "destructive"
      })
    }
  }

  if (isLoading) return <LoadingSkeleton />

  if (properties.length === 0) {
    return (
      <div className="px-4 py-8">
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
          <p className="text-gray-600 mb-4">
            You need to create a property before you can manage advertisers
          </p>
          <Button
            onClick={() => router.push('/platform/manage/properties/new')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Create Property
          </Button>
        </Card>
      </div>
    )
  }

  if (isNewRoute) {
    return (
      <div className="px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Advertiser</h1>
            <p className="mt-1 text-sm text-gray-500">Create a new advertiser</p>
          </div>
          <Button 
            onClick={() => router.back()}
            variant="outline"
          >
            Cancel
          </Button>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {getStepDetails().map((step, index) => (
              <div key={index} className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {step.items.map((item, i) => (
                    <div key={i}>
                      <label className="text-sm font-medium text-gray-700">{item.label}</label>
                      <Input
                        className="mt-1"
                        value={item.value}
                        onChange={(e) => {
                          const value = e.target.value
                          if (item.label === 'Name') {
                            setForm(prev => ({
                              ...prev,
                              basic: { ...prev.basic, name: value }
                            }))
                          }
                          // Add other field handlers as needed
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  const filteredItems = items.filter(item => {
    if (filters.status !== 'all' && item.status !== filters.status) return false
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return item.name.toLowerCase().includes(searchLower) || 
             (item.company?.toLowerCase().includes(searchLower) || false)
    }
    return true
  })

  const columns = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name"
    },
    {
      id: "company",
      header: "Company",
      accessorKey: "company"
    },
    {
      id: "status",
      header: "Status",
      cell: (row: any) => (
        <Badge variant={row.status === "ACTIVE" ? "success" : "secondary"}>
          {row.status}
        </Badge>
      )
    },
    {
      id: "createdAt",
      header: "Created",
      cell: (row: any) => formatDate(row.createdAt)
    }
  ]

  const getStepDetails = () => [
    {
      title: 'Basic Information',
      description: 'Enter the basic details of your property',
      items: [
        { label: 'Name', value: form.basic?.name || '-' },
        { label: 'Company', value: form.basic?.company || '-' },
        { label: 'Status', value: form.basic?.status || 'PENDING', type: 'badge' },
        { label: 'Contact Name', value: form.basic?.contactName || '-' },
        { label: 'Email', value: form.basic?.email || '-' },
        { label: 'Phone', value: form.basic?.phone || '-' }
      ]
    },
    {
      title: 'User Access',
      description: 'Manage who has access to this property',
      items: [
        { label: 'Selected Properties', value: `${form.properties?.length || 0} properties selected` },
        { label: 'Website', value: form.basic?.website || '-' },
        { label: 'Description', value: form.basic?.description || '-' },
        { label: 'Tags', value: form.basic?.tags?.join(', ') || '-' }
      ]
    }
  ]

  return (
    <div className="px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertisers</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your advertisers</p>
        </div>
        <Button 
          onClick={() => router.push('/platform/ads/advertisers/new')}
          className="gap-2 bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          New Advertiser
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Select
            value={filters.propertyId || ''}
            onValueChange={(value) => setFilters(prev => ({ ...prev, propertyId: value }))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Search advertisers..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="max-w-sm"
          />

          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FeatureTable
          data={filteredItems}
          columns={columns}
          onDelete={handleDelete}
          onEdit={(id) => router.push(`/platform/ads/advertisers/${id}`)}
          propertyId={filters.propertyId || undefined}
          filters={filters}
        />
      </div>
    </div>
  )
}

export default function AdvertisersPage() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload()
      }}
    >
      <AdvertisersContent />
    </ErrorBoundary>
  )
} 