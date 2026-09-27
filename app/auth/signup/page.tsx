"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, KeyRound, Phone } from "lucide-react"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const { signUp } = useSignUp()
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [verificationCode, setVerificationCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUp) return
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const parts = form.fullName.trim().split(" ")
      const firstName = parts[0] || "User"
      const lastName = parts.slice(1).join(" ") || undefined

      const result = await signUp.create({
        emailAddress: form.email.trim(),
        phoneNumber: form.phone.trim(),
        password: form.password,
        firstName,
        lastName,
      })
      if (result.error) throw result.error;

      // Send verification code
      const sendResult = await signUp.verifications.sendEmailCode()
      if (sendResult.error) throw sendResult.error;
      setCodeSent(true)
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Failed to create account"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUp) return
    setVerifying(true)
    setError("")

    try {
      const verifyResult = await signUp.verifications.verifyEmailCode({
        code: verificationCode.trim(),
      })
      if (verifyResult.error) throw verifyResult.error;

      if (signUp.status === "complete") {
        await signUp.finalize()
        router.push("/account")
        router.refresh()
      } else {
        setError("Verification incomplete. Please check your code.")
      }
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid verification code"
      setError(msg)
    } finally {
      setVerifying(false)
    }
  }

  if (codeSent) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-16"
        style={{ backgroundColor: "var(--ivory)" }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "rgba(101,31,53,0.1)" }}
            >
              <Mail size={32} style={{ color: "var(--burgundy)" }} />
            </div>
            <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: "var(--charcoal)" }}>
              Check your email
            </h2>
            <p className="text-sm" style={{ color: "#9B8A7A" }}>
              We sent a 6-digit verification code to <strong>{form.email}</strong>
            </p>
          </div>

          <div
            className="p-8 rounded-3xl bg-white"
            style={{ border: "1px solid var(--border)", boxShadow: "0 4px 24px var(--shadow)" }}
          >
            {error && (
              <div
                className="mb-4 p-3 rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: "rgba(220,38,38,0.08)",
                  color: "#DC2626",
                  border: "1px solid rgba(220,38,38,0.2)",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal)" }}>
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8A7A" }} />
                  <input
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-center font-mono text-lg tracking-widest outline-none"
                    style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                style={{ backgroundColor: "var(--burgundy)" }}
              >
                {verifying ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Verify & Continue <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </div>
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
              className="w-20 h-20 rounded-full overflow-hidden border-2 mb-3 flex items-center justify-center bg-white shadow-sm"
              style={{ borderColor: "var(--gold)" }}
            >
              <Image
                src="/logo.png"
                alt="Trendy Sisters"
                width={80}
                height={80}
                className="object-contain"
                onError={(e) => {
                  const t = e.target as HTMLImageElement
                  t.style.display = "none"
                }}
              />
            </div>
            <span className="font-serif text-2xl font-bold" style={{ color: "var(--burgundy)" }}>
              Trendy Sisters
            </span>
            <span className="text-xs mt-0.5 tracking-wider font-medium" style={{ color: "var(--gold)" }}>
              Three Sisters, One Dream
            </span>
          </Link>
          <h1 className="font-serif text-xl font-semibold mt-4 mb-1" style={{ color: "var(--charcoal)" }}>
            Create your account
          </h1>
          <p className="text-sm" style={{ color: "#9B8A7A" }}>Join the Trendy Sisters family</p>
        </div>

        <div
          className="p-8 rounded-3xl bg-white"
          style={{ border: "1px solid var(--border)", boxShadow: "0 4px 24px var(--shadow)" }}
        >
          {error && (
            <div
              className="mb-4 p-3 rounded-xl text-sm font-medium"
              style={{
                backgroundColor: "rgba(220,38,38,0.08)",
                color: "#DC2626",
                border: "1px solid rgba(220,38,38,0.2)",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal)" }}>
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8A7A" }} />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  required
                  placeholder="Priya Sharma"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--burgundy)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal)" }}>
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8A7A" }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
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
                Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8A7A" }} />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  required
                  placeholder="+91"
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
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                  placeholder="Min 8 characters"
                  className="w-full pl-9 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--burgundy)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "#9B8A7A" }}
                  aria-label="Toggle password visibility"
                >
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
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--burgundy)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !signUp}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white mt-2 transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              style={{ backgroundColor: "var(--burgundy)" }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
            <div id="clerk-captcha"></div>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: "#9B8A7A" }}>
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: "var(--burgundy)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
