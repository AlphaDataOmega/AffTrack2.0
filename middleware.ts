import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from "next-auth/jwt"
import { db } from "@/lib/prisma"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all platform routes
  if (pathname.startsWith('/platform')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    // Validate session exists
    if (!token) {
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
      )
    }

    // Remove database check from middleware
    if (!token.id || !token.status) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.delete('next-auth.session-token')
      return response
    }

    // Validate status from token
    if (token.status === 'PENDING') {
      return NextResponse.redirect(new URL('/auth/pending-review', request.url))
    }

    if (token.status !== 'ACTIVE') {
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.delete('next-auth.session-token')
      return response
    }

    // Property check remains in platform routes
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/platform/:path*',
    '/auth/:path*',
    '/api/((?!users$).*)'  // Exclude /api/users from middleware
  ]
} 