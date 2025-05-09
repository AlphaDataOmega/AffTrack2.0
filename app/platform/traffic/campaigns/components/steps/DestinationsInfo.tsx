"use client"

import { useState, useRef, useEffect } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HelpCircle, Plus, X, Link } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { type StepProps, DestinationType, DistributionType } from '../../types'

const TRACKING_PARAMS = [
  { value: '{visitor_id}', label: 'Visitor ID' },
  { value: '{source_id}', label: 'Source ID' },
  { value: '{source_type}', label: 'Source Type (0,1)' }
]

const USER_PARAMS = [
  { value: '{fn}', label: 'First Name' },
  { value: '{ln}', label: 'Last Name' },
  { value: '{email}', label: 'Email' },
  { value: '{phone}', label: 'Phone' },
  { value: '{addr}', label: 'Address' },
  { value: '{addr2}', label: 'Address 2' },
  { value: '{city}', label: 'City' },
  { value: '{state}', label: 'State' },
  { value: '{zipcode}', label: 'Zip Code' },
  { value: '{dob_dd}', label: 'DOB Day' },
  { value: '{dob_mm}', label: 'DOB Month' },
  { value: '{dob_yyyy}', label: 'DOB Year' }
]

const UTM_PARAMS = [
  { value: '{utm_source}', label: 'UTM Source' },
  { value: '{utm_medium}', label: 'UTM Medium' },
  { value: '{utm_campaign}', label: 'UTM Campaign' },
  { value: '{utm_content}', label: 'UTM Content' },
  { value: '{utm_term}', label: 'UTM Term' }
]

const RULE_FIELDS = [
  { 
    value: 'time', 
    label: 'Time of Day',
    type: 'time',
    operators: ['between'],
    valueType: 'time_range'
  },
  { 
    value: 'day', 
    label: 'Day of Week',
    type: 'day',
    operators: ['equals', 'not_equals', 'in'],
    valueType: 'day_select'
  },
  { 
    value: 'utm_source', 
    label: 'UTM Source',
    type: 'string',
    operators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with'],
    valueType: 'text'
  },
  { 
    value: 'utm_medium', 
    label: 'UTM Medium',
    type: 'string',
    operators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with'],
    valueType: 'text'
  },
  { 
    value: 'utm_campaign', 
    label: 'UTM Campaign',
    type: 'string',
    operators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with'],
    valueType: 'text'
  },
  { 
    value: 'utm_content', 
    label: 'UTM Content',
    type: 'string',
    operators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with'],
    valueType: 'text'
  },
  { 
    value: 'utm_term', 
    label: 'UTM Term',
    type: 'string',
    operators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with'],
    valueType: 'text'
  },
  { 
    value: 'country', 
    label: 'Country',
    type: 'string',
    operators: ['equals', 'not_equals', 'in'],
    valueType: 'text'
  },
  { 
    value: 'device', 
    label: 'Device',
    type: 'enum',
    operators: ['equals', 'not_equals'],
    valueType: 'device_select',
    options: ['desktop', 'mobile', 'tablet']
  },
  { 
    value: 'browser', 
    label: 'Browser',
    type: 'enum',
    operators: ['equals', 'not_equals'],
    valueType: 'browser_select',
    options: ['chrome', 'firefox', 'safari', 'edge', 'opera', 'other']
  },
  { 
    value: 'language', 
    label: 'Language',
    type: 'string',
    operators: ['equals', 'not_equals'],
    valueType: 'language_select'
  },
  { 
    value: 'user_agent', 
    label: 'User Agent',
    type: 'string',
    operators: ['contains', 'not_contains', 'starts_with', 'ends_with'],
    valueType: 'text'
  },
  { 
    value: 'ip', 
    label: 'IP Address',
    type: 'string',
    operators: ['equals', 'starts_with'],
    valueType: 'text'
  }
]

const RULE_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does Not Equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does Not Contain' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' }
]

const DAYS_OF_WEEK = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' }
]

export function DestinationsInfo({ form, setForm }: StepProps) {
  const [newDestination, setNewDestination] = useState({ url: '', name: '', weight: 0 })
  const [newRule, setNewRule] = useState({ 
    field: '', 
    operator: '', 
    value: '',
    startTime: '00:00',
    endTime: '23:59',
    selectedDays: [] as string[]
  })
  const urlInputRef = useRef<HTMLTextAreaElement>(null)

  // Function to adjust weights to ensure they sum to 100%
  const adjustWeights = (destinations: typeof form.destinations.destinations, changedIndex: number, newWeight: number) => {
    const totalDestinations = destinations.length
    if (totalDestinations <= 1) return destinations

    // Calculate how much we need to adjust other weights
    const oldWeight = destinations[changedIndex].weight || 0
    const weightDiff = newWeight - oldWeight
    const remainingWeight = 100 - newWeight
    
    return destinations.map((dest, index) => {
      if (index === changedIndex) {
        return { ...dest, weight: newWeight }
      }

      // Proportionally adjust other weights
      const currentWeight = dest.weight || 0
      const oldTotalOthers = 100 - oldWeight
      const newWeight = oldTotalOthers === 0 
        ? remainingWeight / (totalDestinations - 1)
        : Math.max(0, currentWeight - (weightDiff * (currentWeight / oldTotalOthers)))

      return { ...dest, weight: Math.round(newWeight) }
    })
  }

  const handleWeightChange = (index: number, newWeight: number) => {
    const updatedDestinations = adjustWeights([...form.destinations.destinations], index, newWeight)
    
    setForm({
      ...form,
      destinations: {
        ...form.destinations,
        destinations: updatedDestinations
      }
    })
  }

  // Calculate suggested weight for new destination
  const getSuggestedWeight = () => {
    const existingDestinations = form.destinations.destinations.length
    if (existingDestinations === 0) return 100
    
    const remainingWeight = 100 - form.destinations.destinations.reduce((sum, dest) => sum + (dest.weight || 0), 0)
    return Math.max(0, Math.min(100, remainingWeight))
  }

  useEffect(() => {
    if (form.destinations.distribution === DistributionType.WEIGHTED) {
      setNewDestination(prev => ({
        ...prev,
        weight: getSuggestedWeight()
      }))
    }
  }, [form.destinations.distribution, form.destinations.destinations.length])

  const insertAtCursor = (text: string) => {
    const input = urlInputRef.current
    if (!input) return

    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const before = newDestination.url.substring(0, start)
    const after = newDestination.url.substring(end)

    setNewDestination(prev => ({
      ...prev,
      url: before + text + after
    }))

    // Reset cursor position after state update
    setTimeout(() => {
      input.focus()
      input.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const handleDestinationAdd = () => {
    if (!newDestination.url || !newDestination.name) return

    const isFirstDestination = form.destinations.destinations.length === 0
    const newDestinationObj = {
      ...newDestination,
      weight: form.destinations.distribution === DistributionType.WEIGHTED ? newDestination.weight : undefined,
      isDefault: isFirstDestination && form.destinations.distribution === DistributionType.RULES,
      rules: []
    }

    setForm({
      ...form,
      destinations: {
        ...form.destinations,
        destinations: [...form.destinations.destinations, newDestinationObj]
      }
    })

    setNewDestination({ url: '', name: '', weight: 0 })
  }

  const handleDestinationRemove = (index: number) => {
    setForm({
      ...form,
      destinations: {
        ...form.destinations,
        destinations: form.destinations.destinations.filter((_, i) => i !== index)
      }
    })
  }

  const handleRuleAdd = (destinationIndex: number) => {
    if (!newRule.field || !newRule.operator) return
    
    const selectedField = RULE_FIELDS.find(f => f.value === newRule.field)
    if (!selectedField) return

    let ruleValue = newRule.value
    if (selectedField.valueType === 'time_range') {
      ruleValue = `${newRule.startTime}-${newRule.endTime}`
    } else if (selectedField.valueType === 'day_select' && newRule.operator === 'in') {
      ruleValue = newRule.selectedDays.join(',')
    }

    if (!ruleValue && selectedField.valueType !== 'time_range') return

    const rule = {
      field: newRule.field,
      operator: newRule.operator,
      value: ruleValue
    }

    setForm({
      ...form,
      destinations: {
        ...form.destinations,
        destinations: form.destinations.destinations.map((dest, index) => {
          if (index === destinationIndex) {
            return {
              ...dest,
              rules: [...(dest.rules || []), rule]
            }
          }
          return dest
        })
      }
    })

    setNewRule({ 
      field: '', 
      operator: '', 
      value: '',
      startTime: '00:00',
      endTime: '23:59',
      selectedDays: []
    })
  }

  const handleRuleRemove = (destinationIndex: number, ruleIndex: number) => {
    setForm({
      ...form,
      destinations: {
        ...form.destinations,
        destinations: form.destinations.destinations.map((dest, index) => {
          if (index === destinationIndex) {
            return {
              ...dest,
              rules: dest.rules?.filter((_, i) => i !== ruleIndex)
            }
          }
          return dest
        })
      }
    })
  }

  const renderRuleValue = (rule: { field: string, operator: string, value: string }) => {
    const field = RULE_FIELDS.find(f => f.value === rule.field)
    if (!field) return rule.value

    switch (field.valueType) {
      case 'time_range':
        const [start, end] = rule.value.split('-')
        return `between ${start} and ${end}`
      case 'day_select':
        if (rule.operator === 'in') {
          return rule.value.split(',')
            .map(day => DAYS_OF_WEEK.find(d => d.value === day)?.label)
            .join(', ')
        }
        return DAYS_OF_WEEK.find(d => d.value === rule.value)?.label
      case 'device_select':
        return rule.value.charAt(0).toUpperCase() + rule.value.slice(1)
      case 'browser_select':
        return rule.value.charAt(0).toUpperCase() + rule.value.slice(1)
      default:
        return rule.value
    }
  }

  const selectedField = RULE_FIELDS.find(f => f.value === newRule.field)

  const isSingleDestination = form.destinations.destinationType === DestinationType.SINGLE
  const isEvenSplitTest = form.destinations.destinationType === DestinationType.SPLIT_TEST && 
    form.destinations.distribution === DistributionType.EVEN
  
  const showDestinationForm = isSingleDestination 
    ? form.destinations.destinations.length === 0 
    : isEvenSplitTest 
      ? form.destinations.destinations.length < 2
      : true

  return (
    <div className="space-y-8">
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Campaign Destinations</p>
            <p className="mt-1">
              {isEvenSplitTest 
                ? "Configure exactly two destinations for A/B testing with even traffic distribution"
                : "Configure where your traffic will be directed and how it will be distributed"
              }
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div>
          <Label htmlFor="destinationType" className="required">Destination Type</Label>
          <Select
            value={form.destinations.destinationType}
            onValueChange={(value: DestinationType) => {
              setForm({
                ...form,
                destinations: { 
                  ...form.destinations, 
                  destinationType: value,
                  distribution: value === DestinationType.SINGLE ? DistributionType.EVEN : form.destinations.distribution,
                  // Clear destinations when switching types to prevent invalid states
                  destinations: []
                }
              })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select destination type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DestinationType.SINGLE}>Single Destination</SelectItem>
              <SelectItem value={DestinationType.SPLIT_TEST}>Split Test</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.destinations.destinationType === DestinationType.SPLIT_TEST && (
          <div>
            <Label htmlFor="distribution" className="required">Traffic Distribution</Label>
            <Select
              value={form.destinations.distribution}
              onValueChange={(value: DistributionType) => {
                setForm({
                  ...form,
                  destinations: { 
                    ...form.destinations, 
                    distribution: value,
                    // Clear destinations when switching distribution to prevent invalid states
                    destinations: []
                  }
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select distribution type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DistributionType.EVEN}>Even Split (A/B Test)</SelectItem>
                <SelectItem value={DistributionType.WEIGHTED}>Weighted</SelectItem>
                <SelectItem value={DistributionType.RULES}>Rule-Based</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="border-t pt-6">
          <Label className="required">
            {isSingleDestination ? 'Destination' : 'Destinations'}
            {isEvenSplitTest && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({form.destinations.destinations.length}/2)
              </span>
            )}
          </Label>
          <div className="space-y-4">
            {form.destinations.destinations.map((destination, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{destination.name}</p>
                        {destination.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 break-all">{destination.url}</p>
                    </div>
                    {(!destination.isDefault || form.destinations.distribution !== DistributionType.RULES) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDestinationRemove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {form.destinations.distribution === DistributionType.WEIGHTED && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Traffic Weight</Label>
                        <span className="text-sm font-medium">{destination.weight}%</span>
                      </div>
                      <Slider
                        value={[destination.weight || 0]}
                        onValueChange={([value]) => handleWeightChange(index, value)}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}

                  {form.destinations.distribution === DistributionType.RULES && !destination.isDefault && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <Label>Traffic Rules</Label>
                        <span className="text-sm text-gray-500">
                          Match any of the following:
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {destination.rules?.map((rule, ruleIndex) => (
                          <div key={ruleIndex} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                            <div className="flex-1 text-sm">
                              <span className="font-medium">{renderRuleValue(rule)}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRuleRemove(index, ruleIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        <Card className="p-3 border-dashed">
                          <div className="space-y-3">
                            <Select
                              value={newRule.field}
                              onValueChange={(value) => {
                                const field = RULE_FIELDS.find(f => f.value === value)
                                setNewRule(prev => ({ 
                                  ...prev, 
                                  field: value,
                                  operator: field?.operators[0] || '',
                                  value: '',
                                  startTime: '00:00',
                                  endTime: '23:59',
                                  selectedDays: []
                                }))
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {RULE_FIELDS.map(field => (
                                  <SelectItem key={field.value} value={field.value}>
                                    {field.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {selectedField && (
                              <Select
                                value={newRule.operator}
                                onValueChange={(value) => setNewRule(prev => ({ ...prev, operator: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select operator" />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedField.operators.map(operator => (
                                    <SelectItem key={operator} value={operator}>
                                      {operator.split('_').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                      ).join(' ')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}

                            {selectedField && (
                              <div className="space-y-3">
                                {selectedField.valueType === 'time_range' && (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="time"
                                      value={newRule.startTime}
                                      onChange={(e) => setNewRule(prev => ({ ...prev, startTime: e.target.value }))}
                                      className="flex-1"
                                    />
                                    <span className="text-sm text-gray-500">to</span>
                                    <Input
                                      type="time"
                                      value={newRule.endTime}
                                      onChange={(e) => setNewRule(prev => ({ ...prev, endTime: e.target.value }))}
                                      className="flex-1"
                                    />
                                  </div>
                                )}

                                {selectedField.valueType === 'day_select' && newRule.operator === 'in' && (
                                  <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK.map(day => (
                                      <Button
                                        key={day.value}
                                        variant={newRule.selectedDays.includes(day.value) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                          setNewRule(prev => ({
                                            ...prev,
                                            selectedDays: prev.selectedDays.includes(day.value)
                                              ? prev.selectedDays.filter(d => d !== day.value)
                                              : [...prev.selectedDays, day.value]
                                          }))
                                        }}
                                      >
                                        {day.label.slice(0, 3)}
                                      </Button>
                                    ))}
                                  </div>
                                )}

                                {selectedField.valueType === 'day_select' && newRule.operator !== 'in' && (
                                  <Select
                                    value={newRule.value}
                                    onValueChange={(value) => setNewRule(prev => ({ ...prev, value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {DAYS_OF_WEEK.map(day => (
                                        <SelectItem key={day.value} value={day.value}>
                                          {day.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}

                                {selectedField.valueType === 'device_select' && (
                                  <Select
                                    value={newRule.value}
                                    onValueChange={(value) => setNewRule(prev => ({ ...prev, value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select device" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {selectedField.options?.map(option => (
                                        <SelectItem key={option} value={option}>
                                          {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}

                                {selectedField.valueType === 'browser_select' && (
                                  <Select
                                    value={newRule.value}
                                    onValueChange={(value) => setNewRule(prev => ({ ...prev, value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select browser" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {selectedField.options?.map(option => (
                                        <SelectItem key={option} value={option}>
                                          {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}

                                {selectedField.valueType === 'text' && (
                                  <Input
                                    value={newRule.value}
                                    onChange={(e) => setNewRule(prev => ({ ...prev, value: e.target.value }))}
                                    placeholder="Enter value"
                                    className="flex-1"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {showDestinationForm && (
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="destinationName">Name</Label>
                    <Input
                      id="destinationName"
                      value={newDestination.name}
                      onChange={(e) => setNewDestination(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={isEvenSplitTest 
                        ? `Enter name for Variant ${String.fromCharCode(65 + form.destinations.destinations.length)}`
                        : "Enter destination name"
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="destinationUrl">URL</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Link className="h-4 w-4 mr-2" />
                              Tracking Params
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56" align="start">
                            <div className="space-y-2">
                              {TRACKING_PARAMS.map(param => (
                                <Button
                                  key={param.value}
                                  variant="ghost"
                                  className="w-full justify-start font-mono text-sm"
                                  onClick={() => insertAtCursor(param.value)}
                                >
                                  {param.label}
                                  <span className="ml-auto opacity-50">{param.value}</span>
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Link className="h-4 w-4 mr-2" />
                              User Params
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56" align="start">
                            <div className="space-y-2">
                              {USER_PARAMS.map(param => (
                                <Button
                                  key={param.value}
                                  variant="ghost"
                                  className="w-full justify-start font-mono text-sm"
                                  onClick={() => insertAtCursor(param.value)}
                                >
                                  {param.label}
                                  <span className="ml-auto opacity-50">{param.value}</span>
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Link className="h-4 w-4 mr-2" />
                              UTM Params
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56" align="start">
                            <div className="space-y-2">
                              {UTM_PARAMS.map(param => (
                                <Button
                                  key={param.value}
                                  variant="ghost"
                                  className="w-full justify-start font-mono text-sm"
                                  onClick={() => insertAtCursor(param.value)}
                                >
                                  {param.label}
                                  <span className="ml-auto opacity-50">{param.value}</span>
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Textarea
                        ref={urlInputRef}
                        id="destinationUrl"
                        value={newDestination.url}
                        onChange={(e) => setNewDestination(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="Enter destination URL"
                        rows={3}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  {form.destinations.distribution === DistributionType.WEIGHTED && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Traffic Weight</Label>
                        <span className="text-sm font-medium">{newDestination.weight}%</span>
                      </div>
                      <Slider
                        value={[newDestination.weight]}
                        onValueChange={([value]) => setNewDestination(prev => ({ ...prev, weight: value }))}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-500">
                        Remaining weight: {100 - form.destinations.destinations.reduce((sum, dest) => sum + (dest.weight || 0), 0)}%
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={handleDestinationAdd}
                    disabled={!newDestination.url || !newDestination.name}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isSingleDestination 
                      ? 'Set Destination' 
                      : isEvenSplitTest
                        ? `Add Variant ${String.fromCharCode(65 + form.destinations.destinations.length)}`
                        : 'Add Destination'
                    }
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 