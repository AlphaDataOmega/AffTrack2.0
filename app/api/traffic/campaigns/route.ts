import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { 
  campaignFormSchema, 
  CampaignStatus, 
  CampaignActivityTypes, 
  type Destination, 
  type Rule,
  DestinationType,
  DistributionType,
  CampaignType
} from "@/app/platform/traffic/campaigns/types"
import { Prisma } from "@prisma/client"

// Error codes
const ErrorCodes = {
  NOT_FOUND: 'RESOURCE_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED_ACCESS',
  VALIDATION: 'VALIDATION_ERROR',
  ACCESS_DENIED: 'ACCESS_DENIED',
  SERVER_ERROR: 'INTERNAL_ERROR'
} as const

// Schema for creating/updating campaigns
const createSchema = z.object({
  id: z.string().optional(),
  propertyIds: z.array(z.string()).min(1, 'At least one property is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  type: z.string().min(1, 'Type is required'),
  sourceType: z.string().min(1, 'Source type is required'),
  affiliateId: z.string().nullable().optional(),
  adNetworkId: z.string().nullable().optional(),
  status: z.nativeEnum(CampaignStatus),
  utmSource: z.string().min(1, 'UTM source is required'),
  utmMedium: z.string().min(1, 'UTM medium is required'),
  utmCampaign: z.string().min(1, 'UTM campaign is required'),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  countries: z.array(z.string()).min(1, 'At least one country is required'),
  devices: z.array(z.string()).min(1, 'At least one device is required'),
  browsers: z.array(z.string()).min(1, 'At least one browser is required'),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
  destinationType: z.nativeEnum(DestinationType),
  distribution: z.nativeEnum(DistributionType),
  destinations: z.array(z.object({
    id: z.string().optional(),
    url: z.string().url('Please enter a valid URL'),
    name: z.string().min(1, 'Name is required'),
    weight: z.number().min(0).max(100).optional(),
    isDefault: z.boolean().optional().default(false),
    rules: z.array(z.object({
      id: z.string().optional(),
      field: z.string().min(1, 'Field is required'),
      operator: z.string().min(1, 'Operator is required'),
      value: z.string().min(1, 'Value is required')
    })).optional().default([])
  })).min(1, 'At least one destination is required'),
  campaignType: z.nativeEnum(CampaignType),
  bidAmount: z.number().nullable().optional(),
  targetCpa: z.number().nullable().optional(),
  revshareRate: z.number().nullable().optional(),
  daily: z.number().nullable(),
  total: z.number().nullable(),
  dailyUnlimited: z.boolean(),
  totalUnlimited: z.boolean()
}).refine(
  (data) => {
    if (data.sourceType === 'affiliate') {
      return data.affiliateId != null;
    }
    if (data.sourceType === 'adnetwork') {
      return data.adNetworkId != null;
    }
    return true;
  },
  {
    message: "Must select an affiliate when source type is 'affiliate', or an ad network when source type is 'adnetwork'",
    path: ["sourceType"]
  }
).refine(
  (data) => {
    switch (data.campaignType) {
      case CampaignType.CPC:
        return data.bidAmount != null && data.bidAmount > 0;
      case CampaignType.CPA:
        return data.targetCpa != null && data.targetCpa > 0;
      case CampaignType.REVSHARE:
        return data.revshareRate != null && data.revshareRate > 0 && data.revshareRate <= 100;
      default:
        return true;
    }
  },
  {
    message: (data) => {
      switch (data.campaignType) {
        case CampaignType.CPC:
          return "Bid amount is required and must be greater than 0 for CPC campaigns";
        case CampaignType.CPA:
          return "Target CPA is required and must be greater than 0 for CPA campaigns";
        case CampaignType.REVSHARE:
          return "Revenue share rate is required and must be between 0 and 100 for Revenue Share campaigns";
        default:
          return "Invalid campaign type";
      }
    },
    path: ["campaignType"]
  }
)

type ValidatedInput = z.infer<typeof createSchema>

async function logActivity(action: keyof typeof CampaignActivityTypes, details: Record<string, any>, userId?: string) {
  await prisma.activityLog.create({
    data: {
      userId,
      action: CampaignActivityTypes[action],
      details
    }
  })
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
    const search = searchParams.get('search')
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit

    // If fetching a single campaign
    if (id) {
      const campaign = await prisma.campaign.findFirst({
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
          },
          destinations: {
            include: {
              rules: true
            }
          },
          _count: {
            select: { properties: true }
          }
        }
      })

      if (!campaign) {
        return NextResponse.json({ 
          error: { 
            code: ErrorCodes.NOT_FOUND,
            message: 'Campaign not found'
          }
        }, { status: 404 })
      }

      return NextResponse.json({ data: campaign })
    }

    // List campaigns with property-based access control
    const where: Prisma.CampaignWhereInput = {
      properties: {
        some: propertyId ? {
          id: propertyId,
          users: { some: { id: session.user.id } }
        } : {
          users: { some: { id: session.user.id } }
        }
      },
      status: status as CampaignStatus || undefined,
      ...(search ? {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } }
        ]
      } : {})
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          properties: {
            select: { id: true, name: true }
          },
          destinations: {
            include: {
              rules: true
            }
          },
          _count: {
            select: { properties: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.campaign.count({ where })
    ])

    return NextResponse.json({ 
      data: campaigns,
      meta: {
        total,
        page,
        pageSize: limit
      }
    })
  } catch (error) {
    console.error('[CAMPAIGNS_LIST_ERROR]', error)
    return NextResponse.json({ 
      error: { 
        code: ErrorCodes.SERVER_ERROR,
        message: 'Failed to fetch campaigns'
      }
    }, { status: 500 })
  }
}

// Update the campaign create data type
const getCampaignCreateData = async (validated: ValidatedInput, userId: string): Promise<Prisma.CampaignCreateInput> => {
  // Get the source name based on sourceType
  let sourceName = ''
  if (validated.sourceType === 'affiliate' && validated.affiliateId) {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: validated.affiliateId },
      select: { name: true }
    })
    sourceName = affiliate?.name || 'Unknown Affiliate'
  } else if (validated.sourceType === 'adnetwork' && validated.adNetworkId) {
    const adNetwork = await prisma.adNetwork.findUnique({
      where: { id: validated.adNetworkId },
      select: { name: true }
    })
    sourceName = adNetwork?.name || 'Unknown Ad Network'
  }

  return {
    name: validated.name,
    description: validated.description,
    type: validated.type,
    sourceType: validated.sourceType,
    source: sourceName,
    status: validated.status,
    utmSource: validated.utmSource,
    utmMedium: validated.utmMedium,
    utmCampaign: validated.utmCampaign,
    utmContent: validated.utmContent,
    utmTerm: validated.utmTerm,
    countries: validated.countries,
    devices: validated.devices,
    browsers: validated.browsers,
    languages: validated.languages,
    destinationType: validated.destinationType,
    distribution: validated.distribution,
    destinations: {
      create: validated.destinations.map((dest) => ({
        name: dest.name,
        url: dest.url,
        weight: dest.weight,
        isDefault: dest.isDefault,
        rules: dest.rules && dest.rules.length > 0 ? {
          create: dest.rules.map((rule) => ({
            field: rule.field,
            operator: rule.operator,
            value: rule.value
          }))
        } : undefined
      }))
    },
    campaignType: validated.campaignType,
    bidAmount: validated.bidAmount,
    targetCpa: validated.targetCpa,
    revshareRate: validated.revshareRate,
    daily: validated.daily,
    total: validated.total,
    dailyUnlimited: validated.dailyUnlimited,
    totalUnlimited: validated.totalUnlimited,
    affiliate: validated.affiliateId ? { connect: { id: validated.affiliateId } } : undefined,
    adNetwork: validated.adNetworkId ? { connect: { id: validated.adNetworkId } } : undefined,
    properties: {
      connect: validated.propertyIds.map((id) => ({ id }))
    },
    User: {
      connect: { id: userId }
    }
  }
}

// Update the campaign update data type
const getCampaignUpdateData = async (validated: ValidatedInput): Promise<Prisma.CampaignUpdateInput> => {
  // Get the source name based on sourceType
  let sourceName = ''
  if (validated.sourceType === 'affiliate' && validated.affiliateId) {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: validated.affiliateId },
      select: { name: true }
    })
    sourceName = affiliate?.name || 'Unknown Affiliate'
  } else if (validated.sourceType === 'adnetwork' && validated.adNetworkId) {
    const adNetwork = await prisma.adNetwork.findUnique({
      where: { id: validated.adNetworkId },
      select: { name: true }
    })
    sourceName = adNetwork?.name || 'Unknown Ad Network'
  }

  return {
    name: validated.name,
    description: validated.description,
    type: validated.type,
    sourceType: validated.sourceType,
    source: sourceName,
    status: validated.status,
    utmSource: validated.utmSource,
    utmMedium: validated.utmMedium,
    utmCampaign: validated.utmCampaign,
    utmContent: validated.utmContent,
    utmTerm: validated.utmTerm,
    countries: validated.countries,
    devices: validated.devices,
    browsers: validated.browsers,
    languages: validated.languages,
    destinationType: validated.destinationType,
    distribution: validated.distribution,
    destinations: {
      deleteMany: {},
      create: validated.destinations.map((dest) => ({
        name: dest.name,
        url: dest.url,
        weight: dest.weight,
        isDefault: dest.isDefault,
        rules: dest.rules && dest.rules.length > 0 ? {
          create: dest.rules.map((rule) => ({
            field: rule.field,
            operator: rule.operator,
            value: rule.value
          }))
        } : undefined
      }))
    },
    campaignType: validated.campaignType,
    bidAmount: validated.bidAmount,
    targetCpa: validated.targetCpa,
    revshareRate: validated.revshareRate,
    daily: validated.daily,
    total: validated.total,
    dailyUnlimited: validated.dailyUnlimited,
    totalUnlimited: validated.totalUnlimited,
    affiliate: validated.affiliateId ? { connect: { id: validated.affiliateId } } : undefined,
    adNetwork: validated.adNetworkId ? { connect: { id: validated.adNetworkId } } : undefined,
    properties: {
      set: validated.propertyIds.map((id) => ({ id }))
    }
  }
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
        context: 'CREATE_CAMPAIGN',
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

    // Get campaign data with source name
    const campaignData = await getCampaignCreateData(validated, session.user.id)

    const campaign = await prisma.campaign.create({
      data: campaignData,
      include: {
        properties: {
          select: { id: true, name: true }
        },
        affiliate: {
          select: { id: true, name: true }
        },
        adNetwork: {
          select: { id: true, name: true }
        },
        destinations: {
          include: {
            rules: true
          }
        }
      }
    })

    await logActivity('CREATE', {
      campaignId: campaign.id,
      campaignName: campaign.name,
      propertyIds: validated.propertyIds
    }, session.user.id)

    return NextResponse.json({ data: campaign })
  } catch (error) {
    console.error('[CAMPAIGNS_CREATE_ERROR]', error)
    
    const session = await getServerSession(authConfig)
    
    if (session?.user?.id) {
      await logActivity('ERROR', {
        context: 'CREATE_CAMPAIGN',
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
        message: 'Failed to create campaign'
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

    // First verify the user has access to the campaign through any of its current properties
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: validated.id,
        properties: {
          some: {
            users: { some: { id: session.user.id } }
          }
        }
      },
      include: {
        destinations: {
          include: {
            rules: true
          }
        }
      }
    })

    if (!existingCampaign) {
      return NextResponse.json({ 
        error: { 
          code: ErrorCodes.ACCESS_DENIED,
          message: 'Campaign not found or access denied'
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
        context: 'UPDATE_CAMPAIGN',
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

    // Get campaign data with source name
    const campaignData = await getCampaignUpdateData(validated)

    const campaign = await prisma.campaign.update({
      where: { id: validated.id },
      data: campaignData,
      include: {
        properties: {
          select: { id: true, name: true }
        },
        affiliate: {
          select: { id: true, name: true }
        },
        adNetwork: {
          select: { id: true, name: true }
        },
        destinations: {
          include: {
            rules: true
          }
        }
      }
    })

    await logActivity('UPDATE', {
      campaignId: campaign.id,
      campaignName: campaign.name,
      propertyIds: validated.propertyIds,
      changes: {
        before: existingCampaign,
        after: campaign
      }
    }, session.user.id)

    return NextResponse.json({ data: campaign })
  } catch (error) {
    console.error('[CAMPAIGNS_UPDATE_ERROR]', error)
    
    const session = await getServerSession(authConfig)
    
    if (session?.user?.id) {
      await logActivity('ERROR', {
        context: 'UPDATE_CAMPAIGN',
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
        message: 'Failed to update campaign'
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
          message: 'Campaign ID and Property ID are required'
        }
      }, { status: 400 })
    }

    // Verify campaign exists and user has access through property
    const campaign = await prisma.campaign.findFirst({
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

    if (!campaign) {
      return NextResponse.json({ 
        error: { 
          code: ErrorCodes.NOT_FOUND,
          message: 'Campaign not found or access denied'
        }
      }, { status: 404 })
    }

    // Remove the connection to the specific property
    await prisma.campaign.update({
      where: { id },
      data: {
        properties: {
          disconnect: { id: propertyId }
        }
      }
    })

    await logActivity('DELETE', {
      campaignId: id,
      campaignName: campaign.name,
      propertyId
    }, session.user.id)

    return NextResponse.json({ 
      data: null,
      meta: {
        message: 'Campaign removed from property successfully'
      }
    })
  } catch (error) {
    console.error('[CAMPAIGNS_DELETE_ERROR]', error)
    
    const session = await getServerSession(authConfig)
    
    if (session?.user?.id) {
      await logActivity('ERROR', {
        context: 'DELETE_CAMPAIGN',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        propertyId: new URL(request.url).searchParams.get('propertyId')
      }, session.user.id)
    }

    return NextResponse.json({
      error: {
        code: ErrorCodes.SERVER_ERROR,
        message: 'Failed to delete campaign'
      }
    }, { status: 500 })
  }
} 