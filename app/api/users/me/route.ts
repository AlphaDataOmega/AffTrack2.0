import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from 'zod'

// Validation Schemas
const MeResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().nullable(),
    status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED']),
    isMaster: z.boolean(),
    timezone: z.string().nullable(),
    properties: z.array(z.object({
      id: z.string(),
      name: z.string(),
      domain: z.string()
    }))
  }),
  meta: z.object({
    hasProperties: z.boolean(),
    isFirstUser: z.boolean(),
    canCreateProperty: z.boolean()
  })
})

const UpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters").optional(),
  timezone: z.string().refine(tz => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz })
      return true
    } catch {
      return false
    }
  }, "Invalid timezone").optional()
})

// Standard error responses
function errorResponse(message: string, code: string, status: number) {
  return NextResponse.json({ 
    error: { message, code } 
  }, { status })
}

export async function GET() {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        isMaster: true,
        timezone: true,
        properties: {
          select: {
            id: true,
            name: true,
            domain: true
          }
        },
        _count: {
          select: { 
            properties: true,
            activities: {
              where: { action: 'PROPERTY_CREATE' }
            }
          }
        }
      }
    })

    if (!user) {
      return errorResponse("User not found", "USER_NOT_FOUND", 404)
    }

    const responseData = {
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        isMaster: user.isMaster,
        timezone: user.timezone,
        properties: user.properties
      },
      meta: {
        hasProperties: user._count.properties > 0,
        isFirstUser: user.isMaster && user.status === 'ACTIVE',
        canCreateProperty: user._count.activities < 5 // Max 5 properties per user
      }
    }

    // Validate response shape
    const parsedResponse = MeResponseSchema.parse(responseData)
    return NextResponse.json(parsedResponse)

  } catch (error) {
    console.error("[USER_ME]", error)
    return errorResponse(
      "Failed to fetch user profile",
      "FETCH_ERROR",
      500
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
    }

    const body = await request.json()
    const parsed = UpdateSchema.safeParse(body)
    
    if (!parsed.success) {
      return errorResponse(
        "Invalid input",
        "VALIDATION_ERROR",
        400
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...parsed.data,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        timezone: true,
        email: true
      }
    })

    // Log activity
    const headers = request.headers
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: '[USER] PROFILE_UPDATE',
        details: parsed.data,
        ipAddress: headers.get('x-forwarded-for'),
        userAgent: headers.get('user-agent')
      }
    })

    return NextResponse.json({ data: updatedUser })
  } catch (error) {
    console.error("[USER_ME_UPDATE]", error)
    
    // Log error
    const headers = request.headers
    const currentSession = await getServerSession(authConfig)
    
    await prisma.activityLog.create({
      data: {
        userId: currentSession?.user?.id || null,
        action: '[USER] PROFILE_UPDATE_ERROR',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        ipAddress: headers.get('x-forwarded-for'),
        userAgent: headers.get('user-agent')
      }
    })

    return errorResponse(
      "Failed to update profile",
      "UPDATE_FAILED",
      500
    )
  }
} 