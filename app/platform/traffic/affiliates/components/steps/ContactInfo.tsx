"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HelpCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { affiliateFormSchema, type StepProps } from '../../types'

export function ContactInfo({ form, setForm }: StepProps) {
  const handleContactChange = (field: string, value: string) => {
    setForm({
      ...form,
      contact: {
        ...form.contact,
        [field]: value
      }
    })
  }

  // Validate individual fields
  const validateField = (field: keyof typeof form.contact, value: string) => {
    try {
      const fieldSchema = affiliateFormSchema.shape.contact.shape[field]
      fieldSchema.parse(value)
      return null
    } catch (error) {
      if (error instanceof Error) {
        // Extract the specific error message from Zod
        const zodError = JSON.parse(error.message)
        return zodError[0]?.message || "Invalid input"
      }
      return "Invalid input"
    }
  }

  const emailError = form.contact.email ? validateField('email', form.contact.email) : null
  const phoneError = form.contact.phone ? validateField('phone', form.contact.phone) : null
  const websiteError = form.contact.website ? validateField('website', form.contact.website) : null
  const contactNameError = !form.contact.contactName ? "Contact name is required" : null

  return (
    <div className="space-y-8">
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Contact Information</p>
            <p className="mt-1">
              Enter the contact details for this affiliate
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div>
          <Label htmlFor="contactName" className="required">Contact Name</Label>
          <Input
            id="contactName"
            value={form.contact.contactName}
            onChange={(e) => handleContactChange('contactName', e.target.value)}
            placeholder="Enter contact name"
            className={contactNameError ? "border-red-200" : ""}
          />
          {contactNameError && (
            <p className="text-sm text-red-600 mt-1">{contactNameError}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            The primary contact person for this affiliate
          </p>
        </div>

        <div>
          <Label htmlFor="email" className="required">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.contact.email}
            onChange={(e) => handleContactChange('email', e.target.value)}
            placeholder="Enter email address"
            className={emailError ? "border-red-200" : ""}
          />
          {emailError && (
            <p className="text-sm text-red-600 mt-1">{emailError}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Main email address for communication
          </p>
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={form.contact.phone}
            onChange={(e) => handleContactChange('phone', e.target.value)}
            placeholder="Enter phone number"
            className={phoneError ? "border-red-200" : ""}
          />
          {phoneError && (
            <p className="text-sm text-red-600 mt-1">{phoneError}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Optional: Phone number for contact
          </p>
        </div>

        <div>
          <Label htmlFor="skype">Skype</Label>
          <Input
            id="skype"
            value={form.contact.skype}
            onChange={(e) => handleContactChange('skype', e.target.value)}
            placeholder="Enter Skype ID"
          />
          <p className="text-sm text-gray-500 mt-1">
            Optional: Skype ID for instant messaging
          </p>
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={form.contact.website}
            onChange={(e) => handleContactChange('website', e.target.value)}
            placeholder="Enter website URL"
            className={websiteError ? "border-red-200" : ""}
          />
          {websiteError && (
            <p className="text-sm text-red-600 mt-1">{websiteError}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Optional: Affiliate's website or landing page
          </p>
        </div>
      </div>
    </div>
  )
} 