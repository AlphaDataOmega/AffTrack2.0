"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AuthError() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  useEffect(() => {
    // If no error is present, redirect to login
    if (!error) {
      router.push("/auth/login")
    }
  }, [error, router])

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration. Please try again later."
      case "AccessDenied":
        return "Access denied. You don't have permission to sign in."
      case "Verification":
        return "The verification link is no longer valid. Please request a new one."
      case "DatabaseError":
        return "Database error occurred. Please try again later."
      default:
        return "An error occurred during authentication. Please try again."
    }
  }

  if (!error) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
              AffTrack
            </span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          Authentication Error
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10 bg-[#151b2e] border-[#1e293b]">
          <div className="space-y-6">
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {getErrorMessage(error)}
            </div>

            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Return to Sign In
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
} 