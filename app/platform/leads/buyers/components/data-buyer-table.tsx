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
import { MoreHorizontal, FileText, Settings, Ban } from "lucide-react"

// Mock data - replace with real data from your API
const buyers = [
  {
    id: "1",
    name: "Acme Insurance",
    company: "Acme Corp",
    status: "active",
    vertical: "Insurance",
    email: "buyer@acme.com",
    leads: {
      received: 1250,
      accepted: 1100,
      rejected: 150,
      pending: 0
    },
    spend: "$12,500.00",
    avgCpl: "$10.00",
    acceptRate: "88%",
    lastActive: "2 hours ago",
    tags: ["High Volume", "Auto Insurance", "Home Insurance"]
  },
  {
    id: "2",
    name: "EduTech Solutions",
    company: "EduTech Inc",
    status: "paused",
    vertical: "Education",
    email: "leads@edutech.com",
    leads: {
      received: 800,
      accepted: 720,
      rejected: 80,
      pending: 0
    },
    spend: "$9,600.00",
    avgCpl: "$12.00",
    acceptRate: "90%",
    lastActive: "1 day ago",
    tags: ["Higher Ed", "Online Learning"]
  },
  {
    id: "3",
    name: "SolarPro Direct",
    company: "SolarPro LLC",
    status: "pending",
    vertical: "Solar",
    email: "buyer@solarpro.com",
    leads: {
      received: 450,
      accepted: 380,
      rejected: 50,
      pending: 20
    },
    spend: "$5,700.00",
    avgCpl: "$15.00",
    acceptRate: "84%",
    lastActive: "5 minutes ago",
    tags: ["Residential", "New Buyer"]
  }
]

export function DataBuyerTable() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-600">Buyer</TableHead>
            <TableHead className="font-semibold text-gray-600">Status</TableHead>
            <TableHead className="font-semibold text-gray-600">Vertical</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Leads Received</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Accept Rate</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Avg. CPL</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Total Spend</TableHead>
            <TableHead className="font-semibold text-gray-600">Last Active</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buyers.map((buyer) => (
            <TableRow key={buyer.id} className="hover:bg-gray-50">
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">{buyer.name}</div>
                  <div className="text-sm text-gray-500">{buyer.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    buyer.status === 'active'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : buyer.status === 'paused'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }
                >
                  {buyer.status.charAt(0).toUpperCase() + buyer.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    {buyer.vertical}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="font-medium text-gray-900">
                  {buyer.leads.received.toLocaleString()}
                </div>
                {buyer.leads.pending > 0 && (
                  <div className="text-sm text-yellow-600">
                    {buyer.leads.pending} pending
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {buyer.acceptRate}
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {buyer.avgCpl}
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {buyer.spend}
              </TableCell>
              <TableCell className="text-gray-500">
                {buyer.lastActive}
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
                      <FileText className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700 hover:text-gray-900">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Ban className="w-4 h-4 mr-2" />
                      Suspend Buyer
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