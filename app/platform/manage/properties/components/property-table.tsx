"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PropertyStatus } from '@prisma/client'
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
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit,
  MoreHorizontal,
  Globe,
  Database,
  Shield,
  Plus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorBoundary } from 'react-error-boundary'
import { formatDistanceToNow } from 'date-fns'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

type Property = {
  id: string
  name: string
  domain: string
  status: PropertyStatus
  campaigns: number
  users: number
  updatedAt: string
}

type StatusColorType = {
  [key in PropertyStatus]: string
}

const statusColors: StatusColorType = {
  'ACTIVE': 'bg-green-50 text-green-700 border-green-100',
  'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'INACTIVE': 'bg-red-50 text-red-700 border-red-100'
}

const getStatusBadge = (status: PropertyStatus) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="outline" className={statusColors[status]}>
          {status}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Status: {status}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

interface PropertyTableProps {
  data: Property[]
  onDelete?: (propertyId: string) => void
  itemsPerPage?: number
}

export function PropertyTable({ data, onDelete, itemsPerPage = 10 }: PropertyTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Property ID copied to clipboard"
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

  if (data.length === 0) {
    return (
      <div className="text-center py-6">
        <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
        <p className="text-gray-600 mb-4">
          Get started by creating your first property
        </p>
        <Button
          onClick={() => router.push('/platform/manage/properties/new')}
          className="gap-2 bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Create Property
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Property</TableHead>
              <TableHead className="font-semibold text-gray-700">Domain</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Campaigns</TableHead>
              <TableHead className="font-semibold text-gray-700">Users</TableHead>
              <TableHead className="font-semibold text-gray-700">Last Updated</TableHead>
              <TableHead className="w-[100px] font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((property, index) => (
              <TableRow 
                key={property.id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <TableCell className="font-medium">{property.name}</TableCell>
                <TableCell className="text-gray-600">{property.domain}</TableCell>
                <TableCell>
                  {getStatusBadge(property.status)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    {property.campaigns} {property.campaigns === 1 ? 'campaign' : 'campaigns'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    {property.users} {property.users === 1 ? 'user' : 'users'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(property.updatedAt), { addSuffix: true })}
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
                        onClick={() => copyToClipboard(property.id)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/platform/manage/properties/${property.id}`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
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
          Showing {Math.min(itemsPerPage, currentData.length)} of {data.length} results
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentPage(prev => prev - 1)
              handlePageChange(currentPage - 1)
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
              handlePageChange(currentPage + 1)
            }}
            disabled={currentData.length < itemsPerPage}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
} 