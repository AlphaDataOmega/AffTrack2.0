"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface BasicInfoProps {
  form: any
  setForm: (form: any) => void
}

export function BasicInfo({ form, setForm }: BasicInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Site Name
          <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Enter site name"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Choose a unique name to identify your site
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Site Type
          <span className="text-red-500">*</span>
        </label>
        <Select
          value={form.type}
          onValueChange={(value) => setForm({ ...form, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select site type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="landing">Landing Page</SelectItem>
            <SelectItem value="comparison">Comparison Site</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="ecommerce">E-commerce</SelectItem>
            <SelectItem value="portfolio">Portfolio</SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-1 text-sm text-gray-500">
          This will determine the available templates and features
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
          <span className="text-red-500">*</span>
        </label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Enter site description"
          rows={4}
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Briefly describe the purpose and goals of your site
        </p>
      </div>
    </div>
  )
}