# CASA CENTRAL — Supabase Integration Rules

## Connection Architecture

### Client Hierarchy
```
Browser Client (client.ts)
  └─ Singleton createBrowserClient() — for browser-side auth state

Server Client (server.ts)
  ├─ createClient()       — full cookie handling (auth'd operations)
  └─ createAnonClient()   — empty cookies (public reads, cached functions)

Middleware Helper (lib/middleware.ts)
  └─ Standalone createServerClient — reads/writes request cookies directly
```

### Client Selection Guide
| Use Case | Client | Why |
|----------|--------|-----|
| Admin page data fetch | `createClient()` | Auth required |
| User profile read/update | `createClient()` | Auth required |
| Order creation | `createClient()` | Auth + user context |
| Product catalog (public) | `createAnonClient()` | No cookie overhead |
| Categories/brands (cached) | `createAnonClient()` | Compatible with `unstable_cache` |
| Warehouses/vendors (cached) | `createAnonClient()` | Compatible with `unstable_cache` |
| Client-side auth state | `client.ts` singleton | Browser Supabase client |

### CRITICAL: `unstable_cache` + `createClient()` = Runtime Error
```
Route used cookies() inside a function cached with unstable_cache()
```
**Fix**: Use `createAnonClient()` inside `unstable_cache` callbacks. Never `createClient()`.

## Authentication

### Sign-In Flow
1. User submits email/password via `<form action={signIn}>`
2. `signIn()` calls `supabase.auth.signInWithPassword()`
3. On success → `redirect('/')`
4. On error → returns `{ error: message }` to form

### Sign-Up Flow
1. User submits first_name, last_name, email, password
2. `signUp()` calls `supabase.auth.signUp()` with `options.data: { firstName, lastName }`
3. On success → `redirect('/auth/check-email')`
4. Profile record is created by **DB trigger** (not in action code)

### Sign-Out Flow
1. Calls `supabase.auth.signOut()`
2. Gets all cookies, clears any starting with `sb-` (sets maxAge: 0)
3. `redirect('/')`

### Middleware Auth Guard
```ts
// middleware.ts
const { data: { user } } = await supabase.auth.getUser()
if (!user && protectedRoute) redirect('/sign-in')
if (user && adminRoute) {
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!['ADMIN', 'SUPER_ADMIN'].includes(profile?.role)) redirect('/')
}
```

## Role-Based Access Control

### Role Hierarchy
```
SUPER_ADMIN → full access including role changes and order deletion
ADMIN       → full admin except role changes
INVENTORY_MANAGER → inventory, transfers, POs, warehouses
EDITOR      → CMS content management
CUSTOMER_SUPPORT → order status updates
CUSTOMER    → own profile, orders, wishlist, reviews
```

### Role Check Pattern
```ts
const { data: profile } = await supabase
  .from("profiles").select("role").eq("id", user.id).single()
if (!profile || !["ADMIN", "SUPER_ADMIN", "INVENTORY_MANAGER"].includes(profile.role)) {
  return { success: false, error: "Unauthorized" }
}
```

### Per-Action Role Requirements
| Action | Required Role |
|--------|---------------|
| createProduct, updateProduct, deleteProduct | ADMIN, SUPER_ADMIN |
| createCategory, updateCategory, deleteCategory | ADMIN, SUPER_ADMIN, EDITOR |
| createBrand, updateBrand, deleteBrand | ADMIN, SUPER_ADMIN, EDITOR |
| getAdminOrders, updateOrderStatus | ADMIN, SUPER_ADMIN, CUSTOMER_SUPPORT |
| deleteOrder | SUPER_ADMIN only |
| updateUserRole | SUPER_ADMIN only |
| getAdminCustomers | ADMIN, SUPER_ADMIN |
| getAllInventory, addInventory, adjustInventory | ADMIN, SUPER_ADMIN, INVENTORY_MANAGER |
| createTransfer, updateTransferStatus | ADMIN, SUPER_ADMIN, INVENTORY_MANAGER |
| createPurchaseOrder, updatePOStatus | ADMIN, SUPER_ADMIN, INVENTORY_MANAGER |
| createVendor, updateVendor, deleteVendor | ADMIN, SUPER_ADMIN, INVENTORY_MANAGER |
| upsertCMSContent, updateCMSContent | ADMIN, SUPER_ADMIN, EDITOR |

## Database Patterns

### RLS Policy Summary
- Public reads allowed on `products`, `product_variants`, `categories`, `brands`, `promotions`, `warehouses`
- Authenticated reads/writes on own `profiles`, `orders`, `order_items`, `reviews`, `wishlist`
- Admin roles bypass row-level restrictions via `get_my_role()` function
- Inventory/transfer/PO tables restricted to admin/inventory_manager roles

### Query Patterns

#### Explicit Column Selection (MANDATORY)
```ts
// GOOD
supabase.from('products').select('id, name, slug, base_price')
// BAD
supabase.from('products').select('*')
```

#### Join Pattern
```ts
// Single level
supabase.from('orders').select('id, status, profiles(email, first_name)')
// Multi-level
supabase.from('order_items').select('..., product_variants(products(category(name)))')
```

#### Upsert Pattern (inventory)
```ts
const { data: existing } = await supabase
  .from('inventory').select('id, quantity')
  .eq('variant_id', vid).eq('warehouse_id', wid).single()
if (existing) {
  await supabase.from('inventory').update({ quantity: existing.quantity + delta }).eq('id', existing.id)
} else {
  await supabase.from('inventory').insert({ variant_id: vid, warehouse_id: wid, quantity: delta })
}
```

#### Batch Inventory Update (Order Creation)
```ts
// Fetch all variant stock in one query
const { data: inventoryRows } = await supabase
  .from('inventory').select('variant_id, warehouse_id, quantity')
  .in('variant_id', variantIds)
  .not('warehouse_id', 'is', null)

// Group by variant, sort by quantity desc (largest first)
const byVariant = groupBy(inventoryRows, 'variant_id')
for (const [vid, rows] of byVariant) {
  rows.sort((a, b) => b.quantity - a.quantity)
  let needed = requestedQuantity
  for (const row of rows) {
    const take = Math.min(row.quantity, needed)
    row.quantity -= take  // in-memory
    needed -= take
    if (needed <= 0) break
  }
}

// Execute all updates in parallel
await Promise.all(updates.map(u => supabase.from('inventory').update(u).eq('id', u.id)))
```

## TypeScript Types

### Usage
```ts
import { Database } from '@/types/database.types'
type Product = Database["public"]["Tables"]["products"]["Row"]
type OrderStatus = Database["public"]["Enums"]["order_status"]
```

### Known Gaps
- `@ts-nocheck` at top of `database.types.ts` suppresses generation errors
- Missing tables: `vendors`, `warehouse_transfers`, `transfer_items`, `purchase_orders`, `purchase_order_items`
- Missing fields: `warehouses.is_virtual`, `warehouses.is_active`
- When accessing these, cast with `as any` or define local types

### Re-generation Command
```sh
npx supabase gen types typescript --project-id oejsnylgljtnuvyxzeub > src/types/database.types.ts
```

## Performance Notes

### Indexes (created via migration)
- `idx_products_name_trgm` — trigram for ILIKE searches
- `idx_products_category_brand` — composite for catalog filters
- `idx_products_base_price` — for price range filtering
- `idx_inventory_variant_warehouse` — composite for stock lookups
- `idx_profiles_role` — for admin role checks
- `idx_orders_created_at` — for cursor pagination
- `idx_products_created_at` — for sorting/bypass
- And 9 more on FK columns and cursor fields

### Known Slow Queries (to optimize)
- `getAdminStats()`: full table scan on `orders.total_amount` for revenue calc → use materialized view or summary table at scale
- `getDashboardCharts()`: processes all orders in-memory for monthly aggregation → use SQL GROUP BY with date_trunc
- `getAllInventory()`: no pagination → add cursor-based pagination

## Deployment
- Supabase project ref: `oejsnylgljtnuvyxzeub` (production)
- Gemini project ref: `wudictfjcqsrkwiutqpq` (likely a branch/preview)
- RLS policies must be migrated alongside schema changes
- Use `supabase_apply_migration` tool for DDL operations
