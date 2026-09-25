import { createBrowserClient } from "@supabase/ssr"
import { Database } from "@/types/database"

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://efirqiluvuerurnpptfm.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_xHWxpegsG3AQTZt4mqubiQ_it5Go61G"

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
