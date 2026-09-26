import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Only protect routes that strictly require authentication
  const protectedPaths = ["/account", "/checkout"]
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))

  // Fast path: Check if there's any Supabase auth cookie present
  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith("sb-") && c.name.includes("auth-token")
  )

  // If this is a public route and there are no auth cookies, return immediately without remote network calls
  if (!isProtected && !hasAuthCookie) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://efirqiluvuerurnpptfm.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_xHWxpegsG3AQTZt4mqubiQ_it5Go61G"

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
