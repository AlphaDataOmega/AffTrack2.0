"use client"

import { Card } from "@/components/ui/card"
import { HelpCircle, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import countries from "@/lib/data/countries"

interface TargetingSetupProps {
  form: any
  setForm: (form: any) => void
}

const DEVICES = [
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" }
]

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" }
]

const DAYS = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" }
]

export function TargetingSetup({ form, setForm }: TargetingSetupProps) {
  const updateTargeting = (field: string, value: any) => {
    setForm({
      ...form,
      targeting: {
        ...form.targeting,
        [field]: value
      }
    })
  }

  const toggleDevice = (device: string) => {
    const devices = form.targeting.devices.includes(device)
      ? form.targeting.devices.filter((d: string) => d !== device)
      : [...form.targeting.devices, device]
    updateTargeting('devices', devices)
  }

  const toggleDay = (day: string) => {
    const days = form.targeting.timeSchedule?.days.includes(day)
      ? form.targeting.timeSchedule.days.filter((d: string) => d !== day)
      : [...(form.targeting.timeSchedule?.days || []), day]
    setForm({
      ...form,
      targeting: {
        ...form.targeting,
        timeSchedule: {
          ...form.targeting.timeSchedule,
          days
        }
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Targeting Settings</p>
            <p className="mt-1">
              Define who should see this ad placement
            </p>
          </div>
        </div>
      </Card>

      {/* Device Targeting */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Device Targeting</h3>
        <div className="flex flex-wrap gap-2">
          {DEVICES.map((device) => (
            <Button
              key={device.value}
              type="button"
              variant={form.targeting.devices.includes(device.value) ? "default" : "outline"}
              onClick={() => toggleDevice(device.value)}
              className={form.targeting.devices.includes(device.value) ? "bg-blue-500" : ""}
            >
              {device.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Geo Targeting */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Geographic Targeting</h3>
        <Select
          value={form.targeting.countries[0]}
          onValueChange={(value) => updateTargeting('countries', [value])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Language Targeting */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Language</h3>
        <Select
          value={form.targeting.languages[0]}
          onValueChange={(value) => updateTargeting('languages', [value])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Time Schedule</h3>
          <Switch
            checked={!!form.targeting.timeSchedule}
            onCheckedChange={(checked) => {
              if (checked) {
                updateTargeting('timeSchedule', { days: [], startTime: '', endTime: '' })
              } else {
                const { timeSchedule, ...rest } = form.targeting
                setForm({ ...form, targeting: rest })
              }
            }}
          />
        </div>

        {form.targeting.timeSchedule && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={form.targeting.timeSchedule.days.includes(day.value) ? "default" : "outline"}
                  onClick={() => toggleDay(day.value)}
                  className={form.targeting.timeSchedule.days.includes(day.value) ? "bg-blue-500" : ""}
                >
                  {day.label.slice(0, 3)}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={form.targeting.timeSchedule.startTime}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      targeting: {
                        ...form.targeting,
                        timeSchedule: {
                          ...form.targeting.timeSchedule,
                          startTime: e.target.value
                        }
                      }
                    })
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <Input
                  type="time"
                  value={form.targeting.timeSchedule.endTime}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      targeting: {
                        ...form.targeting,
                        timeSchedule: {
                          ...form.targeting.timeSchedule,
                          endTime: e.target.value
                        }
                      }
                    })
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 