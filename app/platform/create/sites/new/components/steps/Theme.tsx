"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeProps {
  form: any
  setForm: (form: any) => void
}

const themes = [
  { id: 'modern', name: 'Modern', preview: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=300&h=200&fit=crop' },
  { id: 'minimal', name: 'Minimal', preview: 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=300&h=200&fit=crop' },
  { id: 'bold', name: 'Bold', preview: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=300&h=200&fit=crop' },
  { id: 'classic', name: 'Classic', preview: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=300&h=200&fit=crop' },
]

const layouts = [
  { id: 'default', name: 'Default', description: 'Standard layout with header, content, and footer' },
  { id: 'sidebar', name: 'Sidebar', description: 'Layout with fixed sidebar navigation' },
  { id: 'magazine', name: 'Magazine', description: 'Grid-based layout for content-rich sites' },
  { id: 'minimal', name: 'Minimal', description: 'Clean, distraction-free layout' },
]

export function Theme({ form, setForm }: ThemeProps) {
  const updateTheme = (field: string, value: string) => {
    setForm({
      ...form,
      theme: {
        ...form.theme,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Theme</h3>
        <div className="grid grid-cols-2 gap-4">
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className={cn(
                "relative cursor-pointer overflow-hidden transition-all",
                form.theme.name === theme.id && "ring-2 ring-blue-500"
              )}
              onClick={() => updateTheme('name', theme.id)}
            >
              <img
                src={theme.preview}
                alt={theme.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h4 className="font-medium text-gray-900">{theme.name}</h4>
              </div>
              {form.theme.name === theme.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Color Scheme</h3>
        <div className="space-y-4">
          <Input
            type="color"
            value={form.theme.color}
            onChange={(e) => updateTheme('color', e.target.value)}
            className="w-full h-12"
          />
          <p className="text-sm text-gray-500">
            This color will be used as the primary color throughout your site
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Layout Style</h3>
        <div className="grid gap-4">
          {layouts.map((layout) => (
            <Card
              key={layout.id}
              className={cn(
                "relative p-4 cursor-pointer transition-all",
                form.theme.layout === layout.id && "ring-2 ring-blue-500"
              )}
              onClick={() => updateTheme('layout', layout.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{layout.name}</h4>
                  <p className="text-sm text-gray-500">{layout.description}</p>
                </div>
                {form.theme.layout === layout.id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}