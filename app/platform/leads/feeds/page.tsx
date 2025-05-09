"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Download } from "lucide-react"
import { FeedTable } from "./components/feed-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function FeedsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Feeds</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your data feed sources and integrations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Link href="/leads/feeds/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Feed
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search feeds..."
              className="pl-9 bg-white border-gray-200"
            />
          </div>
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] bg-white border-gray-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] bg-white border-gray-200">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="csv">CSV Import</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] bg-white border-gray-200">
            <SelectValue placeholder="Vertical" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Verticals</SelectItem>
            <SelectItem value="insurance">Insurance</SelectItem>
            <SelectItem value="mortgage">Mortgage</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="solar">Solar</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="7d">
          <SelectTrigger className="w-[140px] bg-white border-gray-200">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <FeedTable />
    </div>
  )
} 