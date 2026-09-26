"use client"

import React, { useState } from "react"
import { AdminSidebar } from "./AdminSidebar"
import { AdminHeader } from "./AdminHeader"
import { AdminToasts } from "./AdminToasts"

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#25201D] flex flex-col md:flex-row antialiased">
      {/* Persistent Collapsible Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <AdminHeader setMobileOpen={setMobileOpen} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Luxury Toast Notification Stack */}
      <AdminToasts />
    </div>
  )
}
