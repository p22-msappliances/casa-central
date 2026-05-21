# CASA CENTRAL — Persistent Project Truths

## Project Identity
- **Product**: CASA CENTRAL — premium appliances & audio e-commerce store
- **Domain**: Operating at `casacentralstore.vercel.app` (Vercel)
- **Target Market**: Philippines (Metro Manila, Quezon City)
- **Stack**: Next.js 16.2.6 (Turbopack) + React 19 + Supabase (Postgres 14.5) + Prisma 7.8
- **Auth Admin Email**: `msappliances@gmail.com` (role: ADMIN)
- **Git Author** (local): `p22.msappliances@gmail.com`

## Architectural Priorities
1. **Server Components first** — data fetch in RSC, pass to thin client components for interactivity only
2. **Server Actions only** — NO REST API routes, all mutations/reads via `"use server"` functions
3. **Batch + parallel DB** — always batch-fetch, compute in memory, execute updates in parallel
4. **Cursor pagination** for admin queries, offset-based only for public catalog page numbers
5. **Anonymous client** for public reads (`createAnonClient` avoids cookie overhead + `unstable_cache` conflicts)

## Critical Constraints
- **No `cookies()` inside `unstable_cache`** — use `createAnonClient()` instead of `createClient()` for cached functions
- **Supabase publishable key** is used server-side (not the service role key); RLS enforces row-level security
- **`database.types.ts` is partially stale** — tables like `vendors`, `warehouse_transfers`, `transfer_items`, `purchase_orders`, `purchase_order_items` are used in actions but missing from types; fields like `is_virtual`, `is_active` on `warehouses` also missing
- **`.env` contains real Supabase secret key and is committed** — DO NOT expose further; rotate if compromised
- **No tests exist** — manual verification required for all changes
- **No Docker/CI-CD** — Vercel auto-deploys from `origin` main branch

## Engineering Doctrine
- Return `{ success: true, data }` or `{ success: false, error: string }` from all server actions
- `createClient()` for authenticated ops, `createAnonClient()` for public reads
- Role checks at the top of every admin/mutating action: `profiles.role IN (ADMIN, SUPER_ADMIN, ...)`
- `revalidatePath()` after every mutation to bust Next.js cache
- `crypto.randomUUID()` for all IDs (never auto-increment)
- Inventory math: batch-fetch → in-memory calc → `Promise.all` parallel updates
- Order creation: deduct from largest stock first across all warehouses
- Always use `select('col1, col2')` not `select('*')` for explicit column selection

## Permanent System Rules
1. **Middleware**: root `middleware.ts` protects `/admin/*` and `/account/*` via `supabase.auth.getUser()` + profile role check
2. **Two Supabase remotes**: push to both `origin` (CodeRats456) and `p22` (p22-msappliances)
3. **Admin routes**: all nested under `/admin` with shared layout + `AdminSidebar`
4. **Account routes**: all nested under `/account` with shared layout + `AccountNav`
5. **Cart state**: Zustand store persisted to localStorage — NO cart table in Supabase
6. **Addresses**: stored as a single string field on `profiles.address` — NOT in a separate addresses table

## Non-Negotiable Patterns
- All server actions must check auth via `supabase.auth.getUser()` not `getSession()`
- Public catalog actions use `createAnonClient()` — no cookie overhead
- All IDs are UUIDs; display short codes as `#ID.slice(0, 8).toUpperCase()`
- Order status machine: PENDING → PROCESSING → SHIPPED → DELIVERED (CANCELLED from PENDING/PROCESSING only)
- Payment status machine: PENDING → COMPLETED → FAILED
- Inventory transfer status: PENDING → IN_TRANSIT → DELIVERED
- PO status: DRAFT → ORDERED → SHIPPED → RECEIVED
- Role hierarchy: SUPER_ADMIN > ADMIN > INVENTORY_MANAGER > EDITOR > CUSTOMER_SUPPORT > CUSTOMER
