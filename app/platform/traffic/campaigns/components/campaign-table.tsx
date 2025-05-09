"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit,
  MoreHorizontal,
  Pause,
  Play,
  Archive,
  Link
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorBoundary } from 'react-error-boundary'
import { formatDistanceToNow } from 'date-fns'
import { CampaignStatus, CampaignType } from '../types'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

type Campaign = {
  id: string
  name: string
  status: CampaignStatus
  type: string
  sourceType: string
  campaignType: CampaignType
  daily: number | null
  total: number | null
  dailyUnlimited: boolean
  totalUnlimited: boolean
  createdAt: string
  updatedAt: string
  _count: {
    properties: number
  }
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <Card className="p-6 text-center">
      <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Campaigns</h3>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try Again</Button>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="border rounded-lg">
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-6 w-[100px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const statusColors = {
  [CampaignStatus.ACTIVE]: 'bg-green-50 text-green-700 border-green-100',
  [CampaignStatus.PAUSED]: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  [CampaignStatus.ARCHIVED]: 'bg-red-50 text-red-700 border-red-100',
  [CampaignStatus.DRAFT]: 'bg-gray-50 text-gray-700 border-gray-100'
}

const getStatusBadge = (status: CampaignStatus) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="outline" className={statusColors[status] || statusColors[CampaignStatus.DRAFT]}>
          {status}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Status: {status}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

interface Filters {
  propertyId: string | null
  search: string
  type: string
  status: string
}

interface CampaignTableProps {
  propertyId: string
  filters: Filters
  initialData?: Campaign[]
}

export function CampaignTable({ 
  propertyId,
  filters,
  initialData 
}: CampaignTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialData || [])
  const [isLoading, setIsLoading] = useState(!initialData)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  const fetchCampaigns = async (page: number) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        propertyId,
        limit: String(itemsPerPage),
        offset: String((page - 1) * itemsPerPage)
      })
      
      if (filters.search) params.append('search', filters.search)
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.status !== 'all') params.append('status', filters.status)
      
      const response = await fetch(`/api/traffic/campaigns?${params}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to fetch campaigns')
      }
      
      const { data, meta } = await response.json()
      setCampaigns(data)
      setTotalItems(meta.total)
      
    } catch (error) {
      console.error('[CAMPAIGNS_FETCH_ERROR]', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load campaigns",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
    fetchCampaigns(1)
  }, [filters])

  const handleStatusChange = async (id: string, newStatus: CampaignStatus) => {
    try {
      // First fetch the current campaign data
      const response = await fetch(`/api/traffic/campaigns?id=${id}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to fetch campaign')
      }
      
      const { data: campaign } = await response.json()
      
      // Update with new status
      const updateResponse = await fetch('/api/traffic/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...campaign,
          status: newStatus
        })
      })

      if (!updateResponse.ok) {
        const error = await updateResponse.json()
        throw new Error(error.error?.message || 'Failed to update campaign')
      }

      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === id ? { ...campaign, status: newStatus } : campaign
        )
      )

      toast({
        title: "Success",
        description: "Campaign status updated successfully"
      })

    } catch (error) {
      console.error('[CAMPAIGN_STATUS_ERROR]', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/traffic/campaigns?id=${id}&propertyId=${propertyId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to delete campaign')
      }

      setCampaigns(prev => prev.filter(campaign => campaign.id !== id))
      toast({
        title: "Success",
        description: "Campaign deleted successfully"
      })

    } catch (error) {
      console.error('[CAMPAIGN_DELETE_ERROR]', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete campaign",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Text copied to clipboard"
      })
    } catch (error) {
      console.error('[CLIPBOARD_ERROR]', error)
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const getTrackingUrl = (campaignId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    return `${baseUrl}/track/v/${campaignId}`
  }

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-4">
      {campaigns.length === 0 ? (
        <div className="text-center py-6">
          <h3 className="text-lg font-semibold mb-2">No Campaigns Found</h3>
          <p className="text-gray-600 mb-4">
            {filters.search || filters.type !== 'all' || filters.status !== 'all'
              ? "No campaigns match your filter criteria"
              : "Get started by creating your first campaign"}
          </p>
          <Button
            onClick={() => router.push('/platform/traffic/campaigns/new')}
            className="gap-2 bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Type</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Budget</TableHead>
                  <TableHead className="font-semibold text-gray-700">Last Updated</TableHead>
                  <TableHead className="w-[100px] font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign, index) => (
                  <TableRow 
                    key={campaign.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {campaign.campaignType.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(campaign.status)}
                    </TableCell>
                    <TableCell>
                      {campaign.dailyUnlimited ? (
                        "Unlimited"
                      ) : (
                        `$${campaign.daily?.toFixed(2)}/day`
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(campaign.updatedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => copyToClipboard(campaign.id)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy ID
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => copyToClipboard(getTrackingUrl(campaign.id))}
                          >
                            <Link className="mr-2 h-4 w-4" />
                            Copy Tracking Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/platform/traffic/campaigns/${campaign.id}`)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {campaign.status !== CampaignStatus.ARCHIVED && (
                            <>
                              {campaign.status === CampaignStatus.ACTIVE ? (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(campaign.id, CampaignStatus.PAUSED)}
                                >
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(campaign.id, CampaignStatus.ACTIVE)}
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(campaign.id, CampaignStatus.ARCHIVED)}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-600">
              Showing {Math.min(itemsPerPage, campaigns.length)} of {totalItems} results
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(prev => prev - 1)
                  fetchCampaigns(currentPage - 1)
                }}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(prev => prev + 1)
                  fetchCampaigns(currentPage + 1)
                }}
                disabled={campaigns.length < itemsPerPage}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 