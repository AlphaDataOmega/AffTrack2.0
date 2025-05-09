import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { z } from 'zod'

// Validation Schemas
const CreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  status: z.enum(['PENDING', 'ACTIVE']).optional().default('PENDING'),
  isMaster: z.boolean().optional().default(false)
})

const UpdateUserSchema = z.object({
  id: z.string(),
  action: z.enum(['approve', 'suspend', 'delete']),
  data: z.any().optional()
})

// Standard error responses
function errorResponse(message: string, code: string, status: number) {
  return NextResponse.json({ 
    error: { message, code } 
  }, { status })
}

// GET /api/users
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    const url = new URL(request.url)
    
    // Public endpoint for user count
    if (url.searchParams.has('count')) {
      const count = await prisma.user.count()
      return NextResponse.json({ data: { count } })
    }

    if (!session?.user) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
    }

    // Master users get all users, others get property-filtered
    const where = session.user.isMaster ? {} : {
      properties: {
        some: {
          users: { some: { id: session.user.id } }
        }
      }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        isMaster: true,
        createdAt: true,
        properties: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ data: users })
  } catch (error) {
    console.error('[USERS_GET]', error)
    return errorResponse(
      "Failed to fetch users",
      "FETCH_ERROR",
      500
    )
  }
}

// POST /api/users
export async function POST(request: Request) {
  try {
    const isPublicRegistration = !request.headers.get('x-admin-request')
    let isMasterOverride = false
    let currentSession = null

    if (!isPublicRegistration) {
      currentSession = await getServerSession(authConfig)
      if (!currentSession?.user?.isMaster) {
        return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
      }
      isMasterOverride = true
    }

    const result = CreateUserSchema.safeParse(await request.json())
    if (!result.success) {
      return errorResponse(
        "Invalid input",
        "VALIDATION_ERROR",
        400
      )
    }
    
    const { name, email, password, status } = result.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return errorResponse(
        "Email already exists",
        "USER_EXISTS",
        400
      )
    }

    const userCount = await prisma.user.count()
    const isFirstUser = userCount === 0

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hash(password, 12),
        isMaster: isFirstUser,
        status: isMasterOverride ? status : isFirstUser ? 'ACTIVE' : 'PENDING'
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        isMaster: true,
        createdAt: true
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: currentSession?.user?.id || null,
        action: isPublicRegistration ? '[USER] REGISTER' : '[USER] CREATE',
        details: {
          newUserId: user.id,
          email: user.email,
          isFirstUser,
          isMaster: user.isMaster,
          source: isPublicRegistration ? 'public' : 'admin'
        },
        ipAddress: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent')
      }
    })

    return NextResponse.json({
      data: user,
      message: isFirstUser ? 
        'Platform administrator account created successfully' : 
        'Account created successfully'
    })
  } catch (error) {
    console.error('[USERS_POST]', error)
    
    // Log error
    await prisma.activityLog.create({
      data: {
        userId: null,
        action: '[USER] REGISTRATION_ERROR',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: process.env.NODE_ENV === 'development' ? 
            error instanceof Error ? error.stack : undefined : 
            undefined
        },
        ipAddress: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent')
      }
    })

    return errorResponse(
      "Failed to create account",
      "REGISTRATION_FAILED",
      500
    )
  }
}

// PUT /api/users
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.email) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
    }

    const result = UpdateUserSchema.safeParse(await request.json())
    if (!result.success) {
      return errorResponse(
        "Invalid input",
        "VALIDATION_ERROR",
        400
      )
    }

    const { id, action, data } = result.data

    // Verify user exists
    const targetUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!targetUser) {
      return errorResponse("User not found", "USER_NOT_FOUND", 404)
    }

    // Handle different update actions
    switch (action) {
      case 'approve':
      case 'suspend':
      case 'delete':
        if (!session.user.isMaster) {
          return errorResponse(
            "Insufficient permissions",
            "INSUFFICIENT_PERMISSIONS",
            403
          )
        }

        if (id === session.user.id) {
          return errorResponse(
            "Cannot perform this action on your own account",
            "SELF_ACTION_FORBIDDEN",
            400
          )
        }

        if (targetUser.isMaster) {
          return errorResponse(
            "Cannot modify a master user",
            "MASTER_USER_PROTECTED",
            400
          )
        }

        if (action === 'delete') {
          await prisma.user.delete({ where: { id } })
          return NextResponse.json({ data: { success: true } })
        }

        const updateData = {
          status: action === 'approve' ? 'ACTIVE' : 'SUSPENDED',
          ...data
        }

        // Update user
        const updatedUser = await prisma.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
            isMaster: true,
            updatedAt: true,
          }
        })

        // Log activity
        const headers = request.headers
        await prisma.activityLog.create({
          data: {
            userId: session.user.id,
            action: `[USER] ${action.toUpperCase()}`,
            details: {
              targetUserId: id,
              targetEmail: targetUser.email,
              changes: updateData,
              previousStatus: targetUser.status,
              newStatus: updateData.status
            },
            ipAddress: headers.get('x-forwarded-for'),
            userAgent: headers.get('user-agent')
          }
        })

        return NextResponse.json({ data: updatedUser })

      default:
        return errorResponse(
          "Invalid action",
          "INVALID_ACTION",
          400
        )
    }
  } catch (error) {
    console.error('[USERS_PUT]', error)
    
    // Log error
    const headers = request.headers
    await prisma.activityLog.create({
      data: {
        userId: 'system',
        action: '[USER] UPDATE_ERROR',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        ipAddress: headers.get('x-forwarded-for'),
        userAgent: headers.get('user-agent')
      }
    })

    return errorResponse(
      "Failed to update user",
      "UPDATE_FAILED",
      500
    )
  }
} 