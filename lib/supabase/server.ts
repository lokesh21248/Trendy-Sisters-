import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { Database } from "@/types/database"

export function createStaticClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://efirqiluvuerurnpptfm.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_xHWxpegsG3AQTZt4mqubiQ_it5Go61G"

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (url, options = {}) =>
        fetch(url, { ...options, cache: "no-store" }),
    },
  })
}

export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://efirqiluvuerurnpptfm.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_xHWxpegsG3AQTZt4mqubiQ_it5Go61G"

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - cookies can be read but not set
          }
        },
      },
    }
  )
}
