# CASA CENTRAL — Anti-Patterns & Risks

## FORBIDDEN PATTERNS

### 1. Using `cookies()` inside `unstable_cache`
- **Error**: `Route used cookies() inside a function cached with unstable_cache()`
- **Fix**: Use `createAnonClient()` instead of `createClient()` inside cached functions
- **Scanned**: Fixed in `getWarehouses`, `getVendors` — check any future cached functions

### 2. Using `getSession()` for server-side auth
- **Why**: `getSession()` reads from cookies which may be stale; `getUser()` queries Supabase Auth server
- **Fix**: Always use `supabase.auth.getUser()` in middleware and server actions
- **Current status**: middleware.ts correctly uses `getUser()`

### 3. Direct `select('*')` queries
- **Why**: Unbounded column fetch wastes bandwidth and risks exposing sensitive fields
- **Fix**: Always specify explicit columns: `.select('id, name, price, created_at')`
- **Current status**: Most actions now use explicit columns after optimization pass

### 4. Nested `<button>` inside `<button>` (hydration errors)
- **Why**: React hydration mismatch — DOM disallows nested interactive elements
- **Fix**: Use `<div>` or `<span>` with `onClick` for inner interactive elements
- **Current status**: Previously fixed in ProductCard, Navbar

## DETECTED ANTI-PATTERNS (Present in Codebase)

### 1. `.env` committed with secrets
- **File**: `.env` at root (tracked by git)
- **Risk**: `SUPABASE_SECRET_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are exposed
- **Severity**: HIGH — secret key allows full DB access bypassing RLS
- **Mitigation**: Rotate Supabase secret key immediately. Add `.env` to `.gitignore` and remove from history. Use Vercel environment variables.

### 2. No tests anywhere
- **Risk**: Every change is manually verified. Regression detection is impossible.
- **Impact**: Safety net missing for refactors, upgrades, and new features.
- **Mitigation**: Add at least integration tests for critical paths (order creation, inventory transfer, auth).

### 3. Partial service/repository layer (unused abstraction)
- **Risk**: `repositories/` and `services/` exist with 2 files each but **no pages or actions import them**. All real logic is inline in Server Actions.
- **Severity**: LOW — dead code, not harmful but misleading for new developers
- **Fix**: Either delete the unused layer or migrate all actions to use it consistently.

### 4. Duplicate server actions
- **`getAdminOrders`** exists in both `admin.ts` AND `orders.ts` (different implementations)
- **`getCMSContent`/`updateCMSContent`** exists in both `admin.ts` AND `cms.ts`
- **Risk**: Divergent behavior, confusion about which version is canonical
- **Fix**: Consolidate — keep in `orders.ts` and `cms.ts`, remove from `admin.ts`

### 5. `database.types.ts` is partially stale
- **Missing tables**: `vendors`, `warehouse_transfers`, `transfer_items`, `purchase_orders`, `purchase_order_items`
- **Wrong fields**: `warehouses` lacks `is_virtual`, `is_active` in types but code accesses them
- **Fix**: Regenerate types from Supabase after migration; OR remove `@ts-nocheck` and maintain manually

### 6. Massive client components
- **`InventoryClient.tsx`**: 995 lines, 5 tabs, 10+ dialogs — violates single responsibility
- **`admin/orders/page.tsx`**: 363 lines, full client — couples data fetching + UI + business logic
- **Risk**: Hard to test, maintain, or refactor. Bundle size impact.
- **Fix**: Split into smaller components per tab/dialog, move data fetching to server

### 7. Inconsistent rendering patterns in admin
- Products page: full client with React Query
- Orders page: full client with useEffect
- Inventory page: Server → Client delegate
- **Risk**: Cognitive load — developers must learn 3 patterns for similar CRUD pages
- **Fix**: Standardize on Server → Client delegate pattern across all admin CRUD

### 8. Mock data in production routes
- **`/search`**: Uses hardcoded mock product data, not connected to Supabase
- **`/contact`**: Form sets local `submitted` state only, no actual submission
- **`/admin/settings`**: Form fields are static, no save handler wired
- **Risk**: Deceptive to users; incomplete features appear functional

## PERFORMANCE HAZARDS

### 1. Race conditions in order creation
- **Issue**: `createOrder` checks stock → deducts inventory as separate steps. Concurrent orders for the same product can both pass the stock check.
- **Severity**: HIGH — can oversell inventory
- **Fix**: Use Supabase row-level locking (`SELECT ... FOR UPDATE`) or optimistic concurrency with retry

### 2. No server-side cart persistence
- **Issue**: Cart exists only in localStorage. User loses cart on different device or cleared browser data.
- **Severity**: MEDIUM — poor UX
- **Fix**: Add a `carts` table in Supabase, sync on login

### 3. No pagination for `getAllInventory()`
- **Issue**: `getAllInventory()` fetches ALL inventory rows without limit/offset
- **Severity**: MEDIUM — will degrade as inventory grows
- **Fix**: Add cursor pagination (like `getAdminOrders`)

### 4. No pagination for `getPurchaseOrders()`
- **Issue**: Same as above — fetches all POs unbounded
- **Fix**: Add limit/cursor parameters

### 5. `unstable_cache` 1-hour TTL
- **Issue**: Categories, brands, warehouses, vendors have 3600s revalidation. Admin users won't see edits until cache expires.
- **Severity**: LOW — acceptable for low-frequency updates, but `revalidateTag` should be called on mutation
- **Fix**: Add `revalidateTag('categories')` etc. in CRUD actions

### 6. Bundle bloat from monolith client components
- **Issue**: `InventoryClient.tsx` (995 lines) imports 17 server actions, recharts, dialog, sheet, table, toast, etc.
- **Risk**: Large JS bundle for admin pages
- **Fix**: Code-split tabs with dynamic imports (`next/dynamic`)

## SECURITY HAZARDS

### 1. Committed `.env` with secret key
- See #1 in Detected Anti-Patterns
- **Immediate action required**: Rotate keys, remove from git history

### 2. No rate limiting
- **Issue**: Auth endpoints (`signIn`, `signUp`) have no rate limiting — brute force attack vector
- **Severity**: MEDIUM
- **Fix**: Implement at Supabase level (Supabase Auth has built-in rate limiting) or via middleware

### 3. No CSRF protection
- **Issue**: Server Actions are CSRF-protected by Next.js (SameSite cookies), but if any action reads cookies implicitly there's no explicit token check
- **Severity**: LOW (Next.js handles this)
- **Fix**: Ensure all actions use `createClient()` which reads cookies via `next/headers`

### 4. No input sanitization
- **Issue**: All action inputs are used directly in Supabase queries (parameterized queries protect against SQL injection, but XSS vectors exist in rendered content)
- **Severity**: LOW (Supabase uses parameterized queries; XSS mitigated by React's JSX escaping)
- **Fix**: Sanitize HTML in user-supplied CMS content before rendering

### 5. No audit logging for sensitive actions
- **Issue**: Role changes (`updateUserRole`), deletions (`deleteOrder`), and status overrides have no audit trail
- **Severity**: MEDIUM
- **Fix**: Log to `analytics_events` table on sensitive mutations

## SCALABILITY HAZARDS

### 1. No connection pooling configuration
- **Issue**: `pg` and `@supabase/supabase-js` are used without explicit pooling setup
- **Severity**: LOW for current scale, HIGH at growth
- **Fix**: Configure Supabase connection pooling (PgBouncer) in `next.config.ts`

### 2. Serverless cold starts
- **Issue**: Vercel serverless functions + Supabase connection overhead per invocation
- **Severity**: MEDIUM for Pacific region users connecting to `us-east2`
- **Fix**: Already mitigated via `createAnonClient()` for public reads. For auth'd requests, consider Supabase Pooler.

### 3. No CDN for static assets
- **Issue**: Images served from various external domains (unsplash, pexels, etc.) — no image optimization pipeline
- **Severity**: LOW
- **Fix**: Use `next/image` with remote patterns (already configured) and consider migrating assets to Supabase Storage

## ARCHITECTURAL RISKS

### 1. Mixed abstraction layers
- Server Actions sometimes inline Supabase queries, sometimes delegate to repositories/services, sometimes both
- No consistent data access pattern

### 2. No separation between public and admin actions
- `catalog.ts` mixes public product queries with admin CRUD (createCategory, deleteBrand)
- `admin.ts` duplicates functions from `cms.ts` and `orders.ts`

### 3. Empty route groups and folders
- `(static-pages)/` — empty route group
- `orders/[id]/` — empty (individual order detail not built)
- `features/`, `hooks/`, `server/`, `styles/` — scaffolding with no content

### 4. Incomplete navigation
- `AccountNav.tsx` links to `/account/settings` but route does not exist (settings page only in admin)
- Homepage hero CTA text not aligned with target audience

## DO NOT INTRODUCE

- **DO NOT** add REST API routes — use Server Actions only
- **DO NOT** add Redux or Context providers for state — use Zustand or React Query
- **DO NOT** add CSS-in-JS libraries (styled-components, emotion) — use Tailwind
- **DO NOT** add new database clients (Prisma already included but barely used; stick with Supabase JS)
- **DO NOT** add `getSession()` calls in server code — use `getUser()`
- **DO NOT** add inline `<img>` tags — use `next/image` with proper remotePatterns config
- **DO NOT** add `"use client"` unnecessarily — prefer Server Components
- **DO NOT** add new route groups without content
- **DO NOT** commit `.env` files or any secrets to git
