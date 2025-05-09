import { z } from 'zod'

export enum NetworkStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  INACTIVE = "INACTIVE"
}

export type NetTerms = 'NET15' | 'NET30' | 'NET45' | 'NET60'
export type PaymentFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'

export type Currency = 'USD' | 'EUR' | 'GBP'

export type PaymentMethod = 'WIRE' | 'PAYPAL' | 'ACH' | 'CHECK' | 'WISE' | 'PAYONEER'

export interface ContactInfo {
  name: string
  email: string
  phone?: string
  skype?: string
  telegram?: string
}

export interface PlatformAccess {
  accountId?: string
  email?: string
  username?: string
  password?: string
  loginUrl: string
  reportingUrl?: string
}

export interface PaymentTerms {
  paymentMethod: string
  netTerms: string
  paymentFrequency: string
  currency: string
  minimumPayout: number
}

export const NETWORK_STATUS_OPTIONS = [
  { value: NetworkStatus.ACTIVE, label: "Active" },
  { value: NetworkStatus.PENDING, label: "Pending" },
  { value: NetworkStatus.INACTIVE, label: "Inactive" }
]

export const NET_TERMS_OPTIONS = [
  { label: 'NET 15', value: 'NET15' },
  { label: 'NET 30', value: 'NET30' },
  { label: 'NET 45', value: 'NET45' },
  { label: 'NET 60', value: 'NET60' },
] as const

export const PAYMENT_FREQUENCY_OPTIONS = [
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Bi-weekly', value: 'BIWEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
] as const

export const CURRENCY_OPTIONS = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
] as const

export const PAYMENT_METHOD_OPTIONS = [
  { label: 'Wire Transfer', value: 'WIRE' },
  { label: 'PayPal', value: 'PAYPAL' },
  { label: 'ACH', value: 'ACH' },
  { label: 'Check', value: 'CHECK' },
  { label: 'Wise', value: 'WISE' },
  { label: 'Payoneer', value: 'PAYONEER' },
] as const

export const networkSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  name: z.string().min(1, 'Network name is required'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']),
  
  contact: z.object({
    manager: z.object({
      name: z.string().min(1, 'Manager name is required'),
      email: z.string().email('Invalid email'),
      phone: z.string().optional(),
      skype: z.string().optional(),
      telegram: z.string().optional()
    }),
    billing: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      skype: z.string().optional(),
      telegram: z.string().optional()
    }).optional(),
    technical: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      skype: z.string().optional(),
      telegram: z.string().optional()
    }).optional()
  }),
  
  platform: z.object({
    accountId: z.string().optional(),
    email: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    loginUrl: z.string().url('Invalid URL'),
    reportingUrl: z.string().url('Invalid URL').optional()
  }),
  
  paymentTerms: z.object({
    paymentMethod: z.string().min(1, 'Payment method is required'),
    netTerms: z.string().min(1, 'Net terms are required'),
    paymentFrequency: z.string().min(1, 'Payment frequency is required'),
    currency: z.string().min(1, 'Currency is required'),
    minimumPayout: z.number().min(0, 'Minimum payout must be positive')
  }),

  properties: z.array(z.object({
    id: z.string()
  })).optional().default([])
})

export type NetworkFormData = z.infer<typeof networkSchema>

// Helper type for API operations
export type NetworkCreateInput = Omit<NetworkFormData, 'properties'> & {
  userId: string
  properties?: {
    connect: Array<{ id: string }>
  }
}

export interface AffiliateNetwork extends NetworkFormData {
  id: string
  userId: string
  createdAt: Date
  updatedAt: Date
  _count?: {
    properties: number
    offers: number
  }
} 