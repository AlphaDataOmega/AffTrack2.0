"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { ActivityTable } from "./components/activity-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export default function ActivityPage() {
  const { data: session } = useSession()
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    dateRange: undefined as { from: Date; to: Date } | undefined
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track all system events and user actions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search activity..."
              className="pl-9 bg-white border-gray-200"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <DatePickerWithRange 
            date={filters.dateRange}
            onDateChange={(range) => setFilters(prev => ({ 
              ...prev, 
              dateRange: range 
            }))}
          />

          <Select 
            value={filters.type}
            onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger className="w-[160px] bg-white border-gray-200">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="USER">User Actions</SelectItem>
              <SelectItem value="SYSTEM">System Events</SelectItem>
              <SelectItem value="SECURITY">Security</SelectItem>
              <SelectItem value="ERROR">Errors</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <ActivityTable 
        propertyId={session?.user?.propertyId || null}
        filters={filters}
      />
    </div>
  )
} 