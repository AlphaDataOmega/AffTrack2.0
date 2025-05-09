"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useFormContext } from "react-hook-form"
import { NetworkFormData } from "../../types"
import { Card } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { logError } from "@/lib/activity"

interface ContactFieldsProps {
  type: 'manager' | 'billing' | 'technical'
  title: string
}

function ContactFields({ type, title }: ContactFieldsProps) {
  const form = useFormContext<NetworkFormData>()
  const isManager = type === 'manager'
  
  const handleFieldError = async (error: unknown) => {
    await logError('NETWORK', error, {
      component: 'ContactFields',
      fieldType: type
    })
  }

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={`contact.${type}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className={isManager ? "required" : ""}>{title} Name</FormLabel>
            <FormControl>
              <Input placeholder={`Enter ${title.toLowerCase()} name`} {...field} onError={handleFieldError} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`contact.${type}.email`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className={isManager ? "required" : ""}>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder={`Enter ${title.toLowerCase()} email`} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`contact.${type}.phone`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input placeholder="Enter phone number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`contact.${type}.skype`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Skype</FormLabel>
            <FormControl>
              <Input placeholder="Enter Skype ID" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`contact.${type}.telegram`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telegram</FormLabel>
            <FormControl>
              <Input placeholder="Enter Telegram ID" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

const tabs = [
  { id: 'manager', label: 'Affiliate Manager' },
  { id: 'billing', label: 'Billing Contact' },
  { id: 'technical', label: 'Technical Contact' },
] as const

export function ContactDetails() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]['id']>('manager')

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-100">
        <div className="p-4 flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Contact Information</p>
            <p className="mt-1">
              Enter the contact details for this affiliate network. Only Affiliate Manager name and email are required.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'manager' && (
          <ContactFields type="manager" title="Affiliate Manager" />
        )}
        {activeTab === 'billing' && (
          <ContactFields type="billing" title="Billing Contact" />
        )}
        {activeTab === 'technical' && (
          <ContactFields type="technical" title="Technical Contact" />
        )}
      </div>
    </div>
  )
} 