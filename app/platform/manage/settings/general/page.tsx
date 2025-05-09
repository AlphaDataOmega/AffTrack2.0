"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ErrorBoundary } from 'react-error-boundary'
import { z } from "zod"

interface ProfileForm {
  name: string
  timezone: string
}

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" }
] as const

const DEFAULT_FORM: ProfileForm = {
  name: '',
  timezone: 'America/New_York'
}

// Add form validation type
const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  timezone: z.string().refine((tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz })
      return true
    } catch {
      return false
    }
  }, "Invalid timezone")
})

export default function GeneralSettingsPage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<ProfileForm>>({})
  
  const [form, setForm] = useState<ProfileForm>(() => ({
    name: session?.user?.name || '',
    timezone: session?.user?.timezone || 'America/New_York'
  }))

  useEffect(() => {
    if (session?.user) {
      setForm(current => ({
        name: session.user.name || current.name,
        timezone: session.user.timezone || current.timezone
      }))
    }
  }, [session?.user])

  const handleSubmit = async () => {
    setIsLoading(true)
    setErrors({})

    try {
      // Validate form data
      const validated = UpdateProfileSchema.safeParse(form)
      if (!validated.success) {
        setErrors(validated.error.formErrors.fieldErrors)
        throw new Error('Invalid form data')
      }

      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated.data)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Update failed')
      }

      const { data } = await response.json()

      // Update the session with new user data
      await update({
        ...session,
        user: {
          ...session?.user,
          ...data
        }
      })
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      })
    } catch (error) {
      console.error('[PROFILE_UPDATE]', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Details</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="max-w-md"
                error={errors.name} 
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={form.timezone}
                onValueChange={(value) => setForm({...form, timezone: value})}
                error={errors.timezone}
              >
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timezone && (
                <p className="text-sm text-red-500 mt-1">{errors.timezone}</p>
              )}
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button 
            className="bg-blue-500 hover:bg-blue-600"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </ErrorBoundary>
    </div>
  )
}