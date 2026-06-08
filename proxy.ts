import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // 1. Buat response dasar terlebih dahulu
  const supabaseResponse = NextResponse.next({
    request,
  })

  // 2. Inisialisasi Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Penting: Gunakan supabaseResponse yang sudah ada di atas
          // Jangan buat NextResponse.next() baru di sini agar header/cookies tidak hilang
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 3. Refresh session & ambil user
  // Ini penting untuk memastikan cookie session valid sebelum dicek
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. Daftar route publik (tidak butuh login)
  const publicRoutes = [
    '/login',
    '/landing',
    '/auth/callback',
    '/api/transcribe',
    '/api/parse-ledger',
    '/api/generate-copy',
  ]

  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // 5. Protected routes yang memerlukan autentikasi
  const protectedRoutes = [
    '/dashboard',
    '/riwayat',
    '/budget',
    '/analisis',
    '/marketing',
  ]

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // 6. Redirect jika user belum login dan mencoba akses route privat
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/landing'
    // Opsional: tambahkan query param redirect agar user kembali ke halaman asal setelah login
    // url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // 7. Redirect jika user sudah login dan mengakses halaman login
  if (request.nextUrl.pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 8. Add security headers untuk mencegah caching halaman yang dilindungi
  if (isProtectedRoute) {
    supabaseResponse.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    )
    supabaseResponse.headers.set('Pragma', 'no-cache')
    supabaseResponse.headers.set('Expires', '0')
    supabaseResponse.headers.set(
      'Surrogate-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
  }

  // 9. Kembalikan response yang sudah diperbarui cookies-nya
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match semua request paths kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - File asset umum (svg, png, jpg, dll)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
