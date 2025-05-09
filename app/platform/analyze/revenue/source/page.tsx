"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, Filter, Search } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { date: 'Mar 1', facebook: 2500, google: 1500, bing: 800, direct: 1200 },
  { date: 'Mar 2', facebook: 2700, google: 1600, bing: 900, direct: 1100 },
  { date: 'Mar 3', facebook: 2400, google: 1450, bing: 850, direct: 1300 },
  { date: 'Mar 4', facebook: 2800, google: 1700, bing: 950, direct: 1250 },
  { date: 'Mar 5', facebook: 2600, google: 1550, bing: 875, direct: 1150 },
  { date: 'Mar 6', facebook: 3000, google: 1800, bing: 1000, direct: 1400 },
  { date: 'Mar 7', facebook: 2900, google: 1750, bing: 925, direct: 1350 },
]

const sourceData = [
  { source: 'Facebook Ads', revenue: '$18,900', leads: '3,780', cost: '$9,450', roi: '100%' },
  { source: 'Google Ads', revenue: '$11,350', leads: '2,270', cost: '$5,675', roi: '100%' },
  { source: 'Bing Ads', revenue: '$6,300', leads: '1,260', cost: '$3,150', roi: '100%' },
  { source: 'Direct Buy', revenue: '$8,750', leads: '1,750', cost: '$4,375', roi: '100%' },
]

export default function RevenueSourcePage() {
  const [dateRange, setDateRange] = useState("7d")

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sources..."
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
        <Select defaultValue={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px] bg-white border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2 bg-white border-gray-200">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Chart */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue by Source</h3>
          <Select defaultValue="revenue">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="leads">Leads</SelectItem>
              <SelectItem value="cost">Cost</SelectItem>
              <SelectItem value="roi">ROI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="facebook" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="google" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="bing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="direct" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                }}
                itemStyle={{ color: '#111827', fontSize: 12, padding: '2px 0' }}
                labelStyle={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}
              />
              <Area
                type="monotone"
                dataKey="facebook"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#facebook)"
              />
              <Area
                type="monotone"
                dataKey="google"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#google)"
              />
              <Area
                type="monotone"
                dataKey="bing"
                stroke="#eab308"
                strokeWidth={2}
                fill="url(#bing)"
              />
              <Area
                type="monotone"
                dataKey="direct"
                stroke="#ec4899"
                strokeWidth={2}
                fill="url(#direct)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="min-w-full divide-y divide-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROI
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sourceData.map((item) => (
                <tr key={item.source} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.revenue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.leads}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.cost}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.roi}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}