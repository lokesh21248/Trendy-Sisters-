"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/account")
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--ivory)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center">
            <div
              className="w-20 h-20 rounded-full overflow-hidden border-2 mb-3 flex items-center justify-center"
              style={{ borderColor: "var(--gold)", backgroundColor: "white" }}
            >
              <Image src="/logo.png" alt="Trendy Sisters" width={80} height={80} className="object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
            </div>
            <span className="font-serif text-2xl font-bold" style={{ color: "var(--burgundy)" }}>
              Trendy Sisters
            </span>
          </Link>
          <h1 className="font-serif text-xl font-semibold mt-4 mb-1" style={{ color: "var(--charcoal)" }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: "#9B8A7A" }}>Sign in to your account</p>
        </div>

        <div
          className="p-8 rounded-3xl"
          style={{ backgroundColor: "white", border: "1px solid var(--border)", boxShadow: "0 4px 24px var(--shadow)" }}
        >
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(220,38,38,0.06)", color: "#DC2626" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal)" }}>
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8A7A" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--burgundy)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal)" }}>
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8A7A" }} />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Your password"
                  className="w-full pl-9 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--burgundy)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9B8A7A" }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link href="/auth/forgot-password" className="text-xs" style={{ color: "var(--burgundy)" }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ backgroundColor: "var(--burgundy)" }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: "#9B8A7A" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-semibold" style={{ color: "var(--burgundy)" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
