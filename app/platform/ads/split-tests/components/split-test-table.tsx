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
import { MoreHorizontal, BarChart2, Play, Pause, Copy } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface SplitTest {
  id: string
  name: string
  status: "active" | "paused" | "completed" | "draft"
  placement: string
  variants: number
  traffic: number
  impressions: number
  conversions: number
  revenue: string
  startDate: string
  confidence: number
  winner?: string
}

const splitTests: SplitTest[] = [
  {
    id: "1",
    name: "Homepage Hero Banner Test",
    status: "active",
    placement: "Homepage",
    variants: 3,
    traffic: 33.33,
    impressions: 15890,
    conversions: 423,
    revenue: "$2,890.45",
    startDate: "2024-01-15",
    confidence: 92
  },
  {
    id: "2",
    name: "Product Page Layout Test",
    status: "completed",
    placement: "Product Pages",
    variants: 2,
    traffic: 50,
    impressions: 25670,
    conversions: 890,
    revenue: "$4,567.80",
    startDate: "2024-01-01",
    confidence: 98,
    winner: "Variant B"
  },
  {
    id: "3",
    name: "Blog CTA Position Test",
    status: "paused",
    placement: "Blog Posts",
    variants: 4,
    traffic: 25,
    impressions: 8760,
    conversions: 156,
    revenue: "$945.20",
    startDate: "2024-01-10",
    confidence: 76
  }
]

export function SplitTestTable() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-600">Split Test</TableHead>
            <TableHead className="font-semibold text-gray-600">Status</TableHead>
            <TableHead className="font-semibold text-gray-600">Placement</TableHead>
            <TableHead className="font-semibold text-gray-600">Variants</TableHead>
            <TableHead className="font-semibold text-gray-600">Traffic Split</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Impressions</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Conversions</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Revenue</TableHead>
            <TableHead className="font-semibold text-gray-600">Confidence</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {splitTests.map((test) => (
            <TableRow key={test.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">{test.name}</div>
                  <div className="text-sm text-gray-500">Started {test.startDate}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    test.status === 'active'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : test.status === 'paused'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : test.status === 'completed'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }
                >
                  {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600">{test.placement}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  {test.variants} variants
                </Badge>
              </TableCell>
              <TableCell>
                <div className="w-24">
                  <div className="text-sm text-gray-600 mb-1">{test.traffic}% each</div>
                  <Progress value={test.traffic} className="h-1" />
                </div>
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {test.impressions.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {test.conversions.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {test.revenue}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">{test.confidence}% confidence</div>
                  {test.winner && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Winner: {test.winner}
                    </Badge>
                  )}
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
                    <DropdownMenuItem className="text-gray-700 hover:text-gray-900">
                      <BarChart2 className="w-4 h-4 mr-2" />
                      View Results
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700 hover:text-gray-900">
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {test.status === 'active' ? (
                      <DropdownMenuItem className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause Test
                      </DropdownMenuItem>
                    ) : test.status === 'paused' && (
                      <DropdownMenuItem className="text-green-600 hover:text-green-700 hover:bg-green-50">
                        <Play className="w-4 h-4 mr-2" />
                        Resume Test
                      </DropdownMenuItem>
                    )}
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