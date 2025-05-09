"use client"

import { Plus, Search, SlidersHorizontal, Grid, Layout } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlacementTable } from './components/placement-table'

export default function PlacementsPage() {
  const router = useRouter()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Placements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your ad placements across different pages and sites
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push('/ads/placements/templates')} 
            variant="outline"
            className="gap-2"
          >
            <Grid className="w-4 h-4" />
            Templates
          </Button>
          <Button 
            onClick={() => router.push('/ads/placements/new')} 
            size="lg"
            className="gap-2 bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            Add Placement
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search placements..."
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
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] bg-white border-gray-200">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="banner">Banner</SelectItem>
            <SelectItem value="native">Native</SelectItem>
            <SelectItem value="popup">Popup</SelectItem>
            <SelectItem value="sticky">Sticky</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px] bg-white border-gray-200">
            <SelectValue placeholder="Page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pages</SelectItem>
            <SelectItem value="homepage">Homepage</SelectItem>
            <SelectItem value="landing">Landing Pages</SelectItem>
            <SelectItem value="blog">Blog Posts</SelectItem>
            <SelectItem value="product">Product Pages</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <PlacementTable />
    </div>
  )
} 