"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, ArrowRight, KeyRound, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react"
import { useSignIn, useClerk } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function parseAuthError(err: any): string {
  if (!err) return "Something went wrong. Please try again."

  // Extract Clerk API error code and message
  const firstError = Array.isArray(err.errors) && err.errors.length > 0 ? err.errors[0] : null
  const code = firstError?.code || err.code || ""
  const rawMsg = firstError?.longMessage || firstError?.long_message || firstError?.message || err.longMessage || err.message || ""

  // Separate, specific messages for each case
  switch (code) {
    case "form_identifier_not_found":
      return "No account was found with this email. Please check your email or create an account."
    case "form_password_incorrect":
      return "Incorrect email or password."
    case "form_password_pwned":
    case "form_password_validation_failed":
      return "Incorrect email or password."
    case "user_locked":
    case "account_disabled":
    case "user_banned":
      return "Your account has been disabled. Please contact support."
    case "too_many_requests":
      return "Too many sign-in attempts. Please wait a moment and try again."
    case "session_exists":
      return "You are already signed in. Redirecting to your account..."
    case "network_error":
      return "Network error. Please check your internet connection and try again."
    case "session_creation_failed":
      return "Failed to establish session. Please try again."
    default:
      break
  }

  const lower = rawMsg.toLowerCase()
  if (lower.includes("couldn't find your account") || lower.includes("identifier not found")) {
    return "No account was found with this email."
  }
  if (lower.includes("password is incorrect") || lower.includes("incorrect password")) {
    return "Incorrect email or password."
  }
  if (lower.includes("locked") || lower.includes("banned") || lower.includes("disabled")) {
    return "Your account has been disabled. Please contact support."
  }
  if (lower.includes("too many requests") || lower.includes("rate limit")) {
    return "Too many sign-in attempts. Please wait a moment and try again."
  }
  if (lower.includes("network") || lower.includes("failed to fetch")) {
    return "Something went wrong. Please check your connection and try again."
  }

  if (rawMsg && !rawMsg.includes("internal") && !rawMsg.includes("CLERK_")) {
    return rawMsg
  }

  return "Incorrect email or password."
}

function LoginForm() {
  const { signIn } = useSignIn()
  const clerk = useClerk()
  const isLoaded = clerk.loaded
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successNotice, setSuccessNotice] = useState("")
  
  // Verification states
  const [needsVerification, setNeedsVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [resendingCode, setResendingCode] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect_url") || "/account"

  // Helper to safely check and create user profile in database without blocking login
  const syncUserProfile = async (userId: string, userEmail: string) => {
    try {
      console.log(`[LOGIN ATTEMPT] Profile lookup in progress for user ID: ${userId}`)
      const supabase = createClient()
      const { data: existingProfile, error: profileErr } = await (supabase as any)
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle()

      if (!existingProfile && !profileErr) {
        console.log(`[LOGIN ATTEMPT] Creating missing profile for user ID: ${userId}`)
        await (supabase as any)
          .from("profiles")
          .insert({
            id: userId,
            email: userEmail,
            updated_at: new Date().toISOString(),
          })
      }
      console.log("[LOGIN ATTEMPT] Profile lookup: completed successfully")
    } catch (dbErr) {
      // Never fail authentication due to profile/database errors
      console.warn("[LOGIN ATTEMPT] Database profile check safely bypassed:", dbErr)
    }
  }

  // Handle Initial Login with Email & Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn || !isLoaded) return
    setLoading(true)
    setError("")
    setSuccessNotice("")

    const cleanEmail = email.trim()
    console.log(`[LOGIN ATTEMPT] Email received: ${cleanEmail}`)

    try {
      const result: any = await signIn.create({
        identifier: cleanEmail,
        password,
      })

      // Check for error in future API response object
      if (result && "error" in result && result.error) {
        throw result.error
      }

      const status = result?.status || signIn.status
      console.log(`[LOGIN ATTEMPT] Authentication provider response: status=${status}`)

      if (status === "complete") {
        console.log("[LOGIN ATTEMPT] Verification status: verified")
        const userId = (result as any)?.createdUserId || (signIn as any)?.createdUserId || (clerk.user as any)?.id || "present"
        console.log(`[LOGIN ATTEMPT] User ID: ${userId}`)

        // Safely check/sync user profile
        if (userId && userId !== "present") {
          await syncUserProfile(userId, cleanEmail)
        }

        // Establish session
        const sessionId = result?.createdSessionId || (signIn as any).createdSessionId
        console.log("[LOGIN ATTEMPT] Session creation: starting...")
        if (clerk && sessionId) {
          await clerk.setActive({ session: sessionId })
        } else if (typeof (signIn as any).finalize === "function") {
          const fin = await (signIn as any).finalize()
          if (fin?.error) throw fin.error
        }
        console.log("[LOGIN ATTEMPT] Session creation: success")
        console.log(`[LOGIN ATTEMPT] Redirect: ${redirectUrl}`)

        router.push(redirectUrl)
        router.refresh()
        return
      }

      // Check if user requires email code verification
      if (status === "needs_first_factor") {
        console.log("[LOGIN ATTEMPT] Verification status: unverified (email code required)")
        const factors = result?.supportedFirstFactors || signIn.supportedFirstFactors || []
        const emailFactor = factors.find(
          (f: any) => f.strategy === "email_code"
        )

        if (emailFactor) {
          // Prepare / send the verification code
          try {
            if (typeof (signIn as any).prepareFirstFactor === "function") {
              await (signIn as any).prepareFirstFactor({
                strategy: "email_code",
                emailAddressId: emailFactor.emailAddressId,
              })
            } else if ((signIn as any).emailCode?.sendCode) {
              await (signIn as any).emailCode.sendCode({
                emailAddressId: emailFactor.emailAddressId,
              })
            }
          } catch (prepErr) {
            console.warn("[LOGIN ATTEMPT] Code prepare notice:", prepErr)
          }

          setNeedsVerification(true)
          setSuccessNotice(`A verification code was sent to ${cleanEmail}. Please enter it below.`)
          return
        }

        // If another first factor is required
        setError("Additional authentication required. Please check your verification method.")
        return
      }

      if (status === "needs_second_factor") {
        console.log("[LOGIN ATTEMPT] Verification status: 2FA required")
        setError("Two-factor authentication required. Please verify your second factor.")
        return
      }

      if (status === "needs_new_password") {
        setError("You need to reset your password before logging in.")
        return
      }

      // Fallback for unexpected status
      setError("Authentication could not be completed. Please check your credentials or try again.")
    } catch (err: any) {
      console.error("[LOGIN ATTEMPT] Auth error occurred:", err)
      const userMessage = parseAuthError(err)
      setError(userMessage)
    } finally {
      setLoading(false)
    }
  }

  // Handle Verification Code Submission
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn) return
    setLoading(true)
    setError("")
    setSuccessNotice("")

    try {
      console.log("[LOGIN ATTEMPT] Submitting verification code...")
      let verifyResult: any = null

      if (typeof (signIn as any).attemptFirstFactor === "function") {
        verifyResult = await (signIn as any).attemptFirstFactor({
          strategy: "email_code",
          code: verificationCode.trim(),
        })
      } else if ((signIn as any).emailCode?.verifyCode) {
        verifyResult = await (signIn as any).emailCode.verifyCode({
          code: verificationCode.trim(),
        })
      }

      if (verifyResult && "error" in verifyResult && verifyResult.error) {
        throw verifyResult.error
      }

      const status = verifyResult?.status || signIn.status
      console.log(`[LOGIN ATTEMPT] Verification response status: ${status}`)

      if (status === "complete") {
        console.log("[LOGIN ATTEMPT] Verification status: verified successfully")
        const userId = (verifyResult as any)?.createdUserId || (signIn as any)?.createdUserId || (clerk.user as any)?.id || "present"
        console.log(`[LOGIN ATTEMPT] User ID: ${userId}`)

        if (userId && userId !== "present") {
          await syncUserProfile(userId, email.trim())
        }

        const sessionId = (verifyResult as any)?.createdSessionId || (signIn as any)?.createdSessionId
        console.log("[LOGIN ATTEMPT] Session creation: starting...")
        if (clerk && sessionId) {
          await clerk.setActive({ session: sessionId })
        } else if (typeof (signIn as any).finalize === "function") {
          const fin = await (signIn as any).finalize()
          if (fin?.error) throw fin.error
        }
        console.log("[LOGIN ATTEMPT] Session creation: success")
        console.log(`[LOGIN ATTEMPT] Redirect: ${redirectUrl}`)

        router.push(redirectUrl)
        router.refresh()
      } else {
        setError("Verification incomplete. Please check your code.")
      }
    } catch (err: any) {
      console.error("[LOGIN ATTEMPT] Verification error:", err)
      const code = err?.errors?.[0]?.code || err?.code || ""
      if (code === "form_code_incorrect") {
        setError("Invalid verification code. Please check your code and try again.")
      } else {
        setError(parseAuthError(err))
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle Resend Verification Code
  const handleResendCode = async () => {
    if (resendingCode || resendCooldown > 0 || !signIn) return
    setResendingCode(true)
    setError("")
    setSuccessNotice("")

    try {
      const factors = signIn.supportedFirstFactors || []
      const emailFactor: any = factors.find((f: any) => f.strategy === "email_code")

      if (typeof (signIn as any).prepareFirstFactor === "function") {
        await (signIn as any).prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailFactor?.emailAddressId,
        })
      } else if ((signIn as any).emailCode?.sendCode) {
        await (signIn as any).emailCode.sendCode({
          emailAddressId: emailFactor?.emailAddressId,
        })
      }

      setSuccessNotice("A new verification code has been sent to your email.")
      setResendCooldown(30)
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err: any) {
      setError(parseAuthError(err))
    } finally {
      setResendingCode(false)
    }
  }

  // Verification Screen
  if (needsVerification) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-16"
        style={{ backgroundColor: "var(--ivory)" }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2"
              style={{
                backgroundColor: "rgba(101,31,53,0.08)",
                borderColor: "var(--gold)",
              }}
            >
              <KeyRound size={28} style={{ color: "var(--burgundy)" }} />
            </div>
            <h1 className="font-serif text-2xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>
              Verify your email
            </h1>
            <p className="text-sm" style={{ color: "#9B8A7A" }}>
              Please verify your email before signing in to <strong>{email}</strong>
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

            {successNotice && (
              <div
                className="mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2"
                style={{
                  backgroundColor: "rgba(22,101,52,0.08)",
                  color: "#166534",
                  border: "1px solid rgba(22,101,52,0.2)",
                }}
              >
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{successNotice}</span>
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
                    autoFocus
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-center font-mono text-lg tracking-widest outline-none"
                    style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.trim().length === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                style={{ backgroundColor: "var(--burgundy)" }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Verify & Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendingCode || resendCooldown > 0}
                className="text-xs font-semibold flex items-center gap-1.5 hover:underline disabled:opacity-50 cursor-pointer"
                style={{ color: "var(--burgundy)" }}
              >
                <RefreshCw size={13} className={resendingCode ? "animate-spin" : ""} />
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend verification email"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setNeedsVerification(false)
                  setError("")
                  setSuccessNotice("")
                }}
                className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={13} /> Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Standard Login Screen
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
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: "#9B8A7A" }}>Sign in to your account</p>
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

          {successNotice && (
            <div
              className="mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{
                backgroundColor: "rgba(22,101,52,0.08)",
                color: "#166534",
                border: "1px solid rgba(22,101,52,0.2)",
              }}
            >
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successNotice}</span>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "#9B8A7A" }}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !signIn || !isLoaded}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
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
            <Link href="/auth/signup" className="font-semibold hover:underline" style={{ color: "var(--burgundy)" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
          <div className="w-8 h-8 border-3 border-[#651F35]/30 border-t-[#651F35] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
