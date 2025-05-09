"use client"

import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Lock, Shield, Server } from "lucide-react"

interface DeployProps {
  form: any
  setForm: (form: any) => void
}

export function Deploy({ form, setForm }: DeployProps) {
  const updateDeploy = (field: string, value: any) => {
    setForm({
      ...form,
      deploy: {
        ...form.deploy,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Project Name
          <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={form.deploy.projectName}
          onChange={(e) => updateDeploy('projectName', e.target.value)}
          placeholder="my-site-project"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          The name of your Cloudflare Pages project
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Production Domain
          <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            value={form.deploy.subdomain}
            onChange={(e) => updateDeploy('subdomain', e.target.value)}
            placeholder="my-site"
            required
          />
          <span className="text-gray-500">.pages.dev</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Your site will be available at [name].pages.dev
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Custom Domain
        </label>
        <Input
          type="text"
          value={form.deploy.customDomain}
          onChange={(e) => updateDeploy('customDomain', e.target.value)}
          placeholder="www.example.com"
        />
        <p className="mt-1 text-sm text-gray-500">
          Optional: Add your own domain name
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Build Settings</h3>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-gray-400" />
              <div>
                <Label>Framework Preset</Label>
                <p className="text-sm text-gray-500">Select your site's framework</p>
              </div>
            </div>
            <Select
              value={form.deploy.framework}
              onValueChange={(value) => updateDeploy('framework', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="next">Next.js</SelectItem>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="vue">Vue</SelectItem>
                <SelectItem value="static">Static HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <div>
                <Label htmlFor="ssl-toggle">Enable SSL/TLS</Label>
                <p className="text-sm text-gray-500">Secure your site with HTTPS</p>
              </div>
            </div>
            <Switch
              id="ssl-toggle"
              checked={form.deploy.ssl}
              onCheckedChange={(checked) => updateDeploy('ssl', checked)}
            />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Cloudflare Features</h3>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Global Edge Network</p>
              <p className="text-sm text-gray-500">Your site will be deployed to Cloudflare's global network</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Security Features</p>
              <ul className="mt-2 space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  DDoS protection
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Web Application Firewall
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Always-on HTTPS
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Deployment Checklist</h4>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Choose a unique project name</li>
          <li>Configure your build settings</li>
          <li>Set up custom domains (optional)</li>
          <li>Enable security features</li>
        </ul>
      </div>
    </div>
  )
}