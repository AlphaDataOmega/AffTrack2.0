"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

interface FontsProps {
  form: any
  setForm: (form: any) => void
}

const fonts = {
  heading: [
    { id: 'inter', name: 'Inter', preview: 'Modern and clean' },
    { id: 'playfair', name: 'Playfair Display', preview: 'Elegant serif' },
    { id: 'montserrat', name: 'Montserrat', preview: 'Contemporary sans-serif' },
    { id: 'roboto', name: 'Roboto', preview: 'Professional and readable' },
  ],
  body: [
    { id: 'inter', name: 'Inter', preview: 'Modern and clean' },
    { id: 'source', name: 'Source Sans Pro', preview: 'Optimized for readability' },
    { id: 'open-sans', name: 'Open Sans', preview: 'Friendly and approachable' },
    { id: 'roboto', name: 'Roboto', preview: 'Professional and readable' },
  ]
}

export function Fonts({ form, setForm }: FontsProps) {
  const updateFonts = (field: string, value: string) => {
    setForm({
      ...form,
      fonts: {
        ...form.fonts,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Heading Font</h3>
        <div className="grid gap-4">
          {fonts.heading.map((font) => (
            <Card
              key={font.id}
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => updateFonts('heading', font.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{font.name}</h4>
                  <p className="text-sm text-gray-500">{font.preview}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 ${
                  form.fonts.heading === font.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Body Font</h3>
        <div className="grid gap-4">
          {fonts.body.map((font) => (
            <Card
              key={font.id}
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => updateFonts('body', font.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{font.name}</h4>
                  <p className="text-sm text-gray-500">{font.preview}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 ${
                  form.fonts.body === font.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Font Pairing Tips</h4>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Use contrasting fonts for headings and body text</li>
          <li>Ensure body text is highly readable</li>
          <li>Consider your brand personality</li>
          <li>Test combinations at different sizes</li>
        </ul>
      </div>
    </div>
  )
}