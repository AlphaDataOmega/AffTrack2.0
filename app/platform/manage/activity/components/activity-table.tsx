"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  User, Settings, Shield, AlertTriangle, FileText, 
  Globe, Database, MoreHorizontal, Eye, Copy 
} from "lucide-react"
import { format } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ActivityTableProps {
  propertyId?: string
  filters: {
    search: string
    type: string
    user: string
    dateRange?: { from: Date; to: Date }
  }
}

type ActivityLog = {
  id: string
  action: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: string
  user?: {
    name: string
    email: string
  }
}

// Replace getEventConfig with a simpler function
const getEventStyle = (action: string) => {
  // Extract type from action string if it exists
  const match = action.match(/^\[([^\]]+)\]/) || action.match(/^(\w+)/);
  const type = match ? match[1].toUpperCase() : 'EVENT';

  return {
    icon: <FileText className="w-4 h-4" />,
    colorClasses: {
      background: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200"
    },
    displayName: type
  }
}

// Add helper function to parse user agent
const simplifyUserAgent = (userAgent?: string) => {
  if (!userAgent) return ''
  // Extract browser and OS info
  const matches = userAgent.match(/(Chrome|Firefox|Safari|Edge|MSIE)\/?\s*([\d.]+)/)
  return matches ? matches[1] : 'Browser'
}

// Add this helper function to format details
const formatDetails = (details: Record<string, any>) => {
  return Object.entries(details).map(([key, value]) => {
    const formattedKey = key
      .split(/(?=[A-Z])/)
      .join(' ')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());
    
    return {
      key: formattedKey,
      value: typeof value === 'object' ? JSON.stringify(value, null, 2) : value
    };
  });
};

export function ActivityTable({ propertyId, filters }: ActivityTableProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchPending, setSearchPending] = useState(false)
  const { data: session } = useSession()
  
  // Remove sessionStorage timezone handling and use session timezone
  const timezone = session?.user?.timezone || 'UTC'

  const handleSearch = useCallback(async () => {
    setSearchPending(true)
    try {
      const params = new URLSearchParams({
        propertyId: propertyId || '',
        search: filters.search,
        type: filters.type,
        from: filters.dateRange?.from?.toISOString() || '',
        to: filters.dateRange?.to?.toISOString() || '',
        includeRelated: 'true'
      })

      const response = await fetch(`/api/manage/activity?${params}`)
      const json = await response.json()
      
      if (!response.ok) {
        throw new Error(json.error?.message || `HTTP error! status: ${response.status}`)
      }
      
      if (json.error) {
        throw new Error(json.error.message)
      }
      
      setActivities(json.data || [])
    } catch (error) {
      console.error("[ACTIVITY_TABLE]", error)
      setError(error instanceof Error ? error.message : "Failed to load activities")
    } finally {
      setSearchPending(false)
      setLoading(false)
    }
  }, [filters, propertyId])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [handleSearch])

  // Add helper to check if activity is property related
  const isPropertyActivity = (action: string) => {
    return action.startsWith('[PROPERTIES]') || 
           action.startsWith('[CAMPAIGNS]') || 
           action.startsWith('[AD_NETWORKS]') ||
           action.startsWith('[AFFILIATES]')
  }

  // Add helper to format property-related details
  const formatPropertyDetails = (details: Record<string, any>) => {
    if (!details) return []
    
    // Always show property name/id first if present
    const orderedKeys = [
      'name',
      'propertyId',
      ...Object.keys(details).filter(k => !['name', 'propertyId'].includes(k))
    ]

    return orderedKeys
      .filter(key => details[key] !== undefined)
      .map(key => ({
        key: key
          .split(/(?=[A-Z])/)
          .join(' ')
          .toLowerCase()
          .replace(/^\w/, c => c.toUpperCase()),
        value: details[key]
      }))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow className="hover:bg-gray-50">
            <TableHead className="w-[140px]">Date & Time</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => {
            const eventConfig = getEventStyle(activity.action)
            const formattedDetails = isPropertyActivity(activity.action) 
              ? formatPropertyDetails(activity.details)
              : formatDetails(activity.details)
            const displayAction = activity.action
              .replace(/^\[(.*?)\]\s*/, '')
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')

            return (
              <TableRow key={activity.id} className="hover:bg-gray-50 group">
                <TableCell className="py-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {formatInTimeZone(
                        new Date(activity.createdAt),
                        timezone,
                        'MMM dd, yyyy'
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatInTimeZone(
                        new Date(activity.createdAt),
                        timezone,
                        'h:mm a'
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      "bg-gray-50",
                      "border-gray-200"
                    )}>
                      <FileText className="w-4 h-4 text-gray-700" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        {eventConfig.displayName}
                      </span>
                      {activity.userAgent && (
                        <span className="text-xs text-gray-500">
                          {simplifyUserAgent(activity.userAgent)}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-900">
                      {displayAction}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  {activity.user?.name ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {activity.user.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activity.user.email}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">System</span>
                  )}
                </TableCell>
                <TableCell className="py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-96">
                      <DropdownMenuLabel>Event Details</DropdownMenuLabel>
                      <div className="max-h-96 overflow-y-auto p-2">
                        {formattedDetails.map((detail, i) => (
                          <div key={i} className="text-sm mb-2">
                            <div className="font-medium text-gray-700">{detail.key}</div>
                            <div className="text-gray-500 break-words">
                              {typeof detail.value === 'object' 
                                ? JSON.stringify(detail.value, null, 2)
                                : detail.value.toString()
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
} 