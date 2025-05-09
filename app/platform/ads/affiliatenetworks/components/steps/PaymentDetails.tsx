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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFormContext } from "react-hook-form"
import {
  NetworkFormData,
  NET_TERMS_OPTIONS,
  PAYMENT_FREQUENCY_OPTIONS,
  CURRENCY_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from "../../types"
import { Card } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"
import { logError } from "@/lib/activity"

export function PaymentDetails() {
  const form = useFormContext<NetworkFormData>()

  const handleFieldError = async (error: unknown, field: string) => {
    await logError('NETWORK', error, {
      component: 'PaymentDetails',
      field
    })
  }

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-100">
        <div className="p-4 flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Payment Terms</p>
            <p className="mt-1">
              Configure how and when you'll receive payments from this affiliate network.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="paymentTerms.paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Payment Method</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                onError={(error) => handleFieldError(error, 'paymentMethod')}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose how you want to receive payments
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentTerms.netTerms"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Net Terms</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select net terms" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {NET_TERMS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Number of days after invoice before payment is due
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentTerms.paymentFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Payment Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                How often invoices are generated
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentTerms.currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Currency used for payments
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentTerms.minimumPayout"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Minimum Payout</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter minimum payout amount"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Minimum amount required before payment is issued
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
} 