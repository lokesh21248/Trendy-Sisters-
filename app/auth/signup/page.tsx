"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, phone: form.phone },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "var(--ivory)" }}
      >
        <div className="text-center max-w-sm">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "rgba(101,31,53,0.1)" }}
          >
            <Mail size={36} style={{ color: "var(--burgundy)" }} />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-3" style={{ color: "var(--charcoal)" }}>
            Check your email
          </h2>
          <p className="text-sm mb-6" style={{ color: "#9B8A7A" }}>
            We&apos;ve sent a confirmation link to <strong>{form.email}</strong>. Please verify your email to continue.
          </p>
          <Link href="/auth/login" className="btn-primary text-sm py-3 px-8 rounded-xl inline-block">
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--ivory)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center">
            <div
              className="w-20 h-20 rounded-full overflow-hidden border-2 mb-3"
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
            Create your account
          </h1>
          <p className="text-sm" style={{ color: "#9B8A7A" }}>Join the Trendy Sisters family</p>
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

          <form onSubmit={handleSignup} className="space-y-4">
            {[
              { key: "fullName", label: "Full Name", icon: User, type: "text", placeholder: "Priya Sharma" },
              { key: "email", label: "Email address", icon: Mail, type: "email", placeholder: "you@example.com" },
              { key: "phone", label: "Phone Number", icon: Phone, type: "tel", placeholder: "+91 98765 43210" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal)" }}>
                  {f.label}
                </label>
                <div className="relative">
                  <f.icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8A7A" }} />
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    required
                    placeholder={f.placeholder}
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                    style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--burgundy)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal)" }}>
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8A7A" }} />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                  placeholder="Min 6 characters"
                  className="w-full pl-9 pr-10 py-3 rounded-xl text-sm outline-none"
                  style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--burgundy)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8A7A" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal)" }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8A7A" }} />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  required
                  placeholder="Confirm password"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--burgundy)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white mt-2 transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ backgroundColor: "var(--burgundy)" }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: "#9B8A7A" }}>
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold" style={{ color: "var(--burgundy)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
