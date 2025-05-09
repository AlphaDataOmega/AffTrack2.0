import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { affiliateFormSchema } from "@/app/platform/traffic/affiliates/types"

// Activity logging types
const AffiliateActivityTypes = {
  CREATE: '[AFFILIATES] CREATE',
  UPDATE: '[AFFILIATES] UPDATE',
  DELETE: '[AFFILIATES] DELETE',
  ERROR: '[AFFILIATES] ERROR'
} as const

const ErrorCodes = {
  NOT_FOUND: 'RESOURCE_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED_ACCESS',
  VALIDATION: 'VALIDATION_ERROR',
  ACCESS_DENIED: 'ACCESS_DENIED',
  SERVER_ERROR: 'INTERNAL_ERROR'
} as const

const createSchema = z.object({
  id: z.string().optional(),
  ...affiliateFormSchema.shape.basic.shape,
  ...affiliateFormSchema.shape.contact.shape,
  ...affiliateFormSchema.shape.payout.shape
})

async function logActivity(action: keyof typeof AffiliateActivityTypes, details: Record<string, any>, userId?: string) {
  await prisma.activityLog.create({
    data: {
      userId,
      action: AffiliateActivityTypes[action],
      details
    }
  })
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json({ 
        error: { 
          code: ErrorCodes.UNAUTHORIZED,
          message: 'Unauthorized access'
        }
      }, { status: 401 })
    }

    const body = await request.json()
    const validated = createSchema.parse(body)

    // Verify user has access to the properties
    const accessibleProperties = await prisma.property.findMany({
      where: {
        id: { in: validated.propertyIds },
        users: { some: { id: session.user.id } }
      }
    })

    if (accessibleProperties.length !== validated.propertyIds.length) {
      await logActivity('ERROR', {
        context: 'CREATE_AFFILIATE',
        error: 'Access denied to one or more properties',
        propertyIds: validated.propertyIds
      }, session.user.id)

      return NextResponse.json({ 
        error: { 
          code: ErrorCodes.ACCESS_DENIED,
          message: 'Access denied to one or more properties'
        }
      }, { status: 403 })
    }

    const affiliate = await prisma.affiliate.create({
      data: {
        name: validated.name,
        description: validated.description,
        company: validated.company,
        status: validated.status,
        contactName: validated.contactName,
        website: validated.website,
        phone: validated.phone,
        skype: validated.skype,
        email: validated.email,
        tags: validated.tags,
        properties: {
          connect: validated.propertyIds.map(id => ({ id }))
        }
      },
      include: {
        properties: {
          select: { id: true, name: true }
        }
      }
    })

    await logActivity('CREATE', {
      affiliateId: affiliate.id,
      affiliateName: affiliate.name,
      propertyIds: validated.propertyIds
    }, session.user.id)

    return NextResponse.json({ data: affiliate })
  } catch (error) {
    console.error('[AFFILIATES_CREATE_ERROR]', error)
    
    const session = await getServerSession(authConfig)
    
    if (session?.user?.id) {
      await logActivity('ERROR', {
        context: 'CREATE_AFFILIATE',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }, session.user.id)
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: {
          code: ErrorCodes.VALIDATION,
          message: 'Validation failed',
          details: error.errors
        }
      }, { status: 400 })
    }

    return NextResponse.json({
      error: {
        code: ErrorCodes.SERVER_ERROR,
        message: 'Failed to create affiliate'
      }
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json({ 
        error: { 
          code: ErrorCodes.UNAUTHORIZED,
          message: 'Unauthorized access'
        }
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const propertyId = searchParams.get('propertyId')
    const status = searchParams.get('status')

    // If fetching a single affiliate
    if (id) {
      const affiliate = await prisma.affiliate.findFirst({
        where: {
          id,
          properties: {
            some: {
              users: { some: { id: session.user.id } }
            }
          }
        },
        include: {
          properties: {
            select: { id: true, name: true }
          }
        }
      })

      if (!affiliate) {
        return NextResponse.json({ 
          error: { 
            code: ErrorCodes.NOT_FOUND,
            message: 'Affiliate not found'
          }
        }, { status: 404 })
      }

      return NextResponse.json({ data: affiliate })
    }

    // List affiliates with property-based access control
    const affiliates = await prisma.affiliate.findMany({
      where: {
        properties: {
          some: propertyId ? {
            id: propertyId,
            users: { some: { id: session.user.id } }
          } : {
            users: { some: { id: session.user.id } }
          }
        },
        status: status as any || undefined
      },
      include: {
        properties: {
          select: { id: true, name: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ 
      data: affiliates,
      meta: {
        total: affiliates.length
      }
    })
  } catch (error) {
    console.error('[AFFILIATES_LIST_ERROR]', error)
    return NextResponse.json({ 
      error: { 
        code: ErrorCodes.SERVER_ERROR,
        message: 'Failed to fetch affiliates'
      }
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json({ 
        error: { 
          code: ErrorCodes.UNAUTHORIZED,
          message: 'Unauthorized access'
        }
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const propertyId = searchParams.get('propertyId')

    if (!id || !propertyId) {
      return NextResponse.json({ 
        error: { 
          code: ErrorCodes.VALIDATION,
          message: 'Affiliate ID and Property ID are required'
        }
      }, { status: 400 })
    }

    // Verify affiliate exists and user has access through property
    const affiliate = await prisma.affiliate.findFirst({
      where: {
        id,
        properties: {
          some: {
            id: propertyId,
            users: { some: { id: session.user.id } }
          }
        }
      }
    })

    if (!affiliate) {
      return NextResponse.json({ 
        error: { 
          code: ErrorCodes.NOT_FOUND,
          message: 'Affiliate not found or access denied'
        }
      }, { status: 404 })
    }

    // Remove the connection to the specific property
    await prisma.affiliate.update({
      where: { id },
      data: {
        properties: {
          disconnect: { id: propertyId }
        }
      }
    })

    await logActivity('DELETE', {
      affiliateId: id,
      affiliateName: affiliate.name,
      propertyId
    }, session.user.id)

    return NextResponse.json({ 
      data: null,
      meta: {
        message: 'Affiliate removed from property successfully'
      }
    })
  } catch (error) {
    console.error('[AFFILIATES_DELETE_ERROR]', error)
    
    const session = await getServerSession(authConfig)
    
    if (session?.user?.id) {
      await logActivity('ERROR', {
        context: 'DELETE_AFFILIATE',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        propertyId: new URL(request.url).searchParams.get('propertyId')
      }, session.user.id)
    }

    return NextResponse.json({
      error: {
        code: ErrorCodes.SERVER_ERROR,
        message: 'Failed to delete affiliate'
      }
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json({ 
        error: { 
          code: ErrorCodes.UNAUTHORIZED,
          message: 'Unauthorized access'
        }
      }, { status: 401 })
    }

    const body = await request.json()
    const validated = createSchema.parse(body)

    // First verify the user has access to the affiliate through any of its current properties
    const existingAffiliate = await prisma.affiliate.findFirst({
      where: {
        id: validated.id,
        properties: {
          some: {
            users: { some: { id: session.user.id } }
          }
        }
      }
    })

    if (!existingAffiliate) {
      return NextResponse.json({ 
        error: { 
          code: ErrorCodes.ACCESS_DENIED,
          message: 'Affiliate not found or access denied'
        }
      }, { status: 403 })
    }

    // Then verify access to the new properties
    const accessibleProperties = await prisma.property.findMany({
      where: {
        id: { in: validated.propertyIds },
        users: { some: { id: session.user.id } }
      }
    })

    if (accessibleProperties.length !== validated.propertyIds.length) {
      await logActivity('ERROR', {
        context: 'UPDATE_AFFILIATE',
        error: 'Access denied to one or more properties',
        propertyIds: validated.propertyIds
      }, session.user.id)

      return NextResponse.json({ 
        error: { 
          code: ErrorCodes.ACCESS_DENIED,
          message: 'Access denied to one or more properties'
        }
      }, { status: 403 })
    }

    const affiliate = await prisma.affiliate.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        description: validated.description,
        company: validated.company,
        status: validated.status,
        contactName: validated.contactName,
        website: validated.website,
        phone: validated.phone,
        skype: validated.skype,
        email: validated.email,
        tags: validated.tags,
        properties: {
          set: validated.propertyIds.map(id => ({ id }))
        }
      },
      include: {
        properties: {
          select: { id: true, name: true }
        }
      }
    })

    await logActivity('UPDATE', {
      affiliateId: affiliate.id,
      affiliateName: affiliate.name,
      propertyIds: validated.propertyIds,
      changes: {
        before: existingAffiliate,
        after: affiliate
      }
    }, session.user.id)

    return NextResponse.json({ data: affiliate })
  } catch (error) {
    console.error('[AFFILIATES_UPDATE_ERROR]', error)
    
    const session = await getServerSession(authConfig)
    
    if (session?.user?.id) {
      await logActivity('ERROR', {
        context: 'UPDATE_AFFILIATE',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }, session.user.id)
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: {
          code: ErrorCodes.VALIDATION,
          message: 'Validation failed',
          details: error.errors
        }
      }, { status: 400 })
    }

    return NextResponse.json({
      error: {
        code: ErrorCodes.SERVER_ERROR,
        message: 'Failed to update affiliate'
      }
    }, { status: 500 })
  }
} 
  