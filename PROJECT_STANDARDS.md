# Project Standards

ABSOLUTELY NO SPECIFIC WORKAROUNDS FOR INDIVIDUAL FIELDS OR COMPONENTS
ALL FILES MUST ADHERE TO STANDARDS AND MAINTAIN MINIMAL GENERIC CODE.

## Core Principles

1. Access Control
   - Property-based access is foundation of platform security
   - Users must belong to properties to access features
   - No global access (except admin users)
   - All routes must verify property access

Form Page Standards

File Structure

[feature]/
├── page.tsx           # Main list view
├── new/page.tsx      # Create form
├── [id]/page.tsx     # Edit form
├── components/       # Feature components
│ ├── feature-table.tsx # Main data display component
│ └── steps/         # Form step components
│     ├── BasicInfo.tsx     # Step 1: Basic information
│     ├── AccountSettings.tsx # Step 2: Account settings  
│     └── ConversionSetup.tsx # Step 3: Conversion setup
└── config.ts        # Types, constants, shared config

DetailsPanel is located @/app/components/DetailsPanel.tsx

Form Implementation

function NetworkFormContent({ id }: { id: string }) {
  const form = useForm<NetworkForm>({
    resolver: zodResolver(networkFormSchema),
    defaultValues: FORM_CONFIG.defaults
  })

  const [step, setStep] = useState(0)
  const steps = [
    { id: 'basic', component: BasicInfo },
    { id: 'settings', component: AccountSettings },
    { id: 'tracking', component: ConversionSetup }
  ]

  return (
    <Form {...form}>
      <StepIndicator steps={steps} currentStep={step} />
      <CurrentStep form={form} />
      <StepNavigation
        onNext={nextStep}
        onPrev={prevStep}
        isLastStep={isLastStep}
      />
    </Form>
  )
}

State Management

export default function FeaturePage() {
  const [data, setData] = useState<Data[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState(defaultFilters)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const { data } = await apiCall()
      setData(data)
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])
}


3. State Management
   ```typescript
   export default function FeaturePage() {
     // Core state - can include multiple data sources
     const [data, setData] = useState<Data[]>([])
     const [relatedData, setRelatedData] = useState<RelatedData[]>([])
     const [loading, setLoading] = useState(true)
     const [error, setError] = useState<Error | null>(null)
     
     // UI state - from CONSTANTS
     const [filters, setFilters] = useState<Filters>(CONSTANTS.feature.defaults.filters)
     
     // Hooks
     const router = useRouter()
     const { toast } = useToast()
     const { data: session } = useSession()
     
     // Data operations - can have multiple fetch operations
     const fetchRelatedData = async () => {
       try {
         const response = await fetch(API_URLS.related)
         if (!response.ok) throw new Error('Failed to fetch')
         const { data } = await response.json()
         setRelatedData(data)
       } catch (error) {
         handleError('fetchRelatedData', error)
       }
     }

     const fetchMainData = async () => {
       try {
         setLoading(true)
         const queryParams = new URLSearchParams(filters)
         const response = await fetch(`${API_URLS.endpoint}?${queryParams}`)
         if (!response.ok) throw new Error('Failed to fetch')
         const { data } = await response.json()
         setData(data)
       } catch (error) {
         handleError('fetchMainData', error)
       } finally {
         setLoading(false)
       }
     }

     // Effects
     useEffect(() => {
       if (session?.user?.id) {
         fetchRelatedData()
       }
     }, [session?.user?.id])

     useEffect(() => {
       if (session?.user?.id) {
         fetchMainData()
       }
     }, [session?.user?.id, filters])
   }
   ```

## Type & Enum Standards

1. Enum Pattern
   ```typescript
   // Use enums for fixed values that need runtime access
   export enum NetworkStatusEnum {
     ACTIVE = "ACTIVE",
     PAUSED = "PAUSED",
     ARCHIVED = "ARCHIVED",
     DELETED = "DELETED"
   }

   // Use type for type checking derived from constants
   export type NetworkStatus = keyof typeof CONSTANTS.networks.statuses
   ```

2. Constants Pattern
   ```typescript
   export const CONSTANTS = {
     feature: {
       title: 'Feature Name',
       description: 'Feature description',
       actions: {
         create: 'Create New'
       },
       ui: {
         error: {
           title: "Something went wrong",
           tryAgain: "Try again"
         },
         empty: {
           title: "No Items Found",
           description: "Get started by creating your first item",
           action: "Create First Item"
         },
         loading: {
           skeletonCounts: 5,
           skeletonWidths: ["3/4", "1/2", "2/3", "3/4", "1/2"]
         }
       },
       statuses: {
         [NetworkStatusEnum.ACTIVE]: { label: 'Active', color: 'green' },
         [NetworkStatusEnum.PAUSED]: { label: 'Paused', color: 'yellow' },
         [NetworkStatusEnum.DELETED]: { label: 'Deleted', color: 'red' }
       },
       defaults: {
         filters: {
           status: 'all',
           search: ''
         }
       }
     }
   } as const
   ```

3. API Response Types
   ```typescript
   // Base API response type
   interface ApiResponse<T> {
     data: T
     error?: {
       code: keyof typeof ErrorCodes
       message: string
       details: Record<string, unknown>
     }
   }

   // Error codes enum
   export enum ErrorCodes {
     UNAUTHORIZED = 'UNAUTHORIZED',
     VALIDATION = 'VALIDATION',
     NOT_FOUND = 'NOT_FOUND',
     SERVER_ERROR = 'SERVER_ERROR'
   }
   ```

## Error Handling Standards

1. Error Response Pattern
   ```typescript
   // Standard error response utility
   function errorResponse(
     code: keyof typeof ErrorCodes, 
     message: string, 
     details: Record<string, unknown> = {}, // Always default to empty object
     status = 500
   ) {
     return NextResponse.json<ApiResponse<null>>({
       data: null,
       error: { code, message, details }
     }, { status })
   }
   ```

2. Activity Logging Pattern
   ```typescript
   // Safe activity logging with error handling
   async function safeLogActivity(type: string, details: any) {
     try {
       const response = await fetch('https://afftrack.live/api/manage/activity', {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ action: type, details })
       })
       if (!response.ok) {
         console.error('Activity logging failed:', await response.text())
       }
     } catch (error) {
       console.error('Activity logging error:', error)
     }
   }
   ```

3. URL Standards
   ```typescript
   // Production URLs
   const API_BASE_URL = 'https://afftrack.live'
   
   // API endpoints
   const ENDPOINTS = {
     activity: `${API_BASE_URL}/api/manage/activity`,
     properties: `${API_BASE_URL}/api/manage/properties`
   } as const
   ```

       // 1. Auth & validation
       const session = await getServerSession(authConfig)
       const input = await validateInput(request)
       
       // 2. Business logic
       const data = await performOperation(input)
       
       // 3. Activity logging
       await logActivity(session, 'ACTION', data)
       
       // 4. Response
       return NextResponse.json({ data })
     } catch (error) {
       await logError(error)
       return errorResponse(error)
     }
   }

   // Client actions
   const handleApiAction = async () => {
     setProcessing(true)
     try {
       const data = await validateAndCall()
       await refreshData()
       showSuccess()
     } catch (error) {
       await logError(error)
       showError(error)
     } finally {
       setProcessing(false)
     }
   }
   ```

2. Component Patterns
   ```typescript
   // Loading states
   function LoadingState() {
     return <Skeleton /> // Use appropriate skeleton
   }

   // Form handling
   function Form() {
     const [form, setForm] = useState(initial)
     const [errors, setErrors] = useState({})
     
     const handleSubmit = async (e) => {
       e.preventDefault()
       if (!validate()) return
       await submitData()
     }

     return (
       <form className="space-y-6">
         <FormFields />
         <FormActions />
       </form>
     )
   }

   // Modal pattern
   function ModalWrapper() {
     return (
       <Dialog>
         <DialogHeader />
         <DialogContent />
         <DialogFooter />
       </Dialog>
     )
   }
   ```

3. UI Standards
   ```typescript
   // Styling constants
   const styles = {
     page: "px-6 py-8",
     section: "mb-6",
     filters: "gap-4",
     button: {
       primary: "bg-blue-500 hover:bg-blue-600",
       text: {
         heading: "text-gray-900",
         body: "text-gray-500"
       }
     }
   }

   // Page layout
   function PageLayout() {
     return (
       <div className={styles.page}>
         <PageHeader />
         <Filters />
         <MainContent />
         <Pagination />
       </div>
     )
   }
   ```

4. Page Template (page.tsx)
   ```typescript
   // Standard page layout with filters and table
   export default function FeaturePage() {
     // Core state
     const [data, setData] = useState<Data[]>([])
     const [isLoading, setIsLoading] = useState(true)
     const [filters, setFilters] = useState({
       status: 'all',
       search: ''
     })

     // Data fetching
     const fetchData = async () => {
       try {
         setIsLoading(true)
         const response = await fetch("/api/endpoint")
         const { data } = await response.json()
         
         if (!response.ok) {
           throw new Error(data.error?.message || "Failed to fetch data")
         }
         
         setData(data)
       } catch (error) {
         toast({
           title: "Error",
           description: error instanceof Error ? error.message : "Failed to load data",
           variant: "destructive"
         })
       } finally {
         setIsLoading(false)
       }
     }

     useEffect(() => {
       fetchData()
     }, [])

     // Filter logic
     const filteredData = data.filter((item) =>
       (filters.search === '' || 
         item.name.toLowerCase().includes(filters.search.toLowerCase())
       ) &&
       (filters.status === 'all' || item.status === filters.status)
     )

     return (
       <div className="px-6 py-8">
         {/* Page Header - Feature specific */}
         <div className="flex items-center gap-4 mb-8">
           <div>
             <h1 className="text-2xl font-bold text-gray-900">{CONSTANTS.feature.title}</h1>
             <p className="mt-1 text-sm text-gray-500">
               {CONSTANTS.feature.description}
             </p>
           </div>
           <div className="flex-1 flex justify-end">
             <Button onClick={handleCreate}>
               <Plus className="w-4 h-4 mr-2" />
               {CONSTANTS.feature.actions.create}
             </Button>
           </div>
         </div>

         {/* Filters Section - Feature specific */}
         <div className="mb-6 flex items-center gap-4">
           <FeatureFilters 
             filters={filters}
             setFilters={setFilters}
             relatedData={relatedData}
           />
         </div>

         {/* Content Section - With standard states */}
         <ErrorBoundary FallbackComponent={ErrorFallback}>
           <div>
             {loading ? (
               <LoadingState />
             ) : data.length === 0 ? (
               <Card>
                 <EmptyState onCreate={handleCreate} />
               </Card>
             ) : (
               <FeatureTable 
                 data={data}
                 onRefresh={fetchMainData}
               />
             )}
           </div>
         </ErrorBoundary>
       </div>
     )
   }

   // Empty state component
   function EmptyState({ onCreate }: { onCreate: () => void }) {
     return (
       <div className="p-12 text-center">
         <h3 className="text-lg font-semibold text-gray-900 mb-2">
           No Items Found
         </h3>
         <p className="text-gray-600 mb-4 max-w-sm mx-auto">
           Get started by creating your first item
         </p>
         <Button 
           onClick={onCreate}
           className="bg-blue-500 hover:bg-blue-600"
         >
           <Plus className="w-4 h-4 mr-2" />
           Create First Item
         </Button>
       </div>
     )
   }

   // Loading state component
   function LoadingState() {
     return (
       <Card className="w-full">
         <div className="p-6 space-y-4">
           <Skeleton className="h-4 w-3/4" />
           <Skeleton className="h-4 w-1/2" />
           <Skeleton className="h-4 w-2/3" />
           <Skeleton className="h-4 w-3/4" />
           <Skeleton className="h-4 w-1/2" />
         </div>
       </Card>
     )
   }
   ```

5. Table Template (components/data-table.tsx)
   ```typescript
   interface TableProps<T> {
     data: T[]
     itemsPerPage?: number
   }

   export function DataTable<T>({ data, itemsPerPage = 10 }: TableProps<T>) {
     const [currentPage, setCurrentPage] = useState(1)

     // Pagination logic
     const totalPages = Math.ceil(data.length / itemsPerPage)
     const startIndex = (currentPage - 1) * itemsPerPage
     const endIndex = startIndex + itemsPerPage
     const currentData = data.slice(startIndex, endIndex)

     return (
       <div className="space-y-4">
         {/* Table is NOT wrapped in Card */}
         <div className="border rounded-lg">
           <Table>
             <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
               <TableRow>
                 <TableHead className="font-semibold text-gray-700">Name</TableHead>
                 <TableHead className="font-semibold text-gray-700">Status</TableHead>
                 <TableHead className="w-[100px]">Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {currentData.map((item, index) => (
                 <TableRow 
                   key={item.id}
                   className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                 >
                   <TableCell>{item.name}</TableCell>
                   <TableCell>{getStatusBadge(item.status)}</TableCell>
                   <TableCell>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" className="h-8 w-8 p-0">
                           <MoreHorizontal className="h-4 w-4" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={() => onEdit(item.id)}>
                           <Edit className="mr-2 h-4 w-4" />
                           Edit
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </div>

         {/* Pagination */}
         <div className="flex items-center justify-between pt-4">
           <p className="text-sm text-gray-600">
             Showing {Math.min(itemsPerPage, currentData.length)} of {data.length} results
           </p>
           <div className="flex items-center space-x-2">
             <Button
               variant="outline"
               size="sm"
               onClick={() => setCurrentPage(prev => prev - 1)}
               disabled={currentPage === 1}
             >
               <ChevronLeft className="h-4 w-4 mr-2" />
               Previous
             </Button>
             <Button
               variant="outline"
               size="sm"
               onClick={() => setCurrentPage(prev => prev + 1)}
               disabled={currentData.length < itemsPerPage}
             >
               Next
               <ChevronRight className="h-4 w-4 ml-2" />
             </Button>
           </div>
         </div>
       </div>
     )
   }

   // Status badge helper
   function getStatusBadge(status: string) {
     const colors = {
       'ACTIVE': 'bg-green-50 text-green-700 border-green-100',
       'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-100',
       'INACTIVE': 'bg-red-50 text-red-700 border-red-100'
     }

     return (
       <Badge variant="outline" className={colors[status]}>
         {status}
       </Badge>
     )
   }
   ```

## Form Patterns

1. Form Field Pattern
   ```typescript
   // Standard form field with react-hook-form
   <FormField
     control={form.control}
     name="path.to.field"
     render={({ field }) => (
       <FormItem>
         <FormLabel>Field Label</FormLabel>
         <FormControl>
           <Input {...field} placeholder="Enter value" />
         </FormControl>
         <FormMessage />
       </FormItem>
     )}
   />
   ```

2. Multi-Select Pattern
   ```typescript
   // Multi-select with property selection
   interface Option {
     value: string
     label: string
   }

   // Options mapping
   const options = items.map(item => ({
     value: item.id,
     label: item.name
   }))

   // Value handling
   const selectedIds = form.watch('path.to.ids')
   const handleChange = (selected: string[]) => {
     form.setValue('path.to.ids', selected, { shouldValidate: true })
   }

   <MultiSelect
     options={options}
     value={selectedIds}
     onValueChange={handleChange}
     placeholder="Select items"
   />
   ```

3. Tag Input Pattern
   ```typescript
   function TagInput() {
     const [input, setInput] = useState("")
     
     const handleAddTag = () => {
       const tag = input.trim()
       if (!tag) return
       
       const current = form.getValues('path.to.tags') || []
       if (current.includes(tag)) {
         toast({ title: "Warning", description: "Tag already exists" })
         return
       }
       
       form.setValue('path.to.tags', [...current, tag], { 
         shouldValidate: true 
       })
       setInput("")
     }
     
     return (
       <div className="space-y-4">
         <div className="flex gap-2">
           <Input
             value={input}
             onChange={e => setInput(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && (
               e.preventDefault(), 
               handleAddTag()
             )}
             placeholder="Add tag"
           />
           <Button onClick={handleAddTag}>Add</Button>
         </div>
         <div className="flex flex-wrap gap-2">
           {tags.map(tag => (
             <Card key={tag} className="flex items-center gap-2 p-2">
               <span>{tag}</span>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => handleRemoveTag(tag)}
               >
                 <X className="h-3 w-3" />
               </Button>
             </Card>
           ))}
         </div>
       </div>
     )
   }
   ```

4. Error Handling Pattern
   ```typescript
   try {
     // Operation
   } catch (error) {
     await logError(ActivityTypes.ERROR, error, {
       component: 'ComponentName',
       message: 'Human readable error message'
     })
     toast({
       title: "Error",
       description: "User-friendly error message",
       variant: "destructive"
     })
   }
   ```

5. Data Fetching Pattern
   ```typescript
   function FormComponent() {
     const [data, setData] = useState<Data[]>([])
     const [isLoading, setIsLoading] = useState(true)
     
     useEffect(() => {
       const fetchData = async () => {
         try {
           setIsLoading(true)
           const response = await fetch('/api/endpoint')
           if (!response.ok) {
             throw new Error('Failed to fetch data')
           }
           const { data } = await response.json()
           setData(data)
         } catch (error) {
           await logError(ActivityTypes.ERROR, error, {
             component: 'ComponentName',
             message: 'Failed to fetch data'
           })
           toast({
             title: "Error",
             description: "Failed to load data",
             variant: "destructive"
           })
         } finally {
           setIsLoading(false)
         }
       }

       fetchData()
     }, [toast])
   }
   ```

## Best Practices

1. ALWAYS
   - Use Zod for validation
   - Log all actions and errors
   - Show loading states
   - Handle errors gracefully
   - Follow consistent naming
   - Use TypeScript properly
   - Implement proper access control
   - Test all paths
   - Use standard components
   - Follow file structure

2. NEVER
   - Split types into separate files
   - Nest pages > 2 levels deep
   - Use custom loading indicators
   - Skip error handling
   - Mix data formats
   - Leave catch blocks empty
   - Mutate state directly
   - Skip cleanup in effects
   - Use raw HTML forms
   - Show technical errors to users

6. Form Best Practices
   - Use `react-hook-form` for form state management
   - Use `zod` for form validation
   - Always show validation errors inline
   - Handle loading states for async operations
   - Use toast notifications for user feedback
   - Implement proper error boundaries
   - Follow consistent form field patterns
   - Use proper TypeScript types for form data
   - Implement proper form submission handling
   - Use proper form reset handling

## Configuration

```typescript
// config.ts pattern
export interface Feature {
  id: string
  name: string
  status: Status
}

export const CONSTANTS = {
  statuses: {
    ACTIVE: { label: 'Active', color: 'green' },
    INACTIVE: { label: 'Inactive', color: 'gray' }
  }
} as const

export const validators = {
  feature: (data: Feature) => {
    const errors: Record<string, string> = {}
    if (!data.name) errors.name = 'Required'
    return { isValid: !Object.keys(errors).length, errors }
  }
}
```

## Feature Implementation Checklist

1. Planning
   - Define requirements
   - Plan data structure
   - Design UI flow
   - Identify permissions
   - Plan error states

2. Implementation
   - Follow file structure
   - Implement validation
   - Add loading states
   - Handle errors
   - Log activities
   - Test all paths

3. Review
   - Check permissions
   - Verify validation
   - Test error handling
   - Confirm logging
   - Review UI/UX
   - Test performance