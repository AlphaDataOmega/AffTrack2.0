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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const rateLimitResult = await apiLimiter()
  if (rateLimitResult) return rateLimitResult

  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const property = await prisma.property.findFirst({
      where: { 
        id: params.id,
        ...(session.user.isMaster ? {} : {
          users: { some: { id: session.user.id } }
        })
      },
      include: {
        users: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!property) return errorResponse("Property not found", 404)

    return NextResponse.json<ApiResponse<Property>>({ data: property })
  } catch (error) {
    console.error('[PROPERTY] ERROR - GET:', error)
    return errorResponse("Failed to fetch property", 500)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get current property for comparison
    const currentProperty = await prisma.property.findFirst({
      where: { 
        id: params.id,
        ...(session.user.isMaster ? {} : {
          users: { some: { id: session.user.id } }
        })
      },
      include: {
        users: {
          select: { id: true }
        }
      }
    })

    if (!currentProperty) {
      return errorResponse("Property not found or access denied", 404)
    }

    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: {
        name: data.name,
        domain: data.domain,
        status: data.status,
        description: data.description || null,
        tags: data.tags,
        industry: data.industry,
        users: {
          set: [],
          connect: data.users.map(userId => ({ id: userId }))
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
      '[PROPERTY] UPDATE',
      {
        propertyId: updatedProperty.id,
        name: updatedProperty.name,
        changes: data,
        userCount: updatedProperty.users.length
      }
    )

    revalidateTag('properties')
    return NextResponse.json<ApiResponse<Property>>({ data: updatedProperty })

  } catch (error) {
    console.error('[PROPERTY] ERROR - UPDATE:', error)
    return errorResponse("Failed to update property", 500)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const rateLimitResult = await apiLimiter()
  if (rateLimitResult) return rateLimitResult

  const session = await getServerSession(authConfig)
  if (!session?.user) return errorResponse("Unauthorized", 401)

  try {
    const property = await prisma.property.findFirst({
      where: { 
        id: params.id,
        ...(session.user.isMaster ? {} : {
          users: { some: { id: session.user.id } }
        })
      },
      include: {
        users: {
          select: { id: true }
        }
      }
    })

    if (!property) {
      return errorResponse("Property not found or access denied", 404)
    }

    await prisma.property.delete({ where: { id: params.id } })

    await logActivity(
      session.user.id,
      '[PROPERTY] DELETE',
      {
        propertyId: property.id,
        name: property.name,
        affectedUsers: property.users.map(u => u.id)
      }
    )

    revalidateTag('properties')
    return NextResponse.json<ApiResponse<{ success: true }>>({ 
      data: { success: true }
    })

  } catch (error) {
    console.error('[PROPERTY] ERROR - DELETE:', error)
    return errorResponse("Failed to delete property", 500)
  }
} 