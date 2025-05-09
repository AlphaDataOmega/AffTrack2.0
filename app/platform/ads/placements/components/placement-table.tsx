"use client"

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
import { MoreHorizontal, Eye, Layout } from "lucide-react"

interface Placement {
  id: string
  name: string
  type: "banner" | "native" | "popup" | "sticky"
  size: string
  page: string
  position: string
  status: "active" | "paused" | "draft"
  impressions: number
  clicks: number
  ctr: string
  revenue: string
}

const placements: Placement[] = [
  {
    id: "1",
    name: "Homepage Hero Banner",
    type: "banner",
    size: "728x90",
    page: "Homepage",
    position: "Header",
    status: "active",
    impressions: 125890,
    clicks: 3245,
    ctr: "2.58%",
    revenue: "$1,890.45"
  },
  {
    id: "2",
    name: "Blog Sidebar Native",
    type: "native",
    size: "300x250",
    page: "Blog Posts",
    position: "Sidebar",
    status: "active",
    impressions: 89760,
    clicks: 1876,
    ctr: "2.09%",
    revenue: "$945.20"
  },
  {
    id: "3",
    name: "Exit Intent Popup",
    type: "popup",
    size: "640x480",
    page: "Product Pages",
    position: "Overlay",
    status: "paused",
    impressions: 45670,
    clicks: 890,
    ctr: "1.95%",
    revenue: "$567.80"
  }
]

export function PlacementTable() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-600">Placement</TableHead>
            <TableHead className="font-semibold text-gray-600">Type</TableHead>
            <TableHead className="font-semibold text-gray-600">Size</TableHead>
            <TableHead className="font-semibold text-gray-600">Page</TableHead>
            <TableHead className="font-semibold text-gray-600">Position</TableHead>
            <TableHead className="font-semibold text-gray-600">Status</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Impressions</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Clicks</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">CTR</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Revenue</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {placements.map((placement) => (
            <TableRow key={placement.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="font-medium text-gray-900">{placement.name}</div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  {placement.type.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{placement.size}</TableCell>
              <TableCell className="text-gray-600">{placement.page}</TableCell>
              <TableCell className="text-gray-600">{placement.position}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    placement.status === 'active'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : placement.status === 'paused'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }
                >
                  {placement.status.charAt(0).toUpperCase() + placement.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {placement.impressions.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {placement.clicks.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {placement.ctr}
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {placement.revenue}
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
                    <DropdownMenuItem className="text-gray-700 hover:text-gray-900">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700 hover:text-gray-900">
                      <Layout className="w-4 h-4 mr-2" />
                      Edit layout
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      Pause placement
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 