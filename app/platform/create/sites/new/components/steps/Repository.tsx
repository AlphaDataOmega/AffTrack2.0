"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GitBranch, FolderGit } from "lucide-react"

interface RepositoryProps {
  form: any
  setForm: (form: any) => void
}

export function Repository({ form, setForm }: RepositoryProps) {
  const updateRepository = (field: string, value: string) => {
    setForm({
      ...form,
      repository: {
        ...form.repository,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Repository Name
          <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={form.repository.name}
          onChange={(e) => updateRepository('name', e.target.value)}
          placeholder="my-site"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          This will be used as the repository name and project identifier
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Branch
          <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <Select
            value={form.repository.branch}
            onValueChange={(value) => updateRepository('branch', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">main</SelectItem>
              <SelectItem value="production">production</SelectItem>
              <SelectItem value="staging">staging</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          The branch that will be used for deployment
        </p>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <FolderGit className="w-5 h-5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">Local Git Repository</p>
            <p className="text-sm text-gray-500">
              A Git repository will be created locally and managed by the platform
            </p>
          </div>
        </div>
      </Card>

      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Repository Information</h4>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>The repository will be initialized automatically</li>
          <li>All changes will be tracked and versioned</li>
          <li>Deployments will be handled through Cloudflare Pages</li>
          <li>You can export the repository at any time</li>
        </ul>
      </div>
    </div>
  )
}