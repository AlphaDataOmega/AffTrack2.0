import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { headers } from "next/headers"
import { z } from "zod"

// Standard response type
interface ApiResponse<T> {
  data: T | null
  error?: {
    code: string
    message: string
    details?: SafeAny
  }
}

// Activity validation schemas
const activitySchema = z.object({
  action: z.string().regex(/^\[[A-Z_]+\] [A-Z_]+$/),
  details: z.record(z.any()).optional(),
  propertyId: z.string().optional()
})

const querySchema = z.object({
  propertyId: z.string().optional().nullable(),
  search: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  from: z.string().optional()
    .transform(str => str ? new Date(str) : undefined)
    .refine(date => !date || !isNaN(date.getTime()), {
      message: "Invalid from date"
    })
    .optional()
    .nullable(),
  to: z.string().optional()
    .transform(str => str ? new Date(str) : undefined)
    .refine(date => !date || !isNaN(date.getTime()), {
      message: "Invalid to date"
    })
    .optional()
    .nullable(),
  includeRelated: z.preprocess(
    // Convert string 'true'/'false' to boolean
    val => val === 'true',
    z.boolean().optional()
  )
})

// Core logging function
async function createActivityLog(input: z.infer<typeof activitySchema> & { userId: string | null }) {
  const headersList = headers()
  
  return prisma.activityLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      propertyId: input.propertyId,
      details: input.details || null,
      ipAddress: headersList.get('x-forwarded-for') || 'unknown',
      userAgent: headersList.get('user-agent') || 'unknown'
    }
  })
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>({
        data: null,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated'
        }
      }, { status: 401 })
    }

    const body = await request.json()
    const validation = activitySchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid activity data',
          details: validation.error.errors
        }
      }, { status: 400 })
    }

    const activity = await createActivityLog({
      ...validation.data,
      userId: session.user.id
    })

    return NextResponse.json<ApiResponse<typeof activity>>({ data: activity })
  } catch (error) {
    console.error('[ACTIVITY_ERROR]', error)
    
    // Only log system errors if they're not activity logging errors
    if (error instanceof Error && !error.message.includes('ActivityLog')) {
      await createActivityLog({
        userId: null,
        action: '[SYSTEM] ACTIVITY_ERROR',
        details: {
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      })
    }

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create activity log'
      }
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>({
        data: null,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated'
        }
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const validation = querySchema.safeParse({
      propertyId: searchParams.get('propertyId'),
      search: searchParams.get('search'),
      type: searchParams.get('type'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      includeRelated: searchParams.get('includeRelated') === 'true'
    })

    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: validation.error.errors
        }
      }, { status: 400 })
    }

    const input = validation.data

    // Validate property access
    if (input.propertyId) {
      const hasAccess = await prisma.user.findFirst({
        where: {
          id: session.user.id,
          properties: { some: { id: input.propertyId } }
        }
      })
      if (!hasAccess) {
        return NextResponse.json<ApiResponse<null>>({
          data: null,
          error: {
            code: 'FORBIDDEN',
            message: 'Access to property denied'
          }
        }, { status: 403 })
      }
    }

    const where = {
      AND: [
        // Property filter
        input.propertyId ? {
          OR: [
            { propertyId: input.propertyId },
            {
              details: {
                path: ['propertyId'],
                equals: input.propertyId
              }
            }
          ]
        } : {},
        // Search filter
        input.search ? {
          OR: [
            { action: { contains: input.search, mode: 'insensitive' } },
            { details: { path: ['$'], string_contains: input.search } }
          ]
        } : {},
        // Type filter
        input.type && input.type !== 'all' ? {
          action: { startsWith: `[${input.type}]`, mode: 'insensitive' }
        } : {},
        // Date range
        input.from || input.to ? {
          createdAt: {
            gte: input.from ? new Date(input.from) : undefined,
            lte: input.to ? new Date(input.to) : undefined
          }
        } : {}
      ].filter(Boolean)
    }

    const activities = await prisma.activityLog.findMany({
      where,
      include: {
        User: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit results
    })

    return NextResponse.json<ApiResponse<typeof activities>>({ data: activities })
  } catch (error) {
    console.error('[ACTIVITY_ERROR]', error)
    
    if (error instanceof Error && !error.message.includes('ActivityLog')) {
      await createActivityLog({
        userId: null,
        action: '[SYSTEM] ACTIVITY_ERROR',
        details: {
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      })
    }

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch activity logs'
      }
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    const data = await request.json()

    const validation = activitySchema.safeParse(data)
    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid activity data',
          details: validation.error.errors
        }
      }, { status: 400 })
    }

    // For system events, we don't require a userId
    const isSystemEvent = validation.data.action.startsWith('[SYSTEM]') || 
                         validation.data.action.startsWith('[UI_ERROR]')
                         
    if (!session?.user?.id && !isSystemEvent) {
      return NextResponse.json<ApiResponse<null>>({
        data: null,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated'
        }
      }, { status: 401 })
    }

    const activity = await createActivityLog({
      ...validation.data,
      userId: session?.user?.id || null
    })

    return NextResponse.json<ApiResponse<typeof activity>>({ data: activity })
  } catch (error) {
    console.error('[ACTIVITY_ERROR]', error)
    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create activity log'
      }
    }, { status: 500 })
  }
} 