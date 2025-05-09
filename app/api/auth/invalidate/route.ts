import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })
    
    // Clear all auth-related cookies
    ['next-auth.session-token', 'next-auth.csrf-token'].forEach(cookie => {
      response.cookies.delete(cookie)
    })
    
    return response
  } catch (error) {
    console.error('[AUTH_INVALIDATE]', error)
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    )
  }
} 