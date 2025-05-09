import type { Session } from "next-auth"

export interface CustomSession extends Session {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    propertyId?: string | null
  }
}

export interface SessionUpdate {
  name?: string
  timezone?: string
  email?: string
  status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
} 