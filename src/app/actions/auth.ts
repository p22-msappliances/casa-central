"use server";

import { createClient } from '@/lib/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Database } from '@/types/database.types'

// Define Profile type matching the database schema
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export async function signOut() {
  const cookieStore = await cookies()
  const supabase = await createClient()
  
  // 1. Sign out from Supabase Auth
  await supabase.auth.signOut()
  
  // 2. Force clear all Supabase cookies to prevent session persistence
  const allCookies = cookieStore.getAll()
  allCookies.forEach(cookie => {
    if (cookie.name.startsWith('sb-')) {
      cookieStore.set(cookie.name, '', { maxAge: 0 })
    }
  })

  redirect('/')
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Sign in error:", error.message)
    return {
      error: error.message,
    }
  }

  redirect('/')
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName,
        lastName,
      },
    },
  })

  if (authError) {
    console.error("Sign up error:", authError.message)
    return {
      error: authError.message,
    }
  }

  redirect('/auth/check-email')
}
