import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import type { CustomSession } from "@/lib/types"

interface ApiResponse<T> {
  data: T | null
  error?: {
    code: string
    message: string
    details?: any
  }
}

export async function GET(request: Request) {
  try {
    // Session validation (Standard: Session validation REQUIRED)
    const session = await getServerSession(authConfig) as CustomSession
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>({
        data: null,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated'
        }
      }, { status: 401 })
    }

    // Database validation (Standard: Return full Prisma models 🚨 ANTIPATTERN)
    // Fix: Use select to limit returned fields
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true,
        name: true,
        email: true,
        status: true,
        isMaster: true,
        timezone: true,
        properties: { 
          select: { 
            id: true,
            name: true,
            domain: true
          } 
        }
      }
    })

    // User existence check (Standard: Error boundaries)
    if (!user) {
      return NextResponse.json<ApiResponse<null>>({
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: 'Account not found'
        }
      }, { status: 404 })
    }

    // Status validation (Standard: Type safety with UserStatus enum)
    if (user.status !== 'ACTIVE') {
      return NextResponse.json<ApiResponse<null>>({
        data: null,
        error: {
          code: 'FORBIDDEN',
          message: 'Account not active',
          details: { status: user.status }
        }
      }, { status: 403 })
    }

    // Property check (Standard: propertyId filter in ALL queries)
    // Skip property check for first user (master user)
    const hasProperties = user.properties.length > 0
    if (!hasProperties && !user.isMaster) {
      return NextResponse.json(
        { 
          error: "No Properties Assigned", 
          code: "NO_PROPERTIES",
          redirect: "/platform/manage/properties/new"
        }, 
        { status: 403 }
      )
    }

    // Return verified session data
    return NextResponse.json<ApiResponse<typeof user>>({
      data: {
        ...user,
        // Ensure these match the session type
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        isMaster: user.isMaster,
        timezone: user.timezone,
        properties: user.properties
      }
    })

  } catch (error) {
    // Standard: Error handling with activity log
    console.error('[AUTH_ERROR]', error)
    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to verify session'
      }
    }, { status: 500 })
  }
} 