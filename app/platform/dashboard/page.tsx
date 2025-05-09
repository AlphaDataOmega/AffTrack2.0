"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Filter, Search } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to your AffTrack dashboard
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search..."
                className="pl-9 bg-white border-gray-200"
              />
            </div>
          </div>
          <Button variant="outline" className="gap-2 bg-white border-gray-200">
            <Calendar className="h-4 w-4" />
            Select date range
          </Button>
          <Button variant="outline" className="gap-2 bg-white border-gray-200">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-white border-gray-200">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Data</SelectItem>
              <SelectItem value="campaigns">Campaigns</SelectItem>
              <SelectItem value="affiliates">Affiliates</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="p-6 bg-white shadow-sm border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Leads</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">0</span>
              <span className="text-sm font-medium text-gray-500">leads</span>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-sm border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Conversion Rate</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">0%</span>
              <span className="text-sm font-medium text-gray-500">avg</span>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-sm border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Revenue</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">$0.00</span>
              <span className="text-sm font-medium text-gray-500">total</span>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-sm border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Active Offers</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">0</span>
              <span className="text-sm font-medium text-gray-500">offers</span>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-white shadow-sm border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h2>
          <p className="text-gray-600">No recent activity to display.</p>
        </Card>
      </div>
    </div>
  )
} 