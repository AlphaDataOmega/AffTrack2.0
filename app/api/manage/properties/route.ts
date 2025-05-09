import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from 'next/cache'
import { rateLimit } from "@/lib/rate-limit"
import { headers } from 'next/headers'
import type { Property, PropertyForm, ApiResponse, ActivityAction } from "@/app/platform/manage/properties/config"
import { validateProperty } from "@/app/platform/manage/properties/config"

// Rate limit configuration
const apiLimiter = rateLimit({
  maxRequests: 100,  // 100 requests
  windowMs: 60000    // per minute
})

// Activity logging helper
const logActivity = async (userId: string, action: ActivityAction, details: Record<string, unknown>) => {
  const headersList = headers()
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      details: JSON.stringify(details),
      ipAddress: headersList.get('x-forwarded-for') || undefined,
      userAgent: headersList.get('user-agent') || undefined
    }
  })
}

// Error response helper
const errorResponse = (message: string, status = 400) => {
  return NextResponse.json<ApiResponse<never>>({ 
    error: { code: "ERROR", message } 
  }, { status })
}

export async function GET(request: Request) {
  const rateLimitResult = await apiLimiter()
  if (rateLimitResult) return rateLimitResult

  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const properties = await prisma.property.findMany({
      where: session.user.isMaster ? {} : {
        users: { some: { id: session.user.id } }
      },
      include: {
        _count: {
          select: { campaigns: true, users: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json<ApiResponse<Property[]>>({ data: properties })
  } catch (error) {
    console.error('[PROPERTIES] ERROR - GET:', error)
    return errorResponse("Failed to fetch properties", 500)
  }
}

export async function POST(request: Request) {
  const rateLimitResult = await apiLimiter()
  if (rateLimitResult) return rateLimitResult

  const session = await getServerSession(authConfig)
  if (!session?.user) return errorResponse("Unauthorized", 401)

  try {
    const data = await request.json() as PropertyForm
    const validation = validateProperty(data)
    
    if (!validation.isValid) {
      return NextResponse.json<ApiResponse<never>>({ 
        error: { 
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: validation.errors
        } 
      }, { status: 400 })
    }

    // Check for existing domain
    const existingProperty = await prisma.property.findFirst({
      where: { domain: data.domain }
    })

    if (existingProperty) {
      return errorResponse("A property with this domain already exists", 400)
    }

    const property = await prisma.property.create({
      data: {
        name: data.name,
        domain: data.domain,
        status: data.status,
        description: data.description || null,
        tags: data.tags,
        industry: data.industry,
        users: {
          connect: [
            { id: session.user.id },
            ...data.users.map(id => ({ id }))
          ]
        }
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    await logActivity(
      session.user.id,
      '[PROPERTY] CREATE',
      {
        propertyId: property.id,
        name: property.name,
        domain: property.domain,
        userCount: property.users.length
      }
    )

    revalidateTag('properties')
    return NextResponse.json<ApiResponse<Property>>({ data: property })

  } catch (error) {
    console.error('[PROPERTIES] ERROR - CREATE:', error)
    return errorResponse("Failed to create property", 500)
  }
} 