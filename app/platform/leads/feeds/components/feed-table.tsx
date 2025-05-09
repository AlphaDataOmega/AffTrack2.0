"use client"

import * as React from "react"
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
import { MoreHorizontal, Pause, Play } from "lucide-react"

// Sample data - replace with actual data fetching
const feeds = [
  {
    id: "1",
    name: "Insurance Leads API",
    source: "LeadPoint",
    type: "API",
    status: "active",
    vertical: "insurance",
    volume: "2.5k/day",
    lastSync: "2 mins ago",
    cost: "$4.50",
    tags: ["auto", "health", "life"]
  },
  {
    id: "2",
    name: "Mortgage CSV Import",
    source: "LendingTree",
    type: "CSV",
    status: "paused",
    vertical: "mortgage",
    volume: "500/day",
    lastSync: "1 hour ago",
    cost: "$12.00",
    tags: ["purchase", "refinance"]
  },
  // Add more sample feeds...
]

export function FeedTable() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-600">Feed</TableHead>
            <TableHead className="font-semibold text-gray-600">Source</TableHead>
            <TableHead className="font-semibold text-gray-600">Type</TableHead>
            <TableHead className="font-semibold text-gray-600">Status</TableHead>
            <TableHead className="font-semibold text-gray-600">Tags</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Volume</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Cost/Lead</TableHead>
            <TableHead className="font-semibold text-gray-600">Last Sync</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feeds.map((feed) => (
            <TableRow key={feed.id} className="hover:bg-gray-50">
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">{feed.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{feed.vertical}</div>
                </div>
              </TableCell>
              <TableCell className="font-medium">{feed.source}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  {feed.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    feed.status === 'active'
                      ? 'border-green-100 bg-green-50 text-green-700'
                      : 'border-yellow-100 bg-yellow-50 text-yellow-700'
                  }
                >
                  {feed.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {feed.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="bg-gray-100 text-gray-600 text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">{feed.volume}</TableCell>
              <TableCell className="text-right font-medium text-gray-900">{feed.cost}</TableCell>
              <TableCell className="text-gray-500">{feed.lastSync}</TableCell>
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
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700 hover:text-gray-900">
                      Edit feed
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700 hover:text-gray-900">
                      View logs
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {feed.status === 'active' ? (
                      <DropdownMenuItem className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause feed
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="text-green-600 hover:text-green-700 hover:bg-green-50">
                        <Play className="w-4 h-4 mr-2" />
                        Resume feed
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