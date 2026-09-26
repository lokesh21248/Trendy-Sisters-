import type { Metadata } from "next"
import { AdminProvider } from "@/contexts/AdminContext"
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell"

export const metadata: Metadata = {
  title: "Admin Portal & Design Quality Audit | Trendy Sisters",
  description:
    "Executive Merchandising Dashboard & Design Field Quality Control Panel for Trendy Sisters Indian Sarees.",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AdminProvider>
  )
}
