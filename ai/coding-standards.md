# CASA CENTRAL — Coding Standards

## Component Structure

### Server Components (default)
```tsx
// src/app/some-page/page.tsx
export default async function SomePage() {
  const result = await getSomeData()
  const data = result.success ? result.data : []
  return <SomeClient data={data} />
}
```

### Client Components (opt-in with "use client")
```tsx
"use client"
export function SomeClient({ data }: { data: SomeType[] }) {
  // interactivity only — no data fetching at mount
}
```

### Full Client Pages (rare, use sparingly)
```tsx
"use client"
export default function Page() {
  const [data, setData] = useState([])
  useEffect(() => { fetchData().then(setData) }, [])
  // ...
}
```

## Naming Conventions
- **Files**: `kebab-case.ts` (server actions, pages), `PascalCase.tsx` (components)
- **Components**: `PascalCase` (export function SomeComponent)
- **Server Actions**: `camelCase` (getProducts, createOrder, updateUserProfile)
- **Client components**: `PascalCase` + `Client` suffix (ProductGridClient, InventoryClient)
- **Routes**: `kebab-case` (/admin/inventory, /account/profile)
- **Types**: `PascalCase` (OrderRow, ProductWithStock)
- **Props interfaces**: Inline `{ prop: Type }` — no dedicated interface files
- **DB columns**: `snake_case` (Supabase convention, mapped to JS `camelCase` in actions)

## TypeScript Conventions
- `any` is widely used with `eslint-disable @typescript-eslint/no-explicit-any` at file top
- Type imports from `@/types/database.types` (`Database["public"]["Tables"]["products"]["Row"]`)
- No strict typing on server action returns — `{ success: boolean; data?: any; error?: string }`
- `database.types.ts` has `@ts-nocheck` at top to suppress gen-type errors
- Avoid complex generics — use `as any` casts in action return mapping

## Server Action Patterns

### Standard Action Signature
```ts
"use server"
export async function actionName(params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }
  // ... do work
  return { success: true, data: result }
}
```

### Role Check Pattern
```ts
const { data: profile } = await supabase
  .from("profiles").select("role").eq("id", user.id).single()
if (!profile || !["ADMIN", "SUPER_ADMIN"].includes(profile.role))
  return { success: false, error: "Unauthorized" }
```

### Paginated Query Pattern (Cursor)
```ts
let query = supabase.from("orders").select("...").order("created_at", { ascending: false })
if (cursor) query = query.lt("created_at", cursor)
const { data } = await query.limit(limit + 1)
const hasMore = data.length > limit
const items = hasMore ? data.slice(0, -1) : data
const nextCursor = hasMore ? items[items.length - 1].created_at : null
```

### Paginated Query Pattern (Offset)
```ts
const from = offset || 0
const to = from + (limit || 50) - 1
const { data } = await query.range(from, to)
```

## API Patterns
- **No REST API routes** — all data access via Server Actions
- **No React Query mutations** — Server Actions are called directly (form actions or `startTransition`)
- **React Query only** for catalog reads in `ProductGridClient.tsx` and `admin/products`
- **FormData** pattern for auth actions (`signIn`, `signUp`), JSON objects for all others

## Folder Conventions
- `src/app/actions/` — all Server Actions (flat, 12 files)
- `src/app/admin/*/page.tsx` — each admin route in its own folder
- `src/app/account/*/page.tsx` — each account route in its own folder
- `src/components/ui/` — shared UI (shadcn + custom)
- `src/components/admin/` — admin-only components
- `src/components/auth/` — auth-only components
- `src/lib/` — client factories (Supabase, utils)
- `src/types/` — TypeScript interfaces
- `src/store/` — Zustand stores
- `src/repositories/` — data access layer (partial usage)
- `src/services/` — service layer (partial usage)

## Testing Conventions
- **No tests exist** — no jest, no vitest, no playwright tests
- All verification is manual via browser
- No testing infrastructure — do not add tests without explicit request

## State Management Conventions
- **Zustand** for cart only (`useCartStore` with `persist` middleware to `localStorage`)
- **React Query** for catalog/admin-products data fetching
- **`useState`** for local component state (forms, dialogs, toggles)
- **`useOptimistic`** in InventoryDashboard for optimistic UI updates
- No Redux, no Context API (except QueryClientProvider)

## Async Patterns
- All Server Actions are `async` with `await`
- Admin/account pages use `async` Server Components with `await` data fetching
- Parallel requests via `Promise.all` at page level and inside action functions
- `Promise.all` for batch DB writes inside inventory/order mutations
- `try/catch` NOT used — errors returned as `{ success: false, error }`
- `console.error` for server-side error logging

## Validation Patterns
- **Server-side**: Manual validation in action bodies (check required fields, types)
- **Client-side**: `react-hook-form` + `zod` in `InventoryForm.tsx`
- **No shared validation schemas** — validation is duplicated between client and server
- **No Zod schemas for server actions** — form data is cast with `as` type assertions

## Error Handling
```ts
if (error) {
  console.error("Descriptive context:", error.message)
  return { success: false, error: error.message }
}
```
- No error boundaries per segment (only root `error.tsx`)
- No exception propagation — all errors caught and returned as values
- `sonner.toast` for client-side error/success display (`toast.error()`, `toast.success()`)

## Import Ordering (convention, not enforced)
1. React/Next.js imports
2. Third-party libraries (recharts, lucide, framer-motion, sonner, zustand)
3. Supabase imports
4. Local components (`@/components/...`)
5. Server actions (`@/app/actions/...`)
6. Types (`@/types/...`)
7. Utils (`@/lib/...`)

## CSS Conventions
- Tailwind utility classes only (no CSS modules, no styled-components)
- Brand colors via Tailwind theme: `bg-brand-navy`, `text-brand-gold`, `bg-brand-cream`
- `oklch()` function for dynamic color values
- `cn()` utility for conditional class merging (`clsx` + `tailwind-merge`)
- No custom CSS files beyond `globals.css` (Tailwind directives + theme + shadcn variables)
