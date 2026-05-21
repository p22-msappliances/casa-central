<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Session Summary (May 21, 2026)

### Completed
- **Wired Dashboard Charts**: Monthly sales area chart + category revenue bar chart via `getDashboardCharts` in `admin.ts`.
- **Fixed Cache Runtime Error**: Replaced `createClient()` with `createAnonClient()` inside `unstable_cache` in `inventory.ts`.
- **Forgot Password**: Implemented `resetPassword` action calling `supabase.auth.resetPasswordForEmail()`. Wired form in `forgot-password/page.tsx`.
- **Reset Password Page**: Created `reset-password/page.tsx` — calls `supabase.auth.updateUser({ password })`.
- **Account Settings Page**: Created `account/settings/page.tsx` — notification preferences + privacy toggles.
- **Order Detail Page**: Created `orders/[id]/page.tsx` — full order with items, payments, shipping, status.
- **Contact Form Wired**: `contact/page.tsx` now calls `submitContact` action → stores in `analytics_events`.
- **Admin Settings Wired**: Form in `admin/settings/page.tsx` calls `saveAdminSettings` → upserts into `cms_content`.
- **Search Page**: Replaced 5 mock products with debounced `searchProducts()` server action.
- **Promotions Page**: Replaced 4 hardcoded promotions with live `promotions` table query.
- **Admin User Roles**: Added role update dropdown (SUPER_ADMIN only) calling `updateUserRole` (`admin/customers` → client component).
- **Newsletter**: Added `subscribeNewsletter` action + wired homepage email form.
- **Reviews**: `ProductDetailClient` now shows review list with star ratings + submission form via `addReview`/`getProductReviews`.
- **Admin Product Variants**: Dialog for create/delete variants with SKU, price, attributes JSON, image URL.
- **Price Range Filter**: FilterSidebar price slider wired to `getProducts` `priceRange` param in `ProductGridClient`.
- **Category Links Fixed**: Homepage cards use `/products?category={id}` for known slugs (refrigerators, washer); rest go to `/products`.
- **Checkout Payment**: Removed "Mock payment recording" comment — now clearly calls real `recordPayment`.
- **Repository Intelligence**: Created `ai/` directory with 5 files grounded in actual codebase analysis.

### Deferred (Require Schema Changes / External Integration)
- Guest Checkout, Social Login, Email Notifications, Cookie Consent, Zod Validation, Seed Data Script.

### Git Remote
- `origin` and `p22` — push to both when committing.
