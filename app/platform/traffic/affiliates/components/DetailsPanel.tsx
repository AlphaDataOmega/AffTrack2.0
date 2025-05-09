"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { AffiliateStatus, type DetailsPanelProps } from '../types'

const statusMap = {
  [AffiliateStatus.ACTIVE]: 'bg-green-50 text-green-700 border-green-100',
  [AffiliateStatus.PENDING]: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  [AffiliateStatus.BLOCKED]: 'bg-red-50 text-red-700 border-red-100',
  [AffiliateStatus.PAUSED]: 'bg-orange-50 text-orange-700 border-orange-100'
} as const

export function DetailsPanel({ 
  currentStep, 
  totalSteps = 2, 
  form, 
  isNew, 
  isLoading,
  error 
}: DetailsPanelProps) {
  const getStatusBadge = (status: AffiliateStatus) => {
    return statusMap[status] || statusMap[AffiliateStatus.PENDING]
  }

  const isComplete = form.basic.name && 
    form.basic.propertyIds.length > 0 && 
    form.contact.contactName && 
    (!form.contact.email || form.contact.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))

  if (isLoading) {
    return (
      <Card className="w-[300px] p-6 h-fit">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-[300px] p-6 h-fit">
        <div className="flex items-center gap-3 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <h3 className="text-sm font-medium">Error</h3>
        </div>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </Card>
    )
  }

  return (
    <Card className="w-[300px] p-6 h-fit">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isNew ? 'New Affiliate Details' : 'Affiliate Details'}
          </h3>
          <p className="text-sm text-gray-500">Affiliate information summary</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Completion Status</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-500">
                {currentStep}/{totalSteps}
              </span>
            </div>
          </div>

          {form.basic.name && (
            <div>
              <p className="text-sm font-medium text-gray-700">Name</p>
              <p className="mt-1 text-sm text-gray-900">{form.basic.name}</p>
              {form.basic.company && (
                <p className="mt-0.5 text-sm text-gray-500">{form.basic.company}</p>
              )}
            </div>
          )}

          {form.contact.contactName && (
            <div>
              <p className="text-sm font-medium text-gray-700">Contact</p>
              <p className="mt-1 text-sm text-gray-900">{form.contact.contactName}</p>
              {form.contact.email && (
                <p className="mt-0.5 text-sm text-gray-500">{form.contact.email}</p>
              )}
            </div>
          )}

          {form.basic.status && (
            <div>
              <p className="text-sm font-medium text-gray-700">Status</p>
              <Badge 
                variant="outline" 
                className={getStatusBadge(form.basic.status)}
              >
                {form.basic.status.charAt(0) + form.basic.status.slice(1).toLowerCase()}
              </Badge>
            </div>
          )}

          {form.basic.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700">Tags</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {form.basic.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              {isComplete ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-700">Ready to {isNew ? 'create' : 'save'}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-700">Required fields missing</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
} 