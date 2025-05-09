"use client"

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  type PropertyForm,
  statusConfig,
  industries,
  validateProperty
} from '../../config'

type ValidationErrors = Record<string, string>

interface BasicInfoProps {
  form: PropertyForm
  setForm: (form: PropertyForm) => void
}

export function BasicInfo({ form, setForm }: BasicInfoProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [tagInput, setTagInput] = useState('')

  const updateField = (field: keyof PropertyForm, value: string) => {
    const newForm = {
      ...form,
      [field]: value
    }
    
    const validation = validateProperty(newForm)
    setErrors(validation.errors)
    
    setForm(newForm)
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim()
      
      if (!/^[a-zA-Z0-9-_]+$/.test(newTag)) {
        setErrors(prev => ({
          ...prev,
          tags: "Tags can only contain letters, numbers, hyphens, and underscores"
        }))
        return
      }
      
      if (newTag.length > 50) {
        setErrors(prev => ({
          ...prev,
          tags: "Tag cannot exceed 50 characters"
        }))
        return
      }

      if (!form.tags.includes(newTag)) {
        setForm({
          ...form,
          tags: [...form.tags, newTag]
        })
        setErrors(prev => {
          const { tags, ...rest } = prev
          return rest
        })
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setForm({
      ...form,
      tags: form.tags.filter(tag => tag !== tagToRemove)
    })
  }

  return (
    <div className="space-y-8">
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Property Information</p>
            <p className="mt-1">
              Enter the basic details about your property. Fields marked with * are required.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Property Name <span className="text-red-500">*</span>
          </Label>
          <Input
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="My Awesome Property"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Domain <span className="text-red-500">*</span>
          </Label>
          <Input
            value={form.domain}
            onChange={(e) => updateField('domain', e.target.value)}
            placeholder="example.com"
            className={errors.domain ? 'border-red-500' : ''}
          />
          {errors.domain ? (
            <p className="mt-1 text-sm text-red-500">{errors.domain}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              Enter the domain without http:// or https:// (e.g., example.com)
            </p>
          )}
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={form.status}
            onValueChange={(value) => updateField('status', value)}
          >
            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-500">{errors.status}</p>
          )}
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </Label>
          <Textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe your property..."
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Industry
          </Label>
          <Select
            value={form.industry}
            onValueChange={(value) => updateField('industry', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </Label>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tags (press Enter)"
            className={errors.tags ? 'border-red-500' : ''}
          />
          <p className="mt-1 text-sm text-gray-500">
            Add optional tags to categorize this property
          </p>
          
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {form.tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md"
                >
                  <span className="text-sm">{tag}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-blue-100"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {errors.tags && (
            <p className="mt-1 text-sm text-red-500">{errors.tags}</p>
          )}
        </div>
      </div>
    </div>
  )
} 