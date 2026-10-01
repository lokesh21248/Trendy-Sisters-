import { currentUser, auth } from "@clerk/nextjs/server"

/**
 * Validates whether a given Clerk user has administrative access.
 * Checks Clerk metadata role, configured environment variables, and authorized admin emails.
 */
export function isUserAdmin(user: any): boolean {
  if (!user) return false

  // 1. Check Clerk Metadata (publicMetadata or unsafeMetadata)
  const publicRole = user.publicMetadata?.role
  const unsafeRole = user.unsafeMetadata?.role
  if (publicRole === "admin" || unsafeRole === "admin") {
    return true
  }

  // 2. Check against configured ADMIN_EMAILS environment variable
  const adminEmailsEnv = process.env.ADMIN_EMAILS || ""
  const configuredAdmins = adminEmailsEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  // 3. Authorized administrative emails for Trendy Sisters
  const defaultAdminEmails = [
    "admin@trendysisters.com",
    "anushabazaar4@gmail.com",
    "shekharramireddy@gmail.com",
    "ramireddylokeshreddy@gmail.com",
  ]

  const allowedEmails = new Set([...configuredAdmins, ...defaultAdminEmails])

  // Extract all email addresses associated with the Clerk user
  const userEmails: string[] = []
  if (user.emailAddresses && Array.isArray(user.emailAddresses)) {
    user.emailAddresses.forEach((e: any) => {
      if (e.emailAddress) userEmails.push(e.emailAddress.toLowerCase())
    })
  }
  if (user.primaryEmailAddress?.emailAddress) {
    userEmails.push(user.primaryEmailAddress.emailAddress.toLowerCase())
  }
  if (typeof user.email === "string") {
    userEmails.push(user.email.toLowerCase())
  }

  return userEmails.some((e) => allowedEmails.has(e))
}

/**
 * Server-side check for admin routes and server actions.
 */
export async function checkAdminAccess() {
  const { userId } = await auth()
  if (!userId) {
    return { authorized: false, reason: "unauthenticated" as const }
  }

  const user = await currentUser()
  if (!user || !isUserAdmin(user)) {
    return { authorized: false, reason: "forbidden" as const, user }
  }

  return { authorized: true, user }
}
