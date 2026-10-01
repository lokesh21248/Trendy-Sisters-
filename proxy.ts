import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Public routes that MUST ALWAYS be accessible without authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/shop(.*)",
  "/collections(.*)",
  "/new-arrivals(.*)",
  "/about(.*)",
  "/support(.*)",
  "/product/(.*)",
  "/categories(.*)",
  "/category/(.*)",
  "/cart(.*)",
  "/wishlist(.*)",
  "/faq(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/returns(.*)",
  "/shipping(.*)",
  "/size-guide(.*)",
  "/blog(.*)",
  "/careers(.*)",
  "/auth/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
])

// Protected routes that strictly require an authenticated customer/admin session
const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/orders(.*)",
  "/order(.*)",
  "/checkout(.*)",
  "/profile(.*)",
  "/admin(.*)",
])

export const proxy = clerkMiddleware(async (auth, request) => {
  // 1. Explicitly allow public routes without authentication
  if (isPublicRoute(request)) {
    return
  }

  // 2. Protect only designated routes
  if (isProtectedRoute(request)) {
    const signInUrl = new URL("/auth/login", request.url)
    const destinationPath = request.nextUrl.pathname + request.nextUrl.search
    signInUrl.searchParams.set("redirect_url", destinationPath)
    await auth.protect({
      unauthenticatedUrl: signInUrl.toString(),
    })
  }
})

export default proxy

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
