import type { Metadata } from "next"
import { AdminProvider } from "@/contexts/AdminContext"
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell"
import { checkAdminAccess } from "@/lib/admin/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ShieldAlert, ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Admin Portal & Design Quality Audit | Trendy Sisters",
  description:
    "Executive Merchandising Dashboard & Design Field Quality Control Panel for Trendy Sisters Indian Sarees.",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side Admin Authorization Verification
  const { authorized, reason } = await checkAdminAccess()

  if (!authorized) {
    if (reason === "unauthenticated") {
      redirect("/auth/login?redirect_url=/admin")
    }

    // Customer / non-admin user attempting to access /admin
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--ivory)" }}
      >
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[var(--border)] shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
            <ShieldAlert size={32} />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 mb-3">
            Access Restricted
          </span>
          <h1 className="font-serif text-2xl font-bold text-charcoal mb-2">
            Administrator Access Required
          </h1>
          <p className="text-sm text-[#9B8A7A] mb-6 leading-relaxed">
            Your account does not have administrative privileges to view or manage the Trendy Sisters Admin Portal.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white bg-burgundy hover:bg-burgundy-dark transition-all shadow-md"
            >
              <ArrowLeft size={16} /> Return to Store
            </Link>
            <Link
              href="/account"
              className="w-full block py-3 rounded-xl font-semibold text-xs text-charcoal border border-[var(--border)] hover:bg-ivory transition-colors text-center"
            >
              Go to My Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AdminProvider>
  )
}
