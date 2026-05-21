import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error && error.name !== 'AuthSessionMissingError') {
    console.error('Auth getUser error:', error)
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname === '/sign-in' || request.nextUrl.pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Protect Admin Routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('🛡️ Admin check for path:', request.nextUrl.pathname)
    if (!user) {
      console.log('🛡️ Middleware: No user found, redirecting to /sign-in')
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('🛡️ Profile fetch error:', profileError)
    }

    console.log('🛡️ Middleware: UserID:', user.id, 'Role:', profile?.role)

    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
      console.log('🛡️ Middleware: Unauthorized role, redirecting to /')
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Also protect account routes
  if (request.nextUrl.pathname.startsWith('/account') && !user) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/sign-in',
    '/sign-up',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
