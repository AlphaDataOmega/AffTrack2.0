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
  CONSTANTS
} from '@/app/platform/traffic/adnetworks/config'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Auth & validation
    const session = await validateAuth(await getServerSession(authConfig))
    
    // 2. Business logic
    const network = await prisma.adNetwork.findFirst({
      where: {
        id: params.id,
        properties: {
          some: {
            users: { some: { id: session.user.id } }
          }
        },
        status: { not: NetworkStatusEnum.DELETED }
      },
      include: QUERY_CONFIG.networks.include
    })

    if (!network) {
      throw {
        code: ErrorCodes.NOT_FOUND,
        message: ERROR_MESSAGES.networks.notFound
      }
    }

    // 3. Response
    return NextResponse.json<ApiResponse<AdNetwork>>({ 
      data: formatNetwork(network)
    })

  } catch (error) {
    const apiError = handleApiError(error)
    await safeLogActivity(NetworkActivityTypes.ERROR, {
      component: ACTIVITY_COMPONENTS.API.NETWORKS_ID,
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Auth & validation
    const session = await validateAuth(await getServerSession(authConfig))
    const input = networkFormSchema.parse(await request.json())
    
    // 2. Business logic
    const network = await prisma.adNetwork.update({
      where: { 
        id: params.id,
        properties: {
          some: {
            users: { some: { id: session.user.id } }
          }
        }
      },
      data: formatUpdateInput(input),
      include: QUERY_CONFIG.networks.include
    })

    if (!network) {
      throw {
        code: ErrorCodes.NOT_FOUND,
        message: ERROR_MESSAGES.networks.notFound
      }
    }

    // 3. Activity logging
    await safeLogActivity(NetworkActivityTypes.UPDATE, {
      component: ACTIVITY_COMPONENTS.API.NETWORKS_ID,
      message: CONSTANTS.networks.messages.updated,
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
      component: ACTIVITY_COMPONENTS.API.NETWORKS_ID,
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Auth & validation
    const session = await validateAuth(await getServerSession(authConfig))
    
    // 2. Business logic
    const network = await prisma.adNetwork.update({
      where: { 
        id: params.id,
        properties: {
          some: {
            users: { some: { id: session.user.id } }
          }
        }
      },
      data: { status: NetworkStatusEnum.DELETED },
      include: QUERY_CONFIG.networks.include
    })

    if (!network) {
      throw {
        code: ErrorCodes.NOT_FOUND,
        message: ERROR_MESSAGES.networks.notFound
      }
    }

    // 3. Activity logging
    await safeLogActivity(NetworkActivityTypes.DELETE, {
      component: ACTIVITY_COMPONENTS.API.NETWORKS_ID,
      message: CONSTANTS.networks.messages.deleted,
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
      component: ACTIVITY_COMPONENTS.API.NETWORKS_ID,
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