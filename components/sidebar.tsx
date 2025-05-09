"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  Zap,
  Users,
  FileText,
  PlusCircle,
  BarChart3,
  Settings,
  ChevronDown,
} from "lucide-react"

const navigation = [
  {
    name: 'Traffic',
    icon: Users,
    items: [
      { name: 'Campaigns', href: '/platform/traffic/campaigns' },
      { name: 'Affiliates', href: '/platform/traffic/affiliates' },
      { name: 'AdNetworks', href: '/platform/traffic/adnetworks' },
    ]
  },
  {
    name: 'Leads',
    icon: FileText,
    items: [
      { name: 'Records', href: '/platform/leads/records' },
      { name: 'Transfers', href: '/platform/leads/transfers' },
      { name: 'Data Buyers', href: '/platform/leads/buyers' },
      { name: 'Feeds', href: '/platform/leads/feeds' },
    ]
  },
  {
    name: 'Ads',
    icon: Zap,
    items: [
      { name: 'Advertisers', href: '/platform/ads/advertisers' },
      { name: 'Affiliate Networks', href: '/platform/ads/affiliatenetworks' },
      { name: 'Offers', href: '/platform/ads/offers' },
      { name: 'Placements', href: '/platform/ads/placements' },
      { name: 'Split Tests', href: '/platform/ads/split-tests' },
    ]
  },
  {
    name: 'Create',
    icon: PlusCircle,
    items: [
      { name: 'Sites', href: '/platform/create/sites' },
      { name: 'Landing Pages', href: '/platform/create/landing-pages' },
      { name: 'Blog', href: '/platform/create/blog' },
      { name: 'Emails', href: '/platform/create/emails' },
      { name: 'Offer Walls', href: '/platform/create/offer-walls' },
      { name: 'Creative', href: '/platform/create/creative' },
      { name: 'Forms', href: '/platform/create/forms' },
    ]
  },
  {
    name: 'Analyze',
    icon: BarChart3,
    items: [
      { name: 'Overview', href: '/platform/dashboard/analyze/overview' },
      { name: 'Revenue', href: '/platform/analyze/revenue/source' },
      { name: 'Optimization', href: '/platform/analyze/optimization' },
      { name: 'Leads', href: '/platform/analyze/leads' },
    ]
  },
  {
    name: 'Manage',
    icon: Settings,
    items: [
      { name: 'Activity', href: '/platform/manage/activity' },
      { name: 'Properties', href: '/platform/manage/properties' },
      { name: 'Settings', href: '/platform/manage/settings/general' },
      { name: 'Documentation', href: '/platform/manage/docs' },
    ]
  },
]

interface ProfileData {
  name: string | null
  email: string
  status: string
  isMaster: boolean
}

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [openSections, setOpenSections] = useState<string[]>([])

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => 
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    )
  }

  // Get initials from name
  const getInitials = (name: string | null) => {
    if (!name) return session?.user?.email?.[0]?.toUpperCase() || '?'
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col w-60 bg-[#0f172a] border-r border-[#1e293b]">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 px-2 py-1.5">
          <Zap className="w-6 h-6 text-blue-500" />
          <span className="text-xl font-semibold text-white">AffTrack</span>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((section) => (
          <div key={section.name}>
            <button
              onClick={() => toggleSection(section.name)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2 text-sm rounded-md transition-colors",
                openSections.includes(section.name)
                  ? "bg-blue-500/10 text-white"
                  : "text-gray-400 hover:text-blue-400"
              )}
            >
              <div className="flex items-center gap-3">
                <section.icon className="w-5 h-5" />
                {section.name}
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  openSections.includes(section.name) && "transform rotate-180"
                )}
              />
            </button>
            {openSections.includes(section.name) && (
              <div className="mt-1 ml-4 pl-4 border-l border-[#1e293b] space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "block px-4 py-1.5 text-sm rounded-md transition-colors",
                      pathname.startsWith(item.href)
                        ? "bg-blue-500/10 text-white"
                        : "text-gray-400 hover:text-blue-400"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1e293b]">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white">
            {getInitials(session?.user?.name || null)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">
              {session?.user?.name || 'Guest'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {session?.user?.email || 'No email'}
            </p>
            {session?.user?.status === 'PENDING' && (
              <span className="text-[10px] text-yellow-500">Pending Approval</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}