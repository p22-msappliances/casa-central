# CASA CENTRAL — Architecture

## System Type
Single-repo e-commerce platform. Monolith Next.js App Router with Supabase backend. No microservices, no API gateway, no message queue. All backend logic lives in Next.js Server Actions.

## Application Structure

```
src/
├── app/                    # Next.js App Router
│   ├── actions/            # 12 Server Action files (backend)
│   ├── admin/              # Admin dashboard (10 routes)
│   ├── account/            # User account (4 routes)
│   ├── products/           # Public catalog (2 routes)
│   └── ...                 # Static pages (12 routes)
├── components/
│   ├── admin/              # Admin UI (3 files)
│   ├── auth/               # Auth forms (3 files)
│   ├── providers/          # React Query (1 file)
│   └── ui/                 # shadcn + custom UI (25+ files)
├── lib/                    # Supabase clients + utils
├── types/                  # DB types + DTOs
├── repositories/           # Data access layer (partial, 2 files)
├── services/               # Business logic layer (partial, 2 files)
├── store/                  # Zustand cart (1 file)
└── middleware.ts           # Root auth guard
```

## Frontend Architecture

### Rendering Strategy
| Pattern | Count | Routes |
|---------|-------|--------|
| Static Server Component | 10 | about, privacy, terms, promotions, auth/*, sign-in, sign-up |
| Async Server Component | ~12 | admin/*, account/*, products/* |
| Full Client Component | 5 | checkout, contact, search, admin/orders, admin/products |
| Server → Client delegate | 8 | account/profile, account/addresses, account/wishlist, admin/inventory, admin/brands, admin/categories, admin/cms, admin/promotions |

### Component Patterns
- **Server → Client Delegation**: Server page fetches data → passes as props to `"use client"` component → client handles mutations/refetch
- **Admin patterns**: 3 variants:
  1. Thin server page + fat client (inventory: 10-line server + 995-line client)
  2. Fully client-side (products: uses `@tanstack/react-query`)
  3. Server-rendered (customers: inline JSX, no client interactivity)

### State Management
- **Cart**: Zustand persisted to `localStorage` (`casa-central-cart` key) — no DB cart table
- **Catalog queries**: `@tanstack/react-query` with 30s staleTime, 5min gcTime, 2 retries
- **Local state**: `useState` in most client components
- **No Redux, no Context** (except QueryClientProvider)

### Styling
- Tailwind v4 with `@theme inline` custom properties
- Color space: `oklch` throughout
- Brand: navy (`#0A1F3F`), gold (`#C9A84C`), cream (`#F5F0E8`)
- Animation: `framer-motion` (Reveal, Sparkles, ProductGallery carousel)
- shadcn `base-nova` style

## Backend Architecture

### Server Actions (12 files, ~2,400 lines)
All backend logic is in `src/app/actions/`:

```
auth.ts         — signIn, signUp, signOut
admin.ts        — stats, dashboard charts, orders, CMS
catalog.ts      — public product queries, categories, brands
products.ts     — product CRUD + variant CRUD
orders.ts       — createOrder, updateStatus, recordPayment
inventory.ts    — inventory, warehouses, transfers, POs, vendors (largest: 804 lines)
profiles.ts     — profile CRUD, admin customer list, role updates
promotions.ts   — promotion CRUD
cms.ts          — CMS content CRUD
addresses.ts    — read/update address (stored on profile)
wishlist.ts     — toggle wishlist
reviews.ts      — product reviews CRUD
```

### Data Flow
```
Browser → Server Action → Supabase Client → Supabase RLS → PostgreSQL
            │
            ├─ createClient()  → authenticated (cookies from request)
            └─ createAnonClient() → unauthenticated (no cookies, for public reads)
```

### Supabase Client Strategy
| Client | cookies() | Used For |
|--------|-----------|----------|
| `createClient()` (server.ts) | Yes — full cookie read/write | Auth, admin, mutations, profile |
| `createAnonClient()` (server.ts) | No — empty cookies | Public catalog, cached reads |
| `createClient()` (client.ts) | Browser singleton | Browser-side auth |

### Route Protection Flow
```
Request → middleware.ts
  ├─ checks supabase.auth.getUser()
  ├─ /admin/* → checks profiles.role IN (ADMIN, SUPER_ADMIN)
  ├─ /account/* → checks authenticated
  ├─ /sign-in, /sign-up → redirects authenticated users away
  └─ pass-through for public routes
```

### Database Schema

#### Core Tables
```
profiles          → id, email, first_name, last_name, phone, address, role (enum)
products          → id, name, slug, base_price, description, brand_id→brands, category_id→categories
product_variants  → id, product_id→products, sku, price, attributes(JSON), image_url
inventory         → id, variant_id→product_variants, warehouse_id→warehouses, quantity, low_stock_threshold
warehouses        → id, name, location, is_virtual, is_active
orders            → id, user_id→profiles, total_amount, status(enum), shipping_address
order_items       → id, order_id→orders, variant_id→product_variants, quantity, price_at_purchase
payments          → id, order_id→orders, amount, method, status(enum), transaction_id
categories        → id, name, slug, parent_category_id→categories(self), description
brands            → id, name, slug, description, image_url
promotions        → id, name, code, discount_type(PERCENT/FLAT), discount_value, dates, active
reviews           → id, product_id→products, user_id→profiles, rating, comment
wishlist          → id, user_id→profiles, product_id→products
cms_content       → id, key, value(JSON), type(BANNER/PAGE/SECTION)
analytics_events  → id, user_id, event_type, metadata(JSON)
```

#### Additional Tables (used in actions, not in generated types)
```
vendors           → id, name, contact_email, contact_phone, address, notes
warehouse_transfers → id, from_warehouse_id, to_warehouse_id, status, notes, created_by
transfer_items    → id, transfer_id, variant_id, quantity
purchase_orders   → id, vendor_id, status, notes, created_at, updated_at
purchase_order_items → id, po_id, variant_id, quantity, unit_cost
```

#### Enums
```
role_name:         SUPER_ADMIN | ADMIN | INVENTORY_MANAGER | EDITOR | CUSTOMER_SUPPORT | CUSTOMER
order_status:      PENDING | PAID | SHIPPED | DELIVERED | CANCELLED
payment_status:    PENDING | COMPLETED | FAILED
discount_type:     PERCENT | FLAT
cms_content_type:  BANNER | PAGE | SECTION
```

## Key Systems

### Inventory System (inventory.ts, 804 lines)
```
getAllInventory()       — full inventory read
addInventory()          — upsert variant + warehouse combo
adjustInventory()       — delta adjustment (floor 0)
createTransfer()        — move stock between warehouses (batch source check → parallel update)
updateTransferStatus()  — cancel reverses inventory (batch parallel)
createPurchaseOrder()   — DRAFT → ORDERED → SHIPPED → RECEIVED
updatePOStatus()        — RECEIVED adds inventory; cancel after received reverses
Low stock detection     — quantity < low_stock_threshold
```
- All inventory math: batch-fetch → in-memory → `Promise.all` parallel DB writes
- Warehouse transfers: deduct from source → check availability → add to dest (atomic in app logic)

### Order System (orders.ts, 271 lines)
```
createOrder()
  1. Batch-fetch inventory for all variant_ids
  2. In-memory stock check (ALL items must have sufficient stock)
  3. Calculate deductions (largest stock first per variant, across warehouses)
  4. Parallel inventory quantity updates
  5. Create order (PENDING), batch insert order_items
  6. Rollback: delete order if items insert fails
```
- Stock check includes ALL warehouses (sums inventory per variant)
- Deduction strategy: consume from warehouse with most stock first
- No reservation/locking — race condition window exists

### Cart System (store/useCartStore.ts)
- Client-only Zustand store persisted to `localStorage`
- Items stored with variant_id + quantity + price_at_purchase
- Stock limits enforced at add-to-cart time (max = available stock across all warehouses)
- `getTotalPrice`, `getTotalItems` selectors
- No server-side cart persistence

### Caching Strategy
```
unstable_cache:
  ├─ categories  → 1hr TTL, tag: 'categories'
  ├─ brands      → 1hr TTL, tag: 'brands'
  ├─ warehouses  → 1hr TTL, tag: 'warehouses'
  └─ vendors     → 1hr TTL, tag: 'vendors'

React Query (client):
  └─ Products in catalog → 30s staleTime, 5min gcTime
```

## Infrastructure
- **Hosting**: Vercel (auto-deploy from `origin` master)
- **Database**: Supabase PostgreSQL 14.5 (`us-east2`)
- **Image domains**: unsplash.com, pexels.com, geappliancesdistributor.ph, lg.com, cdn.mos.cms.futurecdn.net, upscaleaudio.com, pico-sa.com, mechcool.co.uk, brittany.com.ph, images.squarespace-cdn.com
- **Dev tunnel**: `0j6jdsnq-3000.asse.devtunnels.ms` (allowed in `serverActions.allowedOrigins`)

## Routes
- **29 routes total**: 27 page routes + robots.ts + sitemap.ts
- **No API routes**: 100% Server Actions
- **Dynamic routes**: `/products/[slug]` only

## Architecture Diagrams

### Request Flow
```
                    ┌─────────────────┐
                    │   Browser/User   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  middleware.ts   │
                    │  (auth guard)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───┐  ┌──────▼──────┐  ┌───▼────────┐
     │ Server     │  │ Client      │  │ Server     │
     │ Component  │  │ Component   │  │ Action     │
     │ (async)    │  │ ("use       │  │ ("use      │
     │            │  │  client")   │  │  server")  │
     └────────┬───┘  └──────┬──────┘  └───┬────────┘
              │             │             │
              │       ┌─────▼─────┐       │
              │       │ Server    │       │
              └──────►│ Action    │◄──────┘
                      │ (call)    │
                      └─────┬─────┘
                            │
                      ┌─────▼─────┐
                      │  Supabase │
                      │  Client   │
                      └─────┬─────┘
                            │
                      ┌─────▼─────┐
                      │ PostgreSQL│
                      │ + RLS     │
                      └───────────┘
```

### Page Rendering Decision
```
Route requested
  ├─ Static page? (about, privacy, terms, etc.)
  │   └─ Server Component (no async)
  ├─ Needs real data?
  │   ├─ Admin/Account page?
  │   │   ├─ Needs interactivity? → Server page fetches → delegates to Client
  │   │   └─ Read-only? → Server Component (async, inline render)
  │   ├─ Catalog page?
  │   │   └─ Server Component fetches initial → Client handles filtering/pagination
  │   └─ Order/Checkout?
  │       └─ Full Client Component (maximal interactivity)
  └─ Not found? → 404 page
```

### Admin Architecture
```
/admin
├── layout.tsx        → AdminSidebar (Suspense) + main content
├── page.tsx          → Dashboard (stats + charts)
├── products/         → Full client (React Query)
├── categories/       → Server → Client delegate
├── brands/           → Server → Client delegate
├── inventory/        → Server → Client delegate (largest)
├── orders/           → Full client (useEffect)
├── customers/        → Server (inline render)
├── cms/              → Server → Client delegate
├── promotions/       → Server → Client delegate
└── settings/         → Static (not wired)
```
