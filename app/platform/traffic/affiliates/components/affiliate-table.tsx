"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { MoreHorizontal, Eye, Copy, AlertTriangle, Zap, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorBoundary } from 'react-error-boundary'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { type Affiliate, type AffiliateTableProps, AffiliateStatus } from '../types'

// Error fallback following standards
function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  const { toast } = useToast()

  // Report error to activity log
  React.useEffect(() => {
    fetch('/api/manage/activity', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: '[UI_ERROR] AFFILIATE_TABLE_CRASH',
        details: {
          component: 'AffiliateTable',
          message: error.message,
          stack: error.stack
        }
      })
    })
  }, [error])

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-3 text-red-800">
        <AlertTriangle className="h-5 w-5" />
        <h3 className="text-sm font-medium">Error Loading Affiliates</h3>
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

// Pagination button component
const PaginationButton = ({ onClick, disabled, children }: { 
  onClick: () => void
  disabled: boolean
  children: React.ReactNode 
}) => (
  <Button 
    variant="outline" 
    size="sm" 
    onClick={onClick} 
    disabled={disabled}
    className="h-8"
  >
    {children}
  </Button>
)

export function AffiliateTable({ 
  affiliates, 
  filters,
  totalCount,
  isLoading,
  error,
  onRefresh,
  onFilterChange,
  itemsPerPage = 10 
}: AffiliateTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    onFilterChange({
      ...filters,
      page
    })
  }

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      toast({
        title: "Copied!",
        description: "Affiliate ID copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy ID",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (affiliate: Affiliate) => {
    try {
      const response = await fetch(`/api/traffic/affiliates?id=${affiliate.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to delete affiliate')
      }
      
      toast({
        title: "Success",
        description: "Affiliate deleted successfully",
      })

      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      console.error('[AFFILIATE_DELETE]', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete affiliate",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: AffiliateStatus) => {
    const variants = {
      [AffiliateStatus.ACTIVE]: "bg-green-50 text-green-700 border-green-100",
      [AffiliateStatus.PENDING]: "bg-yellow-50 text-yellow-700 border-yellow-100",
      [AffiliateStatus.PAUSED]: "bg-orange-50 text-orange-700 border-orange-100",
      [AffiliateStatus.BLOCKED]: "bg-red-50 text-red-700 border-red-100"
    }
    return variants[status] || "bg-gray-50 text-gray-700 border-gray-100"
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading affiliates...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-3 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-sm font-medium">Error</h3>
        </div>
        <div className="mt-2 text-sm text-red-700">{error}</div>
      </div>
    )
  }

  if (affiliates.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4 text-gray-400">
          <Zap className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No affiliates found
        </h3>
        <p className="text-gray-500 mb-4">
          Get started by adding your first affiliate
        </p>
        <Button
          onClick={() => router.push('/platform/traffic/affiliates/new')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add First Affiliate
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-600">Name</TableHead>
              <TableHead className="font-semibold text-gray-600">Email</TableHead>
              <TableHead className="font-semibold text-gray-600">Status</TableHead>
              <TableHead className="font-semibold text-gray-600">Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {affiliates.map((affiliate) => (
              <TableRow key={affiliate.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="font-medium text-gray-900">{affiliate.name}</div>
                  <div className="text-sm text-gray-500">{affiliate.company}</div>
                </TableCell>
                <TableCell className="text-gray-600">{affiliate.email}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className={getStatusBadge(affiliate.status)}>
                          {affiliate.status}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Affiliate status: {affiliate.status}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">
                    {new Date(affiliate.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(affiliate.createdAt).toLocaleTimeString()}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuLabel className="text-gray-700">Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-gray-700 hover:text-gray-900"
                        onClick={(e) => {
                          e.preventDefault()
                          handleCopyId(affiliate.id)
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-gray-700 hover:text-gray-900"
                        onClick={(e) => {
                          e.preventDefault()
                          router.push(`/platform/traffic/affiliates/${affiliate.id}`)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.preventDefault()
                          handleDelete(affiliate)
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalCount > itemsPerPage && (
          <div className="py-4 border-t border-gray-200">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationButton
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </PaginationButton>
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationButton
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </PaginationButton>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </ErrorBoundary>
    </div>
  )
} 