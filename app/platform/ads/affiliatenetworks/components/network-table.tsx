"use client"

import { useState } from 'react'
import { MoreHorizontal, AlertTriangle, Plus, Copy, Edit, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from 'date-fns'
import { NetworkStatus, type AffiliateNetwork } from "../types"

const statusColors: Record<NetworkStatus, string> = {
  'ACTIVE': 'bg-green-50 text-green-700 border-green-100',
  'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'INACTIVE': 'bg-red-50 text-red-700 border-red-100'
}

const getStatusBadge = (status: NetworkStatus) => (
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

type NetworkTableProps = {
  networks: AffiliateNetwork[]
  onDelete: (id: string) => Promise<void>
  itemsPerPage?: number
}

export function NetworkTable({ networks, onDelete, itemsPerPage = 10 }: NetworkTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)

  // Calculate pagination
  const totalPages = Math.ceil(networks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = networks.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Network ID copied to clipboard"
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

  if (networks.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="mb-4 text-gray-400">
          <AlertTriangle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Networks Found</h3>
        <p className="text-gray-600 mb-4">
          Start by creating your first Affiliate Network
        </p>
        <Button
          onClick={() => router.push("/platform/ads/affiliatenetworks/new")}
          className="gap-2 bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add Network
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
              <TableHead className="font-semibold text-gray-700">Name</TableHead>
              <TableHead className="font-semibold text-gray-700">Account</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Created</TableHead>
              <TableHead className="font-semibold text-gray-700">Updated</TableHead>
              <TableHead className="w-[100px] font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((network, index) => (
              <TableRow 
                key={network.id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <TableCell className="font-medium">{network.name}</TableCell>
                <TableCell className="text-gray-600">{network.accountName}</TableCell>
                <TableCell>{getStatusBadge(network.status)}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(network.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(network.updatedAt), { addSuffix: true })}
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
                        onClick={() => copyToClipboard(network.id)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/platform/ads/affiliatenetworks/${network.id}`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(network.id)}
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
      </div>

      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-gray-600">
          Showing {Math.min(itemsPerPage, currentData.length)} of {networks.length} results
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