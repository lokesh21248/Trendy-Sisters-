import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { path } = body

    if (!path) {
      return NextResponse.json({ success: false, error: "Path is required" }, { status: 400 })
    }

    revalidatePath(path)
    console.log(`[API /api/admin/revalidate] Revalidated path: ${path}`)

    return NextResponse.json({ success: true, message: `Revalidated ${path}` })
  } catch (err: any) {
    console.error("[API /api/admin/revalidate] Exception:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
