import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/lib/auth"
import { headers } from 'next/headers'

// Activity Types
const ActivityTypes = {
  CREATE: '[ADVERTISERS] CREATE',
  UPDATE: '[ADVERTISERS] UPDATE',
  DELETE: '[ADVERTISERS] DELETE',
  ERROR: '[ADVERTISERS] ERROR'
} as const

// Error Codes
const ErrorCodes = {
  NOT_FOUND: 'RESOURCE_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED_ACCESS',
  VALIDATION: 'VALIDATION_ERROR',
  ACCESS_DENIED: 'ACCESS_DENIED',
  SERVER_ERROR: 'INTERNAL_ERROR'
} as const

// Standard error response utility
function errorResponse(code: keyof typeof ErrorCodes, message: string, details?: any, status = 500) {
  return NextResponse.json({
    data: null,
    error: { code, message, details }
  }, { status })
}

// Standard activity logging utility
async function logActivity(
  action: keyof typeof ActivityTypes,
  details: Record<string, any>,
  userId?: string
) {
  if (!userId) return

  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action: ActivityTypes[action],
        details,
        ipAddress: headers().get('x-forwarded-for') || 'unknown',
        userAgent: headers().get('user-agent') || 'unknown'
      }
    })
  } catch (error) {
    console.error('[ACTIVITY_LOG_ERROR]', error)
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', null, 401)
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    // Build access control where clause
    const accessWhere = session.user.isMaster ? {} : {
      properties: {
        some: {
          users: { some: { id: session.user.id } }
        }
      }
    }

    // Build filter where clause
    const where = {
      ...accessWhere,
      ...(propertyId ? {
        properties: {
          some: { id: propertyId }
        }
      } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } }
        ]
      } : {}),
      ...(status && status !== 'all' ? { status } : {})
    }

    const advertisers = await prisma.advertiser.findMany({
      where,
      include: {
        properties: {
          select: {
            id: true,
            name: true,
            domain: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({ data: advertisers })
  } catch (error) {
    console.error('[ADVERTISERS_GET]', error)
    return errorResponse('SERVER_ERROR', 'Failed to fetch advertisers')
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', null, 401)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return errorResponse('VALIDATION', 'Advertiser ID is required', null, 400)
    }

    // Check access
    const advertiser = await prisma.advertiser.findFirst({
      where: {
        id,
        ...(session.user.isMaster ? {} : {
          properties: {
            some: {
              users: { some: { id: session.user.id } }
            }
          }
        })
      }
    })

    if (!advertiser) {
      return errorResponse('NOT_FOUND', 'Advertiser not found or access denied', null, 404)
    }

    // Delete advertiser
    await prisma.advertiser.delete({
      where: { id }
    })

    await logActivity('DELETE', {
      advertiserId: id,
      advertiserName: advertiser.name
    }, session.user.id)

    return NextResponse.json({ data: null })
  } catch (error) {
    console.error('[ADVERTISERS_DELETE]', error)
    
    const session = await getServerSession(authConfig)
    if (session?.user?.id) {
      await logActivity('ERROR', {
        context: 'DELETE_ADVERTISER',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }, session.user.id)
    }

    return errorResponse('SERVER_ERROR', 'Failed to delete advertiser')
  }
} 