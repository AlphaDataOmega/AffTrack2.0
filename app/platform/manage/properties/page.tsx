"use client"

import { useEffect, useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { type Property, type ApiResponse, statusConfig } from "./config"
import { PropertyTable } from "./components/property-table"

// Empty state following standards
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="p-12 text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Properties Found
      </h3>
      <p className="text-gray-600 mb-4 max-w-sm mx-auto">
        Create your first property to start tracking your campaigns and traffic.
      </p>
      <Button 
        onClick={onCreate}
        className="bg-blue-500 hover:bg-blue-600"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create First Property
      </Button>
    </div>
  )
}

function LoadingText() {
  return (
    <Card className="w-full">
      <div className="p-6 space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </Card>
  )
}

interface Filters {
  status: string
  search: string
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    search: ''
  })
  const { toast } = useToast()

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/manage/properties")
      const data: ApiResponse<Property[]> = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch properties")
      }

      setProperties(data.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load properties",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const filteredProperties = properties.filter((property) =>
    (filters.search === '' || 
      property.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      property.domain.toLowerCase().includes(filters.search.toLowerCase())
    ) &&
    (filters.status === 'all' || property.status === filters.status)
  ).map(property => ({
    id: property.id,
    name: property.name,
    domain: property.domain,
    status: property.status,
    campaigns: property._count?.campaigns || 0,
    users: property._count?.users || 0,
    updatedAt: property.updatedAt
  }))

  const handleCreate = () => {
    window.location.href = '/platform/manage/properties/new'
  }

  return (
    <div className="px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your tracking properties and their settings
          </p>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Property
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <Select 
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search properties..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div>
        {isLoading ? (
          <LoadingText />
        ) : filteredProperties.length === 0 ? (
          <Card>
            <EmptyState onCreate={handleCreate} />
          </Card>
        ) : (
          <PropertyTable 
            data={filteredProperties}
            itemsPerPage={10}
          />
        )}
      </div>
    </div>
  )
} 
