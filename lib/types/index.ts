import { DefaultSession } from "next-auth"
import type { Property } from "@prisma/client"

// Extend the built-in session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      status: string
      isMaster: boolean
      timezone: string
      properties: Property[]
    } & DefaultSession["user"]
  }

  // Extend the built-in user type
  interface User {
    id: string
    email: string
    name: string
    status: string
    isMaster: boolean
    timezone: string
    properties: Property[]
  }
}

// Export types for use in API routes
export interface ActivityLogInput {
  userId: string | null
  action: string
  propertyId?: string | null
  details?: Record<string, any> | null
}

export interface ApiResponse<T> {
  data?: T | null
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
}

export type CustomSession = {
  user: {
    id: string
    email: string
    name: string
    status: string
    isMaster: boolean
    timezone: string
    properties: Property[]
  }
}

export * from './activity'
export * from './session'

export interface SessionUpdate {
  name?: string
  timezone?: string
  email?: string
  status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
} 