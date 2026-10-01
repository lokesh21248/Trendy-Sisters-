"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, KeyRound, Phone } from "lucide-react"
import { useSignUp, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
  const { signUp } = useSignUp()
  const clerk = useClerk()
  const isLoaded = clerk.loaded
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
    if (!signUp || !isLoaded) return
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

      let rawPhone = form.phone.trim().replace(/\s+/g, "")
      if (rawPhone.length > 5) {
        if (!rawPhone.startsWith("+")) {
          if (rawPhone.startsWith("0")) rawPhone = rawPhone.substring(1)
          rawPhone = "+91" + rawPhone
        }
      }

      // Store user information safely in metadata and try with name fields first;
      // if first_name / last_name is disabled in Clerk Dashboard, gracefully retry without top-level names.
      let result: any
      try {
        result = await signUp.create({
          emailAddress: form.email.trim(),
          password: form.password,
          firstName,
          lastName,
          unsafeMetadata: {
            phone: rawPhone || undefined,
            fullName: form.fullName.trim(),
            firstName,
            lastName,
          },
        })
      } catch (createErr: any) {
        console.warn("Primary signup.create failed (first_name/last_name may be disabled in Clerk Dashboard):", createErr)
        try {
          // Retry without top-level firstName and lastName
          result = await signUp.create({
            emailAddress: form.email.trim(),
            password: form.password,
            unsafeMetadata: {
              phone: rawPhone || undefined,
              fullName: form.fullName.trim(),
              firstName,
              lastName,
            },
          })
        } catch (retryErr: any) {
          console.warn("Secondary signup.create failed, falling back to minimal parameters:", retryErr)
          // Ultimate fallback with just email and password
          result = await signUp.create({
            emailAddress: form.email.trim(),
            password: form.password,
          })
        }
      }

      if (result && "error" in result && result.error) throw result.error

      // Send verification code supporting both future API and standard API
      if ((signUp as any).verifications?.sendEmailCode) {
        const sendResult = await (signUp as any).verifications.sendEmailCode()
        if (sendResult?.error) throw sendResult.error
      } else if (typeof (signUp as any).prepareEmailAddressVerification === "function") {
        await (signUp as any).prepareEmailAddressVerification({ strategy: "email_code" })
      }

      setCodeSent(true)
    } catch (err: any) {
      console.error("Clerk Signup Error details:", err)
      const firstErr = Array.isArray(err.errors) && err.errors.length > 0 ? err.errors[0] : null
      const msg =
        firstErr?.longMessage ||
        firstErr?.message ||
        err.longMessage ||
        err.message ||
        "Failed to create account"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUp || !isLoaded) return
    setVerifying(true)
    setError("")

    try {
      let verifyResult: any = null
      if ((signUp as any).verifications?.verifyEmailCode) {
        verifyResult = await (signUp as any).verifications.verifyEmailCode({
          code: verificationCode.trim(),
        })
        if (verifyResult?.error) throw verifyResult.error
      } else if (typeof (signUp as any).attemptEmailAddressVerification === "function") {
        verifyResult = await (signUp as any).attemptEmailAddressVerification({
          code: verificationCode.trim(),
        })
      }

      const status = verifyResult?.status || signUp.status
      if (status === "complete") {
        const sessionId = (verifyResult as any)?.createdSessionId || (signUp as any)?.createdSessionId
        const userId = (verifyResult as any)?.createdUserId || (signUp as any)?.createdUserId

        // Save phone and profile details to Supabase & localStorage so user has their data immediately
        if (userId) {
          try {
            let rawPhone = form.phone.trim().replace(/\s+/g, "")
            if (rawPhone.length > 5 && !rawPhone.startsWith("+")) {
              if (rawPhone.startsWith("0")) rawPhone = rawPhone.substring(1)
              rawPhone = "+91" + rawPhone
            }

            const extendedData = {
              firstName: form.fullName.trim().split(" ")[0] || "",
              lastName: form.fullName.trim().split(" ").slice(1).join(" ") || "",
              phone: rawPhone,
              updatedAt: new Date().toISOString(),
            }
            localStorage.setItem(`ts_profile_${userId}`, JSON.stringify(extendedData))

            const supabase = createClient()
            await (supabase as any).from("profiles").upsert({
              id: userId,
              full_name: form.fullName.trim(),
              phone: rawPhone || null,
              email: form.email.trim(),
              updated_at: new Date().toISOString(),
            })
          } catch (syncErr) {
            console.warn("Profile sync after signup skipped:", syncErr)
          }
        }

        if (clerk && sessionId) {
          await clerk.setActive({ session: sessionId })
        } else if (typeof (signUp as any).finalize === "function") {
          const fin = await (signUp as any).finalize()
          if (fin?.error) throw fin.error
        }
        router.push("/account")
        router.refresh()
      } else {
        setError("Verification incomplete. Please check your code.")
      }
    } catch (err: any) {
      const firstErr = Array.isArray(err.errors) && err.errors.length > 0 ? err.errors[0] : null
      const msg =
        firstErr?.longMessage ||
        firstErr?.message ||
        err.longMessage ||
        err.message ||
        "Invalid verification code"
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
