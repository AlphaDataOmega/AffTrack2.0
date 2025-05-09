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
import { CampaignTable } from './components/campaign-table'
import { useToast } from "@/hooks/use-toast"
import { CampaignActivityTypes, CampaignType, CampaignStatus } from './types'

interface Property {
  id: string
  name: string
  domain: string
}

interface Filters {
  propertyId: string | null
  search: string
  type: string
  status: string
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
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

function CampaignsContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    propertyId: null,
    search: '',
    type: 'all',
    status: 'all'
  })

  const logError = async (error: unknown, context: string) => {
    console.error(`[${context}]`, error)
    await fetch('/api/manage/activity', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: CampaignActivityTypes.ERROR,
        details: {
          component: 'CampaignsPage',
          context,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      })
    })
  }

  const fetchProperties = async () => {
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
      await logError(error, 'FETCH_PROPERTIES')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load properties",
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

  if (isLoading) return <LoadingSkeleton />

  if (properties.length === 0) {
    return (
      <div className="px-4 py-8">
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
          <p className="text-gray-600 mb-4">
            You need to create a property before you can manage campaigns
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

  return (
    <div className="px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your traffic campaigns
          </p>
        </div>
        <Button 
          onClick={() => router.push('/platform/traffic/campaigns/new')}
          className="gap-2 bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          New Campaign
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
                placeholder="Search campaigns..."
                className="pl-9"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>

          <Select 
            value={filters.type}
            onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={CampaignType.CPC}>CPC</SelectItem>
              <SelectItem value={CampaignType.CPA}>CPA</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={CampaignStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={CampaignStatus.PAUSED}>Paused</SelectItem>
              <SelectItem value={CampaignStatus.ARCHIVED}>Archived</SelectItem>
              <SelectItem value={CampaignStatus.DRAFT}>Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filters.propertyId && (
          <CampaignTable 
            propertyId={filters.propertyId}
            filters={filters}
          />
        )}
      </div>
    </div>
  )
}

export default function CampaignsPage() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        fetch('/api/activity/error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            path: window.location.pathname
          })
        })
      }}
      onReset={() => {
        window.location.reload()
      }}
    >
      <CampaignsContent />
    </ErrorBoundary>
  )
} 