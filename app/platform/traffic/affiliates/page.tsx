"use client"

import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AffiliateTable } from './components/affiliate-table'
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { ErrorBoundary } from 'react-error-boundary'
import { AffiliateStatus, type Affiliate, type AffiliateFilters, type Property } from './types'

// Standard error fallback
function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="p-6 text-center">
      <h3 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  )
}

// Loading skeleton following standards
function LoadingSkeleton() {
  return (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      <p className="mt-2 text-sm text-gray-600">Loading affiliates...</p>
    </div>
  )
}

// Empty state following standards
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="p-12 text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Affiliates
      </h3>
      <p className="text-gray-600 mb-4 max-w-sm mx-auto">
        Create your first affiliate to start managing your partnerships.
      </p>
      <Button 
        onClick={onCreate}
        className="bg-blue-500 hover:bg-blue-600"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create First Affiliate
      </Button>
    </div>
  )
}

function AffiliatesContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState<AffiliateFilters>({
    propertyId: undefined,
    search: '',
    status: undefined,
    page: 1,
    limit: 10
  })

  // Standard fetch utilities
  const logError = async (error: unknown, context: string) => {
    console.error(`[${context}]`, error)
    await fetch('/api/manage/activity', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: '[UI_ERROR] AFFILIATES_PAGE',
        details: {
          component: 'AffiliatesPage',
          context,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      })
    })
  }

  const fetchProperties = async () => {
    try {
      const response = await fetch(`/api/manage/properties`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to fetch properties')
      }
      
      const { data } = await response.json()
      setProperties(data || [])
    } catch (error) {
      await logError(error, 'FETCH_PROPERTIES')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load properties",
        variant: "destructive"
      })
    }
  }

  const fetchAffiliates = async () => {
    try {
      setLoading(true)
      setError(undefined)
      
      const queryParams = new URLSearchParams()
      if (filters.propertyId) queryParams.append('propertyId', filters.propertyId)
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.page) queryParams.append('page', filters.page.toString())
      if (filters.limit) queryParams.append('limit', filters.limit.toString())
      
      const response = await fetch(`/api/traffic/affiliates?${queryParams}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to fetch affiliates')
      }
      
      const { data, total } = await response.json()
      setAffiliates(data || [])
      setTotalCount(total || 0)
    } catch (error) {
      await logError(error, 'FETCH_AFFILIATES')
      setError(error instanceof Error ? error.message : "Failed to load affiliates")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load affiliates",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchProperties()
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (session?.user?.id) {
      fetchAffiliates()
    }
  }, [
    filters.propertyId,
    filters.search,
    filters.status,
    filters.page,
    filters.limit,
    session?.user?.id
  ])

  const handlePropertyChange = (value: string | undefined) => {
    setFilters(prev => ({ 
      ...prev, 
      propertyId: value,
      page: 1 // Reset to first page on filter change
    }))
  }

  const handleStatusChange = (value: AffiliateStatus | undefined) => {
    setFilters(prev => ({ 
      ...prev, 
      status: value,
      page: 1 // Reset to first page on filter change
    }))
  }

  const handleFilterChange = (newFilters: AffiliateFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }

  const handleCreate = () => router.push('/platform/traffic/affiliates/new')

  return (
    <div className="px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your affiliate partnerships and tracking
          </p>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Affiliate
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <Select 
          value={filters.propertyId}
          onValueChange={handlePropertyChange}
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
              placeholder="Search affiliates..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            />
          </div>
        </div>
        
        <Select 
          value={filters.status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.values(AffiliateStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        {loading ? (
          <LoadingSkeleton />
        ) : affiliates.length === 0 && !filters.search && !filters.propertyId && !filters.status ? (
          <EmptyState onCreate={handleCreate} />
        ) : (
          <AffiliateTable 
            affiliates={affiliates}
            filters={filters}
            totalCount={totalCount}
            isLoading={loading}
            error={error}
            onRefresh={fetchAffiliates}
            onFilterChange={handleFilterChange}
            itemsPerPage={filters.limit}
          />
        )}
      </Card>
    </div>
  )
}

export default function AffiliatesPage() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload()
      }}
    >
      <AffiliatesContent />
    </ErrorBoundary>
  )
} 