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
import { MoreHorizontal, Hammer, Edit, LineChart, Copy, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Site {
  id: string
  name: string
  type: string
  status: string
  lastModified: string
  visits: string
  conversions: string
  conversionRate: string
}

interface SiteTableProps {
  data: Site[]
}

export function SiteTable({ data }: SiteTableProps) {
  const router = useRouter()

  const handleBuild = (siteId: string) => {
    router.push('/create/sites/build')
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-600">Site</TableHead>
            <TableHead className="font-semibold text-gray-600">Type</TableHead>
            <TableHead className="font-semibold text-gray-600">Status</TableHead>
            <TableHead className="font-semibold text-gray-600">Last Modified</TableHead>
            <TableHead className="font-semibold text-gray-600">Visits</TableHead>
            <TableHead className="font-semibold text-gray-600">Conversions</TableHead>
            <TableHead className="font-semibold text-gray-600">Conv. Rate</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((site) => (
            <TableRow key={site.id} className="hover:bg-gray-50">
              <TableCell className="font-medium text-gray-900">
                {site.name}
              </TableCell>
              <TableCell className="text-gray-600">{site.type}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    site.status === 'Published'
                      ? 'border-green-100 bg-green-50 text-green-700 hover:bg-green-50'
                      : site.status === 'Draft'
                      ? 'border-yellow-100 bg-yellow-50 text-yellow-700 hover:bg-yellow-50'
                      : 'border-gray-100 bg-gray-50 text-gray-700 hover:bg-gray-50'
                  }
                >
                  {site.status}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600">{site.lastModified}</TableCell>
              <TableCell className="font-medium text-gray-900">{site.visits}</TableCell>
              <TableCell className="font-medium text-gray-900">{site.conversions}</TableCell>
              <TableCell className="font-medium text-gray-900">{site.conversionRate}</TableCell>
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
                      className="text-gray-700 hover:text-gray-900 cursor-pointer"
                      onClick={() => handleBuild(site.id)}
                    >
                      <Hammer className="w-4 h-4 mr-2" />
                      Build site
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700 hover:text-gray-900 cursor-pointer">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit site
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700 hover:text-gray-900 cursor-pointer">
                      <LineChart className="w-4 h-4 mr-2" />
                      View analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700 hover:text-gray-900 cursor-pointer">
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete site
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