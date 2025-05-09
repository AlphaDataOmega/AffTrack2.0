import { z } from "zod"

// Status Options
export const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "INACTIVE", label: "Inactive" },
] as const

export type Status = typeof STATUS_OPTIONS[number]["value"]

// Base Schema for all features
export const baseFeatureSchema = z.object({
  id: z.string().optional(), // Optional for creation
  properties: z.array(z.object({
    id: z.string(),
    name: z.string(),
    domain: z.string()
  })).min(1, "At least one property is required"),
  status: z.enum(STATUS_OPTIONS.map(o => o.value) as [string, ...string[]]),
  description: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

// Base Form Data Type
export interface BaseFormData {
  id?: string
  properties: Array<{
    id: string
    name: string
    domain: string
  }>
  status: Status
  description?: string
}

// Base API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  meta?: {
    total?: number
    page?: number
    pageSize?: number
  }
}

// Base Table Column Type
export interface BaseTableColumn<T> {
  id: string
  header: string
  accessorKey?: keyof T
  cell?: (row: T) => React.ReactNode
} 