"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const reports = [
  { name: "Source", href: "/analyze/revenue/source" },
  { name: "Affiliate Network", href: "/analyze/revenue/affiliate-network" },
  { name: "Offer", href: "/analyze/revenue/offer" },
  { name: "Campaign", href: "/analyze/revenue/campaign" },
  { name: "UTM Tag", href: "/analyze/revenue/utm-tag" },
]

export default function RevenueLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue Analysis</h1>
        <p className="mt-1 text-sm text-gray-500">
          Analyze revenue performance across different dimensions
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {reports.map((report) => (
            <Link
              key={report.name}
              href={report.href}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium",
                pathname === report.href
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {report.name}
            </Link>
          ))}
        </nav>
      </div>

      {children}
    </div>
  )
}