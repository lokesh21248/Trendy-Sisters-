import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Database } from "@/types/database"

function getSupabaseClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://efirqiluvuerurnpptfm.supabase.co"
  const apiKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_xHWxpegsG3AQTZt4mqubiQ_it5Go61G"

  return createSupabaseClient<Database>(supabaseUrl, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// GET /api/profile/sync
// Returns profile for currently authenticated user
export async function GET(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await auth()
    const { searchParams } = new URL(req.url)
    const userId = sessionUserId || searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: User ID required" },
        { status: 401 }
      )
    }

    const supabase = getSupabaseClient()
    const { data: profile, error } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (error) {
      console.warn("[Profile Sync GET] Query warning:", error.message)
      return NextResponse.json({ success: true, profile: null })
    }

    return NextResponse.json({ success: true, profile })
  } catch (err: any) {
    console.error("[Profile Sync GET] Error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/profile/sync
// Creates or updates customer profile in Supabase
export async function POST(req: NextRequest) {
  try {
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      body = {}
    }

    const { userId: clerkSessionUserId } = await auth()
    const userId = clerkSessionUserId || body.userId || body.id

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Active Clerk session or userId required." },
        { status: 401 }
      )
    }

    let clerkUser: any = null
    try {
      clerkUser = await currentUser()
    } catch {
      // currentUser may fail if cookies not yet present
    }

    const email =
      body.email ||
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      null
    const fullName =
      body.full_name ||
      body.fullName ||
      (clerkUser?.firstName
        ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
        : null)
    const phone =
      body.phone ||
      clerkUser?.phoneNumbers?.[0]?.phoneNumber ||
      null
    const avatarUrl =
      body.avatar_url || body.avatarUrl || clerkUser?.imageUrl || null

    const supabase = getSupabaseClient()

    // Check if profile exists
    const { data: existingProfile } = await (supabase as any)
      .from("profiles")
      .select("id, created_at")
      .eq("id", userId)
      .maybeSingle()

    const now = new Date().toISOString()

    if (existingProfile) {
      const updateData: Record<string, any> = {
        updated_at: now,
      }
      if (email) updateData.email = email
      if (fullName) updateData.full_name = fullName
      if (phone) updateData.phone = phone
      if (avatarUrl) updateData.avatar_url = avatarUrl

      const { error: updateError } = await (supabase as any)
        .from("profiles")
        .update(updateData)
        .eq("id", userId)

      if (updateError) {
        console.warn("[Profile Sync API] Update warning:", updateError.message)
        return NextResponse.json({ success: false, warning: updateError.message })
      }

      return NextResponse.json({
        success: true,
        action: "updated",
        userId,
      })
    } else {
      const insertData = {
        id: userId,
        email: email || null,
        full_name: fullName || null,
        phone: phone || null,
        avatar_url: avatarUrl || null,
        created_at: now,
        updated_at: now,
      }

      const { error: insertError } = await (supabase as any)
        .from("profiles")
        .insert(insertData)

      if (insertError) {
        console.warn("[Profile Sync API] Insert warning:", insertError.message)
        return NextResponse.json({ success: false, warning: insertError.message })
      }

      return NextResponse.json({
        success: true,
        action: "created",
        userId,
      })
    }
  } catch (err: any) {
    console.error("[Profile Sync API] Exception:", err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
