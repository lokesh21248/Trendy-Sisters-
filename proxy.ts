import { clerkMiddleware } from "@clerk/nextjs/server"
import { updateSession } from "@/lib/supabase/middleware"

export const proxy = clerkMiddleware(async (auth, request) => {
  return await updateSession(request)
})

export default proxy

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
}

