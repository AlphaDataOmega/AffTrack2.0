import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

interface RateLimitConfig {
  maxRequests: number  // Maximum requests per window
  windowMs: number     // Time window in milliseconds
}

const ipRequestMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(config: RateLimitConfig) {
  return async function rateLimitMiddleware() {
    const headersList = headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    
    const currentRequests = ipRequestMap.get(ip)
    
    // If no requests yet or window expired, reset counter
    if (!currentRequests || now > currentRequests.resetTime) {
      ipRequestMap.set(ip, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return null
    }
    
    // Increment counter
    currentRequests.count++
    
    // Check if over limit
    if (currentRequests.count > config.maxRequests) {
      return NextResponse.json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later'
        }
      }, { status: 429 })
    }
    
    return null
  }
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  Array.from(ipRequestMap.entries()).forEach(([ip, data]) => {
    if (now > data.resetTime) {
      ipRequestMap.delete(ip)
    }
  })
}, 60000) // Clean up every minute 