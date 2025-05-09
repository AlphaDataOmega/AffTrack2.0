## Project Standards - Core Principles

### 1. Core Principles

#### Access Control

- Property-based access is enforced globally via middleware.
- Users must belong to properties to access platform features.
- Properties can have multiple users assigned.

#### Implementation

- Middleware (`requirePropertyAccess.ts`) ensures access control:
  ```ts
  export function requirePropertyAccess(req, res, next) {
    if (!req.user?.propertyId) return res.status(403).json({ error: "Access Denied" });
    next();
  }
  ```
- Applied globally: `app.use(requirePropertyAccess);`

#### Creating Properties

- Ensures property creation assigns an admin and supports user assignments.
- API Example:
  ```ts
  app.post("/api/properties", async (req, res) => {
    const { name, userIds } = req.body;
    if (!req.user.isAdmin) return res.status(403).json({ error: "Unauthorized" });
    const newProperty = await db.property.create({
      data: {
        name,
        users: { connect: userIds.map(id => ({ id })) },
      },
    });
    res.json(newProperty);
  });
  ```

---

### 2. Form Page Standards

#### File Structure

```
[feature]/
├── page.tsx            # Main view (list & form combined where possible)
├── [id]/page.tsx       # Dynamic edit view
├── components/         # Feature components
│   ├── FeatureTable.tsx
│   ├── FeatureForm.tsx
│   ├── Stepper.tsx
│   ├── FormSteps/
│       ├── Step1.tsx
│       ├── Step2.tsx
│       ├── Step3.tsx
│       ├── ...
└── config.ts           # Shared constants
```

#### Implementation

- Multi-step forms (2-11 steps) use a reusable stepper:
  ```ts
  function MultiStepForm({ steps }) {
    const [stepIndex, setStepIndex] = useState(0);
    const form = useForm({ resolver: zodResolver(formSchema), defaultValues: FORM_DEFAULTS });
    return (
      <Form {...form}>
        <StepIndicator steps={steps} currentStep={stepIndex} />
        {steps[stepIndex].component(form)}
        <StepNavigation
          onNext={() => setStepIndex(i => Math.min(i + 1, steps.length - 1))}
          onPrev={() => setStepIndex(i => Math.max(i - 1, 0))}
          isLastStep={stepIndex === steps.length - 1}
        />
      </Form>
    );
  }
  ```

#### Best Practices

- Uses `react-hook-form` & `zod` for validation.
- API requests should align with form structure to eliminate workarounds.
- Form steps are modular components inside `FormSteps/`.

---

### 3. Reports Standards

#### File Structure

```
[report]/
├── page.tsx           # Main list view
├── components/
│   ├── ReportTable.tsx
│   ├── ReportFilter.tsx
└── config.ts        # Shared constants
└── api.ts           # API functions
```

#### Implementation

- Report pages fetch and display data with filtering.
  ```ts
  export default function ReportPage() {
    const { data, isLoading, error } = useReportData();
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    return (
      <div className="px-6 py-8">
        <ReportFilter filters={filters} setFilters={setFilters} />
        {isLoading ? <LoadingState /> : error ? <ErrorState message={error.message} /> : <ReportTable data={data} filters={filters} />}
      </div>
    );
  }
  ```
- Filters handled separately in `ReportFilter.tsx`.
- API calls centralized in `api.ts`.

---

### 4. Feature Page Standards

#### File Structure

```
[feature]/
├── page.tsx           # Main list view
├── components/
│   ├── FeatureTable.tsx
│   ├── FeatureFilter.tsx
└── config.ts        # Constants & shared config
└── api.ts           # API functions
```

#### Implementation

- Uses a standardized page layout with filters and data tables.
  ```ts
  export default function FeaturePage() {
    const { data, isLoading, error } = useFeatureData();
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    return (
      <div className="px-6 py-8">
        <FeatureFilter filters={filters} setFilters={setFilters} />
        {isLoading ? <LoadingState /> : error ? <ErrorState message={error.message} /> : <FeatureTable data={data} filters={filters} />}
      </div>
    );
  }
  ```

---

### 5. API Interaction Standards

- API interactions follow RESTful principles.
- CRUD operations should be structured consistently:
  ```ts
  GET    /api/resource       // Fetch data
  POST   /api/resource       // Create new entry
  PUT    /api/resource/:id   // Update existing entry
  DELETE /api/resource/:id   // Remove entry
  ```
- Caching implemented via `SWR` for optimization.
- State updates should be handled using React state or global state management.

---

### 6. Testing & Debugging Standards

- Unit tests required for reusable components.
- `useActivityLogger` should capture and store system logs.
- API failures should be logged and surfaced appropriately.
- Debugging conventions must follow structured error handling practices.

---

### 7. Naming Conventions & File Standardization

- Components and pages follow **PascalCase**.
- Hooks and utility functions follow **camelCase**.
- API functions should be structured within `api.ts` per feature module.
- Shared constants should be placed inside `config.ts`.

---

### 8. Component Structure Breakdown

- Each page and component should follow the predefined structure.
- Explicit function purposes should be documented for clarity.
- Avoid feature-specific hacks inside shared components.
- Ensure **loading states, error handling, and API interactions** are handled consistently.
- All components must support **property-based access control** and adhere to **state management best practices**.
- Form components must use **Zod validation and react-hook-form**.
- Ensure AI-generated code follows **pre-defined templates and standards** for **uniformity across the platform**.

