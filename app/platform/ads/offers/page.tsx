"use client"

import { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ErrorBoundary } from 'react-error-boundary'
import { useToast } from "@/hooks/use-toast"
import { logError, ActivityContext } from "@/lib/activity"
import { FeatureTable } from "./components/feature-table"
import { BaseFormData, STATUS_OPTIONS } from "./types"

interface Property {
  id: string
  name: string
  domain: string
}

interface Filters {
  propertyId: string | null
  search: string
  status: string
}

interface FeaturePageProps {
  featureType: keyof typeof ActivityContext
  apiEndpoint: string
  labels: {
    title: string
    description: string
    new: string
    empty: string
  }
  columns: any[] // Will be extended by specific features
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <Card className="p-6 text-center">
      <h3 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

function FeatureContent({
  featureType,
  apiEndpoint,
  labels,
  columns
}: FeaturePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [properties, setProperties] = useState<Property[]>([])
  const [items, setItems] = useState<BaseFormData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    propertyId: null,
    search: '',
    status: 'all'
  })

  const fetchProperties = async (retryCount = 0) => {
    try {
      const response = await fetch('/api/manage/properties')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to fetch properties')
      }
      
      const { data } = await response.json()
      setProperties(data || [])
      if (data?.length > 0) {
        setFilters(prev => ({ ...prev, propertyId: data[0].id }))
      }
    } catch (error) {
      // Retry logic for network errors
      if (retryCount < 3 && error instanceof Error && error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
        return fetchProperties(retryCount + 1)
      }

      await logError('PROPERTY', error, {
        component: 'FeaturePage',
        retryCount
      })
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load properties",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchItems = async (retryCount = 0) => {
    try {
      setIsLoading(true)
      const response = await fetch(apiEndpoint)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch items')
      }

      const { data } = await response.json()
      setItems(data || [])
    } catch (error) {
      // Retry logic for network errors
      if (retryCount < 3 && error instanceof Error && error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
        return fetchItems(retryCount + 1)
      }

      await logError(featureType, error, {
        component: 'FeaturePage',
        retryCount
      })
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load items",
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
    if (filters.propertyId) {
      fetchItems()
    }
  }, [filters.propertyId])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${apiEndpoint}?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      await fetchItems()
      toast({
        title: "Success",
        description: "Item deleted successfully"
      })
    } catch (error) {
      await logError(featureType, error, {
        component: 'FeaturePage',
        itemId: id
      })
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      })
    }
  }

  if (properties.length === 0 && !isLoading) {
    return (
      <div className="px-4 py-8">
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
          <p className="text-gray-600 mb-4">
            You need to create a property before you can manage {labels.title.toLowerCase()}
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

  const filteredItems = items.filter(item => {
    if (filters.status !== 'all' && item.status !== filters.status) return false
    if (filters.search && !item.name?.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  return (
    <div className="px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{labels.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {labels.description}
          </p>
        </div>
        <Button 
          onClick={() => router.push(`${apiEndpoint}/new`)}
          className="gap-2 bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          {labels.new}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Select 
            value={filters.propertyId || undefined}
            onValueChange={(value) => setFilters(prev => ({ ...prev, propertyId: value }))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                className="pl-9"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>

          <Select 
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="w-[140px]">
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

        {filters.propertyId && (
          <FeatureTable 
            data={filteredItems}
            columns={columns}
            isLoading={isLoading}
            onDelete={handleDelete}
            onEdit={(id) => router.push(`${apiEndpoint}/${id}`)}
            propertyId={filters.propertyId}
            filters={filters}
          />
        )}
      </div>
    </div>
  )
}

export function FeaturePage(props: FeaturePageProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        logError(props.featureType, error, {
          component: 'ErrorBoundary',
          componentStack: errorInfo.componentStack,
          path: window.location.pathname
        })
      }}
      onReset={() => {
        window.location.reload()
      }}
    >
      <FeatureContent {...props} />
    </ErrorBoundary>
  )
} 