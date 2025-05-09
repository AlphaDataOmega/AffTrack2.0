"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SiteTable } from "./components/site-table"

const sitesData = [
  {
    id: '1',
    name: 'Insurance Landing Page',
    type: 'Landing Page',
    status: 'Published',
    lastModified: 'Mar 6, 2024',
    visits: '1,234',
    conversions: '123',
    conversionRate: '10%',
  },
  {
    id: '2',
    name: 'Credit Card Comparison',
    type: 'Comparison',
    status: 'Draft',
    lastModified: 'Mar 5, 2024',
    visits: '2,345',
    conversions: '198',
    conversionRate: '8.4%',
  },
  {
    id: '3',
    name: 'Mortgage Calculator',
    type: 'Tool',
    status: 'Published',
    lastModified: 'Mar 4, 2024',
    visits: '3,456',
    conversions: '276',
    conversionRate: '8%',
  },
]

export default function SitesPage() {
  const router = useRouter()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your landing pages and websites
          </p>
        </div>
        <Button 
          onClick={() => router.push('/create/sites/new')} 
          size="lg"
          className="gap-2 bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          New Site
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sites..."
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
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] bg-white border-gray-200">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="landing">Landing Page</SelectItem>
            <SelectItem value="comparison">Comparison</SelectItem>
            <SelectItem value="tool">Tool</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <SiteTable data={sitesData} />
    </div>
  )
}