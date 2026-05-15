// Re-export the new Supabase client
// This file exists for backward compatibility
export { createClient } from './client'

import { createBrowserClient } from '@supabase/ssr'

export function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

export const supabase = getSupabaseClient()
