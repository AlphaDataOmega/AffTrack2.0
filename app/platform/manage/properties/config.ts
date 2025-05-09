// Simple types
export type PropertyStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE'

// User type for components
export type User = {
  id: string
  name: string | null
  email: string
}

// Basic property structure
export type Property = {
  id: string
  name: string
  domain: string
  description: string | null
  status: PropertyStatus
  tags: string[]
  industry: string | null
  users: User[]
  createdAt: string
  updatedAt: string
  _count?: {
    campaigns: number
    users: number
  }
}

// Form state
export type PropertyForm = {
  name: string
  domain: string
  description: string
  status: PropertyStatus
  tags: string[]
  industry: string
  users: string[]
}

// Default form values
export const defaultForm: PropertyForm = {
  name: '',
  domain: '',
  description: '',
  status: 'PENDING',
  tags: [],
  industry: '',
  users: []
}

// Status configuration
export const statusConfig = {
  ACTIVE: { label: 'Active', color: 'green' },
  PENDING: { label: 'Pending', color: 'yellow' },
  INACTIVE: { label: 'Inactive', color: 'gray' }
} as const

// Industry options
export const industries = [
  'E-commerce',
  'Finance',
  'Healthcare',
  'Technology',
  'Education',
  'Entertainment',
  'Travel',
  'Real Estate',
  'Retail',
  'Other'
] as const

// Simple validation
export const validateProperty = (data: Partial<PropertyForm>) => {
  const errors: Record<string, string> = {}

  if (!data.name?.trim()) {
    errors.name = 'Name is required'
  } else if (data.name.length < 3) {
    errors.name = 'Name must be at least 3 characters'
  }

  if (!data.domain?.trim()) {
    errors.domain = 'Domain is required'
  } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(data.domain)) {
    errors.domain = 'Please enter a valid domain'
  }

  if (!data.status) {
    errors.status = 'Status is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Activity log types
export type ActivityAction = 
  | '[PROPERTY] CREATE'
  | '[PROPERTY] UPDATE'
  | '[PROPERTY] DELETE'
  | '[PROPERTY] ERROR'

// API response type
export type ApiResponse<T> = {
  data?: T
  error?: {
    message: string
  }
}

// Form step type
export type FormStep = {
  key: 'basic' | 'users'
  title: string
  component: React.ComponentType<{
    form: PropertyForm
    setForm: (form: PropertyForm) => void
  }>
  tips: string[]
}

// Form steps configuration without components
export const formStepConfigs = [
  {
    key: 'basic',
    title: 'Basic Information',
    tips: [
      'Choose a descriptive name for your property',
      'Enter the main domain that will be tracked',
      'Add relevant tags for better organization',
      'Select the appropriate industry category'
    ]
  },
  {
    key: 'users',
    title: 'User Access',
    tips: [
      'Add team members who need access',
      'Review user permissions carefully',
      'Remove access for inactive users',
      'Ensure critical team members are added'
    ]
  }
] 