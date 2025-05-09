"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { HelpCircle, Plus, X } from "lucide-react"

interface MappingProps {
  form: any
  setForm: (form: any) => void
}

export function Mapping({ form, setForm }: MappingProps) {
  const addField = () => {
    setForm({
      ...form,
      mapping: {
        ...form.mapping,
        fields: [
          ...(form.mapping.fields || []),
          { source: '', target: '', required: false, transform: '' }
        ]
      }
    })
  }

  const updateField = (index: number, field: string, value: any) => {
    const newFields = [...form.mapping.fields]
    newFields[index] = {
      ...newFields[index],
      [field]: value
    }
    setForm({
      ...form,
      mapping: {
        ...form.mapping,
        fields: newFields
      }
    })
  }

  const removeField = (index: number) => {
    const newFields = form.mapping.fields.filter((_: any, i: number) => i !== index)
    setForm({
      ...form,
      mapping: {
        ...form.mapping,
        fields: newFields
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
            <p className="font-medium">Field Mapping</p>
            <p className="mt-1">
              Map source data fields to your system fields
            </p>
          </div>
        </div>
      </Card>

      {/* Field Mappings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Field Mappings</h3>
            <p className="text-sm text-gray-500">
              Define how fields from the source map to your system
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addField}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </Button>
        </div>

        <div className="space-y-4">
          {form.mapping.fields?.map((field: any, index: number) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-4">
                <Input
                  placeholder="Source field"
                  value={field.source}
                  onChange={(e) => updateField(index, 'source', e.target.value)}
                />
              </div>

              <div className="col-span-4">
                <Select
                  value={field.target}
                  onValueChange={(value) => updateField(index, 'target', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Target field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first_name">First Name</SelectItem>
                    <SelectItem value="last_name">Last Name</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="address">Address</SelectItem>
                    <SelectItem value="city">City</SelectItem>
                    <SelectItem value="state">State</SelectItem>
                    <SelectItem value="zip">ZIP Code</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3">
                <Select
                  value={field.transform}
                  onValueChange={(value) => updateField(index, 'transform', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Transform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Transform</SelectItem>
                    <SelectItem value="uppercase">UPPERCASE</SelectItem>
                    <SelectItem value="lowercase">lowercase</SelectItem>
                    <SelectItem value="capitalize">Capitalize</SelectItem>
                    <SelectItem value="phone">Phone Format</SelectItem>
                    <SelectItem value="email">Email Format</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4 col-span-1">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={field.required}
                    onCheckedChange={(checked) => updateField(index, 'required', checked)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeField(index)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {form.mapping.fields?.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-sm text-gray-500">
              No field mappings defined. Click "Add Field" to start mapping.
            </p>
          </div>
        )}
      </div>

      {/* Example Mapping */}
      <div className="rounded-md bg-gray-50 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Example Data</h4>
        <pre className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200 overflow-x-auto">
{`{
  "source_field": "John Smith",  → first_name: "John", last_name: "Smith"
  "email_address": "john@example.com",  → email: "john@example.com"
  "contact_number": "(123) 456-7890",  → phone: "1234567890"
}`}
        </pre>
      </div>
    </div>
  )
} 