"use client"

import { Plus, Search, SlidersHorizontal, BarChart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SplitTestTable } from './components/split-test-table'

export default function SplitTestsPage() {
  const router = useRouter()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Split Tests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and analyze your A/B tests and offer experiments
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push('/ads/split-tests/reports')} 
            variant="outline"
            className="gap-2"
          >
            <BarChart className="w-4 h-4" />
            Reports
          </Button>
          <Button 
            onClick={() => router.push('/ads/split-tests/new')} 
            size="lg"
            className="gap-2 bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            New Split Test
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search split tests..."
              className="pl-9 bg-white border-gray-200"
            />
          </div>
        </div>
        <Button 
          variant="outline" 
          className="gap-2 bg-white border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </Button>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] bg-white border-gray-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px] bg-white border-gray-200">
            <SelectValue placeholder="Placement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Placements</SelectItem>
            <SelectItem value="homepage">Homepage</SelectItem>
            <SelectItem value="landing">Landing Pages</SelectItem>
            <SelectItem value="blog">Blog Posts</SelectItem>
            <SelectItem value="product">Product Pages</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <SplitTestTable />
    </div>
  )
} 