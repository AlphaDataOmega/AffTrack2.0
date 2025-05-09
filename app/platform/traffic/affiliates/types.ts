import { z } from "zod"

// Standardize status enum across platform
export enum AffiliateStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  PENDING = "PENDING",
  BLOCKED = "BLOCKED"
}

export const affiliateFormSchema = z.object({
  basic: z.object({
    propertyIds: z.array(z.string()).min(1, "At least one property is required"),
    name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional().default(""),
    company: z.string().max(100, "Company name cannot exceed 100 characters").optional().default(""),
    status: z.nativeEnum(AffiliateStatus),
    tags: z.array(z.string()).default([])
  }),
  contact: z.object({
    contactName: z.string().min(1, "Contact name is required").max(100, "Contact name cannot exceed 100 characters"),
    email: z.union([
      z.string().email("Please enter a valid email address"),
      z.string().length(0).default("")
    ]),
    phone: z.string().max(20, "Phone number cannot exceed 20 characters")
      .refine(val => val === "" || /^[+]?[\d\s-()]+$/.test(val), "Please enter a valid phone number")
      .optional()
      .default(""),
    skype: z.string().max(50, "Skype ID cannot exceed 50 characters").optional().default(""),
    website: z.string().max(200, "Website URL cannot exceed 200 characters")
      .refine(val => val === "" || /^https?:\/\/.+/.test(val), "Please enter a valid website URL")
      .optional()
      .default("")
  }),
  payout: z.object({
    method: z.enum(["bank", "paypal", "wise", "crypto"], {
      required_error: "Please select a payout method",
      invalid_type_error: "Please select a valid payout method"
    }).optional(),
    currency: z.enum(["USD", "EUR", "GBP"], {
      required_error: "Please select a currency",
      invalid_type_error: "Please select a valid currency"
    }).optional(),
    terms: z.string().max(1000, "Terms cannot exceed 1000 characters").optional().default("")
  })
})

export type AffiliateForm = z.infer<typeof affiliateFormSchema>

export interface Property {
  id: string
  name: string
  domain: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface StepProps {
  form: AffiliateForm
  setForm: (form: AffiliateForm) => void
  isSubmitting?: boolean
  onSubmit?: () => Promise<void>
}

export interface DetailsPanelProps {
  currentStep: number
  totalSteps: number
  form: AffiliateForm
  isNew: boolean
  isLoading: boolean
  error?: string
}

export interface Affiliate {
  id: string
  name: string
  email: string
  status: AffiliateStatus
  company: string
  contactName: string
  phone?: string
  skype?: string
  website?: string
  description?: string
  payoutMethod?: string
  payoutCurrency?: string
  payoutTerms?: string
  tags: string[]
  properties?: Property[]
  createdAt: string
  updatedAt: string
}

export interface AffiliateFilters {
  propertyId?: string
  search?: string
  status?: AffiliateStatus
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface AffiliateTableProps {
  affiliates: Affiliate[]
  filters: AffiliateFilters
  totalCount: number
  isLoading?: boolean
  error?: string
  onRefresh?: () => Promise<void>
  onFilterChange: (filters: AffiliateFilters) => void
  itemsPerPage?: number
} 