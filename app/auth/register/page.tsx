"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signIn } from "next-auth/react"
import { redirect } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isFirstUser, setIsFirstUser] = useState<boolean | null>(null)

  const checkFirstUser = useCallback(async () => {
    try {
      const res = await fetch('/api/users?count=true')
      if (!res.ok) throw new Error('Failed to check registration status')
      
      const { data, error } = await res.json()
      if (error) throw new Error(error.message)
      
      setIsFirstUser(data.count === 0)
    } catch (error) {
      console.error('First user check failed:', error)
      setIsFirstUser(false)
      
      // Log error per standards
      fetch('/api/manage/activity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: '[UI_ERROR] FIRST_USER_CHECK',
          details: {
            component: 'RegisterPage',
            message: error instanceof Error ? error.message : 'Unknown error'
          }
        })
      }).catch(console.error) // Prevent unhandled rejection
    }
  }, [])

  useEffect(() => {
    checkFirstUser()
  }, [checkFirstUser])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    try {
      // Register user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to register')
      }

      // Sign in after registration
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      if (signInResult?.error) {
        throw new Error(signInResult.error)
      }

      // Wait for session to be established
      let retries = 0
      const maxRetries = 3
      const verifySession = async (): Promise<void> => {
        try {
          console.log(`Verifying session (attempt ${retries + 1}/${maxRetries})`)
          const res = await fetch('/api/auth/verify')
          const json = await res.json()
          
          console.log('Verify response:', json)
          
          if (!res.ok) {
            throw new Error(json.error?.message || 'Session verification failed')
          }
          
          if (json.error) {
            throw new Error(json.error.message)
          }
          
          // During registration, data.user may not exist yet
          if (!json.data) {
            console.log('No user data yet, retrying...')
            if (retries < maxRetries) {
              retries++
              await new Promise(resolve => setTimeout(resolve, 1000))
              return verifySession()
            }
            throw new Error('Session not established after retries')
          }
          
          // Status-based routing
          if (json.data.isMaster) {
            console.log('Redirecting master user to properties page')
            router.push('/platform/manage/properties/new')
          } else {
            console.log('Redirecting regular user to pending review')
            router.push('/auth/pending-review')
          }
        } catch (error) {
          console.error('Session verification attempt failed:', error)
          if (retries < maxRetries) {
            retries++
            await new Promise(resolve => setTimeout(resolve, 1000))
            return verifySession()
          }
          
          toast({
            title: "Failed to verify session",
            description: "Please try logging in again.",
            variant: "destructive"
          })
          console.error('All session verification attempts failed:', error)
          router.push('/auth/login')
        }
      }

      await verifySession()
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Failed to register')
      
      // Log error per standards
      fetch('/api/manage/activity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: '[UI_ERROR] REGISTRATION_FAILED',
          details: {
            component: 'RegisterPage',
            message: error instanceof Error ? error.message : 'Unknown error'
          }
        })
      }).catch(console.error) // Prevent unhandled rejection
    } finally {
      setIsLoading(false)
    }
  }

  if (isFirstUser === null) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
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
          {isFirstUser ? 'Setup your platform' : 'Create your account'}
        </h2>
        {isFirstUser ? (
          <Alert className="mt-4 border-yellow-600/20 bg-yellow-500/10 text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You are the first user. You will be set as the platform administrator.
            </AlertDescription>
          </Alert>
        ) : (
          <p className="mt-2 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-500 hover:text-blue-400">
              Sign in
            </Link>
          </p>
        )}
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Full name
              </label>
              <div className="mt-1">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="bg-[#0a0f1a] border-[#1e293b] text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="bg-[#0a0f1a] border-[#1e293b] text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="bg-[#0a0f1a] border-[#1e293b] text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : (isFirstUser ? "Setup Platform" : "Create account")}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}