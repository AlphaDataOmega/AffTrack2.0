"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  value?: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  value = [],
  onValueChange,
  placeholder = "Select items...",
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue]
    onValueChange(newValue)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="w-full border border-input rounded-md p-2 min-h-[40px] cursor-pointer">
          <div className="flex flex-wrap gap-1">
            {value.map((selectedValue) => {
              const option = options.find((opt) => opt.value === selectedValue)
              if (!option) return null
              
              return (
                <Badge
                  key={selectedValue}
                  variant="secondary"
                  className="hover:bg-secondary"
                >
                  {option.label}
                  <button
                    type="button"
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(selectedValue)
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              )
            })}
            {value.length === 0 && (
              <span className="text-sm text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="max-h-[200px] overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent ${
                value.includes(option.value) ? "bg-accent" : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                value.includes(option.value) ? "bg-primary border-primary" : ""
              }`}>
                {value.includes(option.value) && (
                  <X className="h-4 w-4 text-primary-foreground" />
                )}
              </div>
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
} 