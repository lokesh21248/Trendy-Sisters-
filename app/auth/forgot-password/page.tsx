"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ForgotPasswordRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/auth/login?mode=forgot")
  }, [router])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--ivory)" }}
    >
      <div className="w-8 h-8 border-3 border-burgundy/30 border-t-burgundy rounded-full animate-spin" />
    </div>
  )
}
