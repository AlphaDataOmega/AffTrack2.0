"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function VerifyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [timer, setTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(countdown)
    } else if (timer === 0 && !canResend) {
      setCanResend(true)
    }
  }, [timer, canResend])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const code = formData.get("code") as string

    try {
      // TODO: Implement verification logic
      console.log("Verification attempt:", { code })
      router.push("/dashboard/analyze/overview")
    } catch (err) {
      setError("Invalid verification code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      // TODO: Implement resend logic
      console.log("Resending verification code")
      setTimer(30)
      setCanResend(false)
    } catch (err) {
      setError("Failed to resend code")
    } finally {
      setIsLoading(false)
    }
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
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          We sent a verification code to your email address
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10 bg-[#151b2e] border-[#1e293b]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-300">
                Verification code
              </label>
              <div className="mt-1">
                <Input
                  id="code"
                  name="code"
                  type="text"
                  required
                  className="bg-[#0a0f1a] border-[#1e293b] text-white placeholder:text-gray-500 text-center tracking-[0.5em] text-lg"
                  placeholder="••••••"
                  maxLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify email"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                className="text-blue-500 hover:text-blue-400"
                disabled={!canResend || isLoading}
                onClick={handleResendCode}
              >
                {canResend ? (
                  "Resend code"
                ) : (
                  `Resend code in ${timer}s`
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-gray-300"
              onClick={() => router.push("/auth/login")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}