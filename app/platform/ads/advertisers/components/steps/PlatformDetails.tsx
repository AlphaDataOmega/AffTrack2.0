"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useFormContext } from "react-hook-form"
import { NetworkFormData } from "../../../../../lib/templates/feature/types/../platform/ads/advertisers/types"
import { Card } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"
import { logError } from "@/lib/activity"

export function PlatformDetails() {
  const form = useFormContext<NetworkFormData>()

  const handleFieldError = async (error: unknown, field: string) => {
    await logError('NETWORK', error, {
      component: 'PlatformDetails',
      field,
      isSensitive: field === 'password' // Flag sensitive fields
    })
  }

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-100">
        <div className="p-4 flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Platform Access</p>
            <p className="mt-1">
              Enter the platform access details for this affiliate network. Only Login URL is required.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="platform.loginUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Account Login URL</FormLabel>
              <FormControl>
                <Input 
                  type="url" 
                  placeholder="Enter login URL" 
                  {...field} 
                  onError={(error) => handleFieldError(error, 'loginUrl')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="platform.accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account/Affiliate ID</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter account or affiliate ID" 
                  {...field} 
                  onError={(error) => handleFieldError(error, 'accountId')}
                />
              </FormControl>
              <FormDescription>
                Optional: Your unique identifier in the network
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="platform.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Enter account email" 
                  {...field} 
                  onError={(error) => handleFieldError(error, 'email')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="platform.username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Username</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter account username" 
                  {...field} 
                  onError={(error) => handleFieldError(error, 'username')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="platform.password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter account password" 
                  {...field} 
                  onError={(error) => handleFieldError(error, 'password')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="platform.reportingUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Reporting URL</FormLabel>
              <FormControl>
                <Input 
                  type="url" 
                  placeholder="Enter reporting URL" 
                  {...field} 
                  onError={(error) => handleFieldError(error, 'reportingUrl')}
                />
              </FormControl>
              <FormDescription>
                Optional: URL for accessing reports if different from login URL
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
} 