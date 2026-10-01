import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Database } from "@/types/database"

function getSupabaseClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://efirqiluvuerurnpptfm.supabase.co"
  const apiKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
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
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
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
      return NextResponse.json({ success: true, profile: null })
    }

    return NextResponse.json({ success: true, profile })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/profile/sync
// Authenticated endpoint that creates or updates the customer profile using verified Clerk userId
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Active Clerk session required." },
        { status: 401 }
      )
    }

    let body: any = {}
    try {
      body = await req.json()
    } catch {
      body = {}
    }

    const clerkUser = await currentUser()
    const email =
      body.email ||
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      ""
    const fullName =
      body.full_name ||
      (clerkUser?.firstName
        ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
        : "")
    const phone =
      body.phone ||
      clerkUser?.phoneNumbers?.[0]?.phoneNumber ||
      null
    const avatarUrl =
      body.avatar_url || clerkUser?.imageUrl || null

    const supabase = getSupabaseClient()

    // 1. Check if profile already exists for this authenticated Clerk user ID
    const { data: existingProfile, error: queryError } = await (supabase as any)
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    if (queryError) {
      console.warn("[Profile Sync API] Query warning:", queryError.message)
      return NextResponse.json({
        success: false,
        warning: queryError.message,
        userId,
      })
    }

    if (existingProfile) {
      // 2. Profile already exists -> update it (avoid duplicate profile creation)
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
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
      // 3. Profile does not exist -> create it
      const insertData = {
        id: userId,
        email: email || null,
        full_name: fullName || null,
        phone: phone || null,
        avatar_url: avatarUrl || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
