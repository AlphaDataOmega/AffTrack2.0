import { z } from "zod"

// Activity Context Types
export const ActivityContext = {
  PROPERTY: '[PROPERTY]',
  NETWORK: '[NETWORK]',
  CAMPAIGN: '[CAMPAIGN]',
  AFFILIATE: '[AFFILIATE]',
  CLIENT: '[CLIENT]',
  SYSTEM: '[SYSTEM]',
  AUTH: '[AUTH]'
} as const

// Activity Operation Types
export const ActivityOperation = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  ERROR: 'ERROR',
  INFO: 'INFO'
} as const

// Activity Details Schema
export const activityDetailsSchema = z.object({
  component: z.string().optional(),
  message: z.string().optional(),
  stack: z.string().optional(),
  retryCount: z.number().optional(),
  userAgent: z.string().optional(),
  propertyId: z.string().optional(),
  networkId: z.string().optional(),
  campaignId: z.string().optional(),
  changes: z.record(z.any()).optional(),
  path: z.string().optional()
})

// Activity Schema matching Prisma model
export const activitySchema = z.object({
  action: z.string(),
  details: activityDetailsSchema.optional()
})

export type ActivityDetails = z.infer<typeof activityDetailsSchema>

// Activity Logger Function
export async function logActivity(action: string, details?: ActivityDetails) {
  try {
    const input = {
      action,
      details
    }

    const validated = activitySchema.safeParse(input)
    if (!validated.success) {
      console.error('[ACTIVITY_LOG_ERROR] Invalid activity format:', validated.error)
      return
    }

    const response = await fetch('/api/manage/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    })

    if (!response.ok) {
      throw new Error('Failed to log activity')
    }
  } catch (error) {
    console.error('[ACTIVITY_LOG_ERROR]', error)
  }
}

// Helper function for error logging
export async function logError(context: keyof typeof ActivityContext, error: unknown, details?: Partial<ActivityDetails>) {
  const errorDetails: ActivityDetails = {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    ...details
  }

  await logActivity(`${ActivityContext[context]} ${ActivityOperation.ERROR}`, errorDetails)
}

// Client Error Logger
export async function logClientError(error: Error, componentStack: string, path: string) {
  await logActivity(`${ActivityContext.CLIENT} ${ActivityOperation.ERROR}`, {
    message: error.message,
    stack: error.stack,
    path,
    component: 'ErrorBoundary',
    userAgent: window.navigator.userAgent
  })
}