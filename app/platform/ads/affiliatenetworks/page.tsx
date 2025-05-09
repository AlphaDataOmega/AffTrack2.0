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
import { NetworkTable } from './components/network-table'
import { useToast } from "@/hooks/use-toast"
import { NetworkStatus, NETWORK_STATUS_OPTIONS, type AffiliateNetwork } from './types'
import { logActivity, logError, logClientError, ActivityContext, ActivityOperation } from "@/lib/activity"

interface Property {
  id: string
  name: string
  domain: string
}

interface Filters {
  propertyId: string | null
  search: string
  status: NetworkStatus | 'all'
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
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

function NetworksContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [networks, setNetworks] = useState<AffiliateNetwork[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    propertyId: null,
    search: '',
    status: 'all'
  })

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
      await logError('PROPERTY', error, {
        component: 'NetworksPage'
      })
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load properties",
        variant: "destructive"
      })
    }
  }

  const fetchNetworks = async (retryCount = 0) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/ads/affiliatenetworks')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch networks')
      }

      const { data } = await response.json()
      setNetworks(data)
    } catch (error) {
      // Retry logic for network errors
      if (retryCount < 3 && error instanceof Error && error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
        return fetchNetworks(retryCount + 1)
      }

      await logError('NETWORK', error, {
        component: 'NetworksPage',
        retryCount
      })
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load networks",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchProperties()
      fetchNetworks()
    }
  }, [session?.user?.id])

  const filteredNetworks = networks.filter(network => {
    const matchesSearch = 
      network.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      network.accountName.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesStatus = 
      filters.status === 'all' || 
      network.status === filters.status

    return matchesSearch && matchesStatus
  })

  if (isLoading) return <LoadingSkeleton />

  if (properties.length === 0) {
    return (
      <div className="px-4 py-8">
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
          <p className="text-gray-600 mb-4">
            You need to create a property before you can manage networks
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
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Networks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your affiliate network integrations and tracking settings
          </p>
        </div>
        <Button 
          onClick={() => router.push('/platform/ads/affiliatenetworks/new')}
          className="gap-2 bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add Network
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
                placeholder="Search networks..."
                className="pl-9"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>

          <Select 
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as NetworkStatus | 'all' }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {NETWORK_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <NetworkTable 
          networks={filteredNetworks}
          onDelete={async (networkId) => {
            try {
              const response = await fetch(`/api/ads/affiliatenetworks?id=${networkId}`, {
                method: 'DELETE'
              })
              
              if (!response.ok) {
                throw new Error('Failed to delete network')
              }

              await logActivity(`${ActivityContext.NETWORK} ${ActivityOperation.DELETE}`, { 
                networkId,
                component: 'NetworksPage'
              })
              await fetchNetworks()
              
              toast({
                title: "Success",
                description: "Network deleted successfully"
              })
            } catch (error) {
              await logError('NETWORK', error, {
                component: 'NetworksPage',
                networkId
              })
              toast({
                title: "Error",
                description: "Failed to delete network",
                variant: "destructive"
              })
            }
          }}
        />
      </div>
    </div>
  )
}

export default function NetworksPage() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        logClientError(error, errorInfo.componentStack, window.location.pathname)
      }}
      onReset={() => {
        window.location.reload()
      }}
    >
      <NetworksContent />
    </ErrorBoundary>
  )
} 