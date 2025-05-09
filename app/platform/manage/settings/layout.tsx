"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const settings = [
  { name: "General", href: "/platform/manage/settings/general" },
  { name: "Team", href: "/platform/manage/settings/team" },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {settings.map((setting) => (
            <Link
              key={setting.name}
              href={setting.href}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium",
                pathname === setting.href
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {setting.name}
            </Link>
          ))}
        </nav>
      </div>

      {!pathname && (
        <div className="flex space-x-8">
          {[1,2].map((i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
      )}

      {children}
    </div>
  )
}