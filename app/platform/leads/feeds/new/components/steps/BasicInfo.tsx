"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BasicInfoProps {
  form: any
  setForm: (form: any) => void
}

export function BasicInfo({ form, setForm }: BasicInfoProps) {
  const updateBasic = (field: string, value: string) => {
    setForm({
      ...form,
      basic: {
        ...form.basic,
        [field]: value
      }
    })
  }

  const addTag = (tag: string) => {
    if (tag && !form.basic.tags?.includes(tag)) {
      setForm({
        ...form,
        basic: {
          ...form.basic,
          tags: [...(form.basic.tags || []), tag]
        }
      })
    }
  }

  const removeTag = (tagToRemove: string) => {
    setForm({
      ...form,
      basic: {
        ...form.basic,
        tags: form.basic.tags?.filter((tag: string) => tag !== tagToRemove)
      }
    })
  }

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault()
      addTag(e.currentTarget.value)
      e.currentTarget.value = ''
    }
  }

  return (
    <div className="space-y-8">
      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Feed Information</p>
            <p className="mt-1">
              Enter the basic details about your data feed source
            </p>
          </div>
        </div>
      </Card>

      {/* Feed Info */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Feed Name
            <span className="text-red-500">*</span>
          </label>
          <Input
            value={form.basic.name}
            onChange={(e) => updateBasic('name', e.target.value)}
            placeholder="Enter feed name"
          />
          <p className="mt-1 text-sm text-gray-500">
            A descriptive name for this data feed
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source
            <span className="text-red-500">*</span>
          </label>
          <Input
            value={form.basic.source}
            onChange={(e) => updateBasic('source', e.target.value)}
            placeholder="Enter data source"
          />
          <p className="mt-1 text-sm text-gray-500">
            The provider or origin of this data feed
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feed Type
              <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.basic.type}
              onValueChange={(value) => updateBasic('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select feed type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api">REST API</SelectItem>
                <SelectItem value="csv">CSV Import</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="ftp">FTP/SFTP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vertical
              <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.basic.vertical}
              onValueChange={(value) => updateBasic('vertical', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vertical" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="mortgage">Mortgage</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="solar">Solar</SelectItem>
                <SelectItem value="home_services">Home Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            value={form.basic.description}
            onChange={(e) => updateBasic('description', e.target.value)}
            placeholder="Enter feed description"
            className="min-h-[100px]"
          />
          <p className="mt-1 text-sm text-gray-500">
            Additional details about this data feed
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <Input
            type="text"
            placeholder="Add tags (press Enter)"
            onKeyDown={handleTagInput}
          />
          <p className="mt-1 text-sm text-gray-500">
            Add tags to categorize this feed
          </p>
          
          {form.basic.tags && form.basic.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {form.basic.tags.map((tag: string) => (
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
        </div>
      </div>
    </div>
  )
} 