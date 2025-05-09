export const dynamic = 'force-dynamic'

import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { headers } from 'next/headers'
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/lib/auth"
import { 
  NetworkActivityTypes, 
  NetworkStatusEnum,
  ErrorCodes,
  API_URLS,
  QUERY_CONFIG,
  ACTIVITY_COMPONENTS,
  ERROR_MESSAGES,
  handleApiError,
  validateAuth,
  formatUpdateInput,
  formatNetwork,
  errorResponse,
  safeLogActivity,
  networkFormSchema,
  type ApiResponse,
  type AdNetwork,
  type AdNetworkCreateInput,
  CONSTANTS
} from '@/app/platform/traffic/adnetworks/config'

export async function GET(request: Request) {
  try {
    // 1. Auth & validation
    const session = await validateAuth(await getServerSession(authConfig))
    
    // Parse query params
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const search = searchParams.get('search')
    const network = searchParams.get('network')

    // 2. Business logic
    const networks = await prisma.adNetwork.findMany({
      where: {
        AND: [
          // Property access control
          {
            properties: {
              some: {
                users: { some: { id: session.user.id } }
              }
            }
          },
          // Status check
          { status: { not: NetworkStatusEnum.DELETED } },
          // Property filter
          propertyId ? {
            properties: { some: { id: propertyId } }
          } : {},
          // Search filter
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { accountId: { contains: search, mode: 'insensitive' } }
            ]
          } : {},
          // Network type filter
          network && network !== 'all' ? { network } : {}
        ]
      },
      orderBy: QUERY_CONFIG.networks.orderBy,
      include: QUERY_CONFIG.networks.include
    })

    // 3. Response
    return NextResponse.json<ApiResponse<AdNetwork[]>>({ 
      data: networks.map(formatNetwork)
    })

  } catch (error) {
    const apiError = handleApiError(error)
    await safeLogActivity(NetworkActivityTypes.ERROR, {
      component: ACTIVITY_COMPONENTS.API.NETWORKS,
      message: apiError.message,
      error: error instanceof Error ? error.message : 'Unknown error',
      ipAddress: headers().get('x-forwarded-for') || 'unknown',
      userAgent: headers().get('user-agent') || 'unknown'
    })
    return errorResponse(
      apiError.code,
      apiError.message,
      apiError.details
    )
  }
}

export async function POST(request: Request) {
  try {
    // 1. Auth & validation
    const session = await validateAuth(await getServerSession(authConfig))
    const input = networkFormSchema.parse(await request.json())
    
    // 2. Business logic
    const { basic, settings, tracking } = input
    
    const createInput: AdNetworkCreateInput = {
      name: basic.name,
      description: basic.description,
      network: basic.network,
      accountId: basic.accountId,
      status: NetworkStatusEnum.ACTIVE,
      tags: basic.tags,
      // Settings
      currency: settings.currency,
      timezone: settings.timezone,
      username: settings.username,
      password: settings.password,
      loginUrl: settings.loginUrl,
      // Tracking
      tracking: {
        enableUploads: tracking.enableUploads,
        enablePostback: tracking.enablePostback,
        uploadClickIdParam: tracking.uploadClickIdParam,
        postbackUrl: tracking.postbackUrl,
        postbackClickIdParam: tracking.postbackClickIdParam,
        postbackClickIdValue: tracking.postbackClickIdValue,
        customParameters: tracking.customParameters
      },
      // Relations
      properties: {
        connect: basic.propertyIds.map(id => ({ id }))
      },
      user: {
        connect: { id: session.user.id }
      }
    }

    const network = await prisma.adNetwork.create({
      data: createInput,
      include: QUERY_CONFIG.networks.include
    })

    // 3. Activity logging
    await safeLogActivity(NetworkActivityTypes.CREATE, {
      component: ACTIVITY_COMPONENTS.API.NETWORKS,
      message: CONSTANTS.networks.messages.created,
      networkId: network.id,
      networkName: network.name,
      networkType: network.network,
      ipAddress: headers().get('x-forwarded-for') || 'unknown',
      userAgent: headers().get('user-agent') || 'unknown'
    })

    // 4. Response
    return NextResponse.json<ApiResponse<AdNetwork>>({ 
      data: formatNetwork(network)
    })

  } catch (error) {
    const apiError = handleApiError(error)
    await safeLogActivity(NetworkActivityTypes.ERROR, {
      component: ACTIVITY_COMPONENTS.API.NETWORKS,
      message: apiError.message,
      error: error instanceof Error ? error.message : 'Unknown error',
      ipAddress: headers().get('x-forwarded-for') || 'unknown',
      userAgent: headers().get('user-agent') || 'unknown'
    })
    return errorResponse(
      apiError.code,
      apiError.message,
      apiError.details
    )
  }
} 
