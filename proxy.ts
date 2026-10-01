import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isAccountRoute = createRouteMatcher(["/account(.*)"])
const isAdminRoute = createRouteMatcher(["/admin(.*)"])

export const proxy = clerkMiddleware(async (auth, request) => {
  if (isAccountRoute(request) || isAdminRoute(request)) {
    const signInUrl = new URL("/auth/login", request.url)
    signInUrl.searchParams.set("redirect_url", request.url)
    await auth.protect({
      unauthenticatedUrl: signInUrl.toString(),
    })
  }
})

export default proxy


export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
}

