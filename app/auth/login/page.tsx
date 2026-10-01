"use client"

import { useState, useEffect, Suspense } from "react"
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
    case "form_code_incorrect":
      return "Invalid verification code. Please check your email and try again."
    case "form_password_length_too_short":
      return "Password must be at least 8 characters long."
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

function isClientUserAdmin(user: any, emailStr?: string): boolean {
  if (!user && !emailStr) return false
  const publicRole = user?.publicMetadata?.role
  const unsafeRole = user?.unsafeMetadata?.role
  if (publicRole === "admin" || unsafeRole === "admin") return true

  const adminEmails = [
    "admin@trendysisters.com",
    "anushabazaar4@gmail.com",
    "shekharramireddy@gmail.com",
    "ramireddylokeshreddy@gmail.com",
  ]
  const cleanEmail = (
    emailStr ||
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    ""
  ).toLowerCase().trim()

  return adminEmails.includes(cleanEmail)
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

  // Forgot password states
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [forgotStep, setForgotStep] = useState<"request" | "reset">("request")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showNewPass, setShowNewPass] = useState(false)
  const [resendingResetCode, setResendingResetCode] = useState(false)
  const [resendResetCooldown, setResendResetCooldown] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect_url") || "/account"

  useEffect(() => {
    if (searchParams.get("mode") === "forgot") {
      setIsForgotPassword(true)
      setForgotStep("request")
    }
  }, [searchParams])

  // Helper to safely check and sync user profile in database via server API
  const syncUserProfile = async (userId: string, userEmail: string) => {
    try {
      console.log(`[AUTH] Profile loaded for user ID: ${userId}`)
      await fetch("/api/profile/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      })
    } catch (syncErr) {
      console.warn("[AUTH] Profile sync notice:", syncErr)
    }
  }

  // Handle Initial Login with Email & Password (DIRECT PASSWORD AUTH - NO OTP)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn || !isLoaded) return
    setLoading(true)
    setError("")
    setSuccessNotice("")

    const cleanEmail = email.trim()
    console.log("[AUTH] Login started")
    console.log("[AUTH] Password authentication started")

    try {
      let result: any = null
      let status: string | undefined = undefined

      try {
        result = await (signIn as any).create({
          identifier: cleanEmail,
          password: password,
        })
      } catch (createErr: any) {
        throw createErr
      }

      if (result && "error" in result && result.error) {
        throw result.error
      }

      status = result?.status || (signIn as any).status
      console.log(`[AUTH] Authentication result: status=${status}`)

      // If status is needs_first_factor, submit password using password factor (NEVER email_code!)
      if (status === "needs_first_factor") {
        const factors = result?.supportedFirstFactors || (signIn as any).supportedFirstFactors || []
        const hasPasswordFactor = factors.some((f: any) => f.strategy === "password")

        if (hasPasswordFactor || !factors.length) {
          if (typeof (signIn as any).password === "function") {
            // Modern Clerk Future API
            const passRes = await (signIn as any).password({ password })
            if (passRes?.error) throw passRes.error
            status = (signIn as any).status || passRes?.status
          } else if (typeof (signIn as any).attemptFirstFactor === "function") {
            // Standard Clerk API
            const factorRes = await (signIn as any).attemptFirstFactor({
              strategy: "password",
              password,
            })
            if (factorRes?.error) throw factorRes.error
            status = factorRes?.status || (signIn as any).status
          } else if (
            clerk &&
            (clerk as any).client?.signIn &&
            typeof ((clerk as any).client.signIn as any).attemptFirstFactor === "function"
          ) {
            // Fallback to clerk.client.signIn
            const factorRes = await ((clerk as any).client.signIn as any).attemptFirstFactor({
              strategy: "password",
              password,
            })
            status = factorRes?.status || ((clerk as any).client.signIn as any).status
          }
          console.log(`[AUTH] Password factor authentication result: status=${status}`)
        } else {
          // The account has no password factor configured / requires email verification before login
          setError("Please verify your email to continue. Please complete account verification or sign up.")
          setLoading(false)
          return
        }
      }

      // Check for completion
      if (status === "complete") {
        const userId =
          result?.createdUserId ||
          (signIn as any)?.createdUserId ||
          (clerk as any)?.client?.signIn?.createdUserId ||
          (clerk.user as any)?.id ||
          "present"

        // Activate session
        const sessionId =
          result?.createdSessionId ||
          (signIn as any)?.createdSessionId ||
          (clerk as any)?.client?.signIn?.createdSessionId

        if (clerk && sessionId) {
          await clerk.setActive({ session: sessionId })
          console.log("[AUTH] Session activated")
        } else if (typeof (signIn as any).finalize === "function") {
          const fin = await (signIn as any).finalize()
          if (fin?.error) throw fin.error
          console.log("[AUTH] Session activated")
        }

        // Load / safely sync profile for this Clerk user ID
        if (userId && userId !== "present") {
          await syncUserProfile(userId, cleanEmail)
          console.log("[AUTH] Profile loaded")
        }

        // Determine destination: Customers go to customer pages (/account, /shop, /), NEVER admin portal unless authorized
        let targetDestination = redirectUrl
        if (targetDestination.startsWith("/admin")) {
          const isAdmin = isClientUserAdmin(clerk.user, cleanEmail)
          if (!isAdmin) {
            targetDestination = "/account"
          }
        }

        console.log(`[AUTH] Redirecting to customer website: ${targetDestination}`)
        router.push(targetDestination)
        router.refresh()
        return
      }

      if (status === "needs_new_password") {
        setError("You need to reset your password before logging in. Please click 'Forgot password?' below.")
        return
      }

      // Fallback: If not completed with password, report incorrect credentials (NO OTP!)
      setError("Incorrect email or password.")
    } catch (err: any) {
      console.warn("[AUTH] Authentication error:", err?.message || err)
      const userMessage = parseAuthError(err)
      setError(userMessage)
    } finally {
      setLoading(false)
    }
  }

  // Handle Sending Password Reset Code
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn || !isLoaded) return
    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setError("Please enter your email address.")
      return
    }

    setLoading(true)
    setError("")
    setSuccessNotice("")

    try {
      let codeSent = false

      // Future API: resetPasswordEmailCode.sendCode
      if ((signIn as any).resetPasswordEmailCode?.sendCode) {
        try {
          const createRes = await (signIn as any).create({
            identifier: cleanEmail,
          })
          if (createRes?.error) {
            if (createRes.error?.code === "form_identifier_not_found") {
              throw createRes.error
            }
          }
          const sendRes = await (signIn as any).resetPasswordEmailCode.sendCode()
          if (sendRes?.error) {
            throw sendRes.error
          }
          codeSent = true
        } catch (futureErr: any) {
          console.warn("Future resetPasswordEmailCode.sendCode attempt notice:", futureErr)
          if (
            futureErr?.code === "form_identifier_not_found" ||
            futureErr?.errors?.[0]?.code === "form_identifier_not_found"
          ) {
            throw futureErr
          }
        }
      }

      // Classic / Legacy API & Fallback
      if (!codeSent) {
        try {
          await (signIn as any).create({
            strategy: "reset_password_email_code",
            identifier: cleanEmail,
          })
          codeSent = true
        } catch (directErr: any) {
          console.warn("Direct reset_password_email_code create failed, trying alternatives:", directErr)

          if (clerk && (clerk as any).client?.signIn) {
            try {
              await (clerk as any).client.signIn.create({
                strategy: "reset_password_email_code",
                identifier: cleanEmail,
              })
              codeSent = true
            } catch (clientErr) {
              console.warn("clerk.client.signIn create notice:", clientErr)
            }
          }

          if (!codeSent) {
            const res: any = await (signIn as any).create({
              identifier: cleanEmail,
            })
            const factor = (res?.supportedFirstFactors || (signIn as any).supportedFirstFactors)?.find(
              (ff: any) => ff.strategy === "reset_password_email_code"
            )
            if (factor && typeof (signIn as any).prepareFirstFactor === "function") {
              await (signIn as any).prepareFirstFactor({
                strategy: "reset_password_email_code",
                emailAddressId: factor.emailAddressId,
              })
              codeSent = true
            } else if ((signIn as any).resetPasswordEmailCode?.sendCode) {
              const sendRes = await (signIn as any).resetPasswordEmailCode.sendCode()
              if (sendRes?.error) throw sendRes.error
              codeSent = true
            } else {
              throw directErr
            }
          }
        }
      }

      setForgotStep("reset")
      setSuccessNotice(`A password reset code was sent to ${cleanEmail}. Please enter it below.`)
    } catch (err: any) {
      console.error("Password reset request error:", err)
      setError(parseAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  // Handle Submitting New Password with Reset Code
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn || !isLoaded) return

    if (!resetCode.trim()) {
      setError("Please enter the 6-digit verification code.")
      return
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    setError("")
    setSuccessNotice("")

    try {
      let result: any = null
      let status: string | undefined = undefined

      // Path A: Modern Clerk Future API (Signals / v7+)
      if ((signIn as any).resetPasswordEmailCode?.verifyCode && (signIn as any).resetPasswordEmailCode?.submitPassword) {
        try {
          const currentStatus = (signIn as any).status
          if (currentStatus !== "needs_new_password") {
            const verifyResult = await (signIn as any).resetPasswordEmailCode.verifyCode({
              code: resetCode.trim(),
            })
            if (verifyResult?.error) {
              throw verifyResult.error
            }
          }

          const submitResult = await (signIn as any).resetPasswordEmailCode.submitPassword({
            password: newPassword,
          })
          if (submitResult?.error) {
            throw submitResult.error
          }
          result = submitResult
          status = (signIn as any)?.status || submitResult?.status || "complete"
        } catch (futureErr: any) {
          // If Future API failed due to internal state mismatch, attempt classic fallback if available
          const errCode = futureErr?.errors?.[0]?.code || futureErr?.code || ""
          if (
            errCode !== "form_code_incorrect" &&
            errCode !== "form_password_length_too_short" &&
            errCode !== "form_password_pwned" &&
            errCode !== "form_password_validation_failed" &&
            clerk &&
            (clerk as any).client?.signIn &&
            typeof ((clerk as any).client.signIn as any).attemptFirstFactor === "function"
          ) {
            console.warn("Future resetPasswordEmailCode fallback to clerk.client.signIn:", futureErr)
            result = await ((clerk as any).client.signIn as any).attemptFirstFactor({
              strategy: "reset_password_email_code",
              code: resetCode.trim(),
              password: newPassword,
            })
            status = result?.status || ((clerk as any).client.signIn as any)?.status
          } else {
            throw futureErr
          }
        }
      } else if (typeof (signIn as any).attemptFirstFactor === "function") {
        // Path B: Standard Clerk API on signIn
        result = await (signIn as any).attemptFirstFactor({
          strategy: "reset_password_email_code",
          code: resetCode.trim(),
          password: newPassword,
        })
        status = result?.status || (signIn as any)?.status
      } else if (clerk && (clerk as any).client?.signIn && typeof ((clerk as any).client.signIn as any).attemptFirstFactor === "function") {
        // Path C: clerk.client.signIn
        result = await ((clerk as any).client.signIn as any).attemptFirstFactor({
          strategy: "reset_password_email_code",
          code: resetCode.trim(),
          password: newPassword,
        })
        status = result?.status || ((clerk as any).client.signIn as any)?.status
      } else if (typeof (signIn as any).resetPassword === "function") {
        // Path D: resetPassword direct method
        result = await (signIn as any).resetPassword({
          password: newPassword,
        })
        status = result?.status || (signIn as any)?.status
      } else {
        throw new Error("Unable to reset password. Please request a new verification code.")
      }

      if (result && "error" in result && result.error) {
        throw result.error
      }

      status = status || result?.status || (signIn as any)?.status

      if (status === "complete") {
        const userId =
          result?.createdUserId ||
          (signIn as any)?.createdUserId ||
          (clerk as any)?.client?.signIn?.createdUserId ||
          (clerk.user as any)?.id ||
          "present"

        if (userId && userId !== "present") {
          await syncUserProfile(userId, email.trim())
        }

        const sessionId =
          result?.createdSessionId ||
          (signIn as any)?.createdSessionId ||
          (clerk as any)?.client?.signIn?.createdSessionId

        if (clerk && sessionId) {
          await clerk.setActive({ session: sessionId })
        } else if (typeof (signIn as any).finalize === "function") {
          await (signIn as any).finalize()
        }

        router.push(redirectUrl)
        router.refresh()
      } else {
        setError("Password reset incomplete. Please check your verification code.")
      }
    } catch (err: any) {
      console.error("Reset password error:", err)
      const code = err?.errors?.[0]?.code || err?.code || ""
      if (code === "form_code_incorrect") {
        setError("Invalid verification code. Please check the code sent to your email.")
      } else if (code === "form_password_length_too_short") {
        setError("Password must be at least 8 characters long.")
      } else if (code === "form_password_pwned") {
        setError("This password has been compromised in an external data breach. Please choose a stronger password.")
      } else {
        setError(parseAuthError(err))
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle Resend Reset Code
  const handleResendResetCode = async () => {
    if (resendingResetCode || resendResetCooldown > 0 || !signIn) return
    setResendingResetCode(true)
    setError("")
    setSuccessNotice("")

    try {
      let resent = false
      if ((signIn as any).resetPasswordEmailCode?.sendCode) {
        try {
          const res = await (signIn as any).resetPasswordEmailCode.sendCode()
          if (res?.error) throw res.error
          resent = true
        } catch (futureErr) {
          console.warn("Future resend reset code notice:", futureErr)
        }
      }

      if (!resent) {
        try {
          await (signIn as any).create({
            strategy: "reset_password_email_code",
            identifier: email.trim(),
          })
          resent = true
        } catch (createErr: any) {
          const factors = (signIn as any).supportedFirstFactors || []
          const factor: any = factors.find((f: any) => f.strategy === "reset_password_email_code")
          if (typeof (signIn as any).prepareFirstFactor === "function") {
            await (signIn as any).prepareFirstFactor({
              strategy: "reset_password_email_code",
              emailAddressId: factor?.emailAddressId,
            })
            resent = true
          } else if (clerk && (clerk as any).client?.signIn) {
            await (clerk as any).client.signIn.create({
              strategy: "reset_password_email_code",
              identifier: email.trim(),
            })
            resent = true
          }
        }
      }

      setSuccessNotice("A new reset code has been sent to your email.")
      setResendResetCooldown(30)
      const timer = setInterval(() => {
        setResendResetCooldown((prev: number) => {
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
      setResendingResetCode(false)
    }
  }

  // Forgot Password Screen - Step 1: Request Code
  if (isForgotPassword && forgotStep === "request") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-16"
        style={{ backgroundColor: "var(--ivory)" }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 shadow-sm"
              style={{
                backgroundColor: "rgba(101,31,53,0.08)",
                borderColor: "var(--gold)",
              }}
            >
              <KeyRound size={28} style={{ color: "var(--burgundy)" }} />
            </div>
            <h1 className="font-serif text-2xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>
              Forgot password?
            </h1>
            <p className="text-sm" style={{ color: "#9B8A7A" }}>
              Enter your email and we&apos;ll send you a 6-digit code to reset your password.
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

            <form onSubmit={handleSendResetCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal)" }}>
                  Registered email address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8A7A" }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--burgundy)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                style={{ backgroundColor: "var(--burgundy)" }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Send Reset Code <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false)
                  setError("")
                  setSuccessNotice("")
                }}
                className="text-xs text-gray-500 hover:text-gray-800 inline-flex items-center gap-1 cursor-pointer font-medium"
              >
                <ArrowLeft size={13} /> Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Forgot Password Screen - Step 2: Enter Code & New Password
  if (isForgotPassword && forgotStep === "reset") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-16"
        style={{ backgroundColor: "var(--ivory)" }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 shadow-sm"
              style={{
                backgroundColor: "rgba(101,31,53,0.08)",
                borderColor: "var(--gold)",
              }}
            >
              <Lock size={28} style={{ color: "var(--burgundy)" }} />
            </div>
            <h1 className="font-serif text-2xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>
              Create new password
            </h1>
            <p className="text-sm" style={{ color: "#9B8A7A" }}>
              Enter the code sent to <strong>{email}</strong> and choose your new password.
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

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal)" }}>
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8A7A" }} />
                  <input
                    type="text"
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    autoFocus
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-center font-mono text-lg tracking-widest outline-none"
                    style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal)" }}>
                  New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8A7A" }} />
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    className="w-full pl-9 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--burgundy)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: "#9B8A7A" }}
                    aria-label="Toggle password visibility"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--charcoal)" }}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9B8A7A" }} />
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    minLength={8}
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--burgundy)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !resetCode.trim() || newPassword.length < 8}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                style={{ backgroundColor: "var(--burgundy)" }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Save New Password & Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleResendResetCode}
                disabled={resendingResetCode || resendResetCooldown > 0}
                className="text-xs font-semibold flex items-center gap-1.5 hover:underline disabled:opacity-50 cursor-pointer"
                style={{ color: "var(--burgundy)" }}
              >
                <RefreshCw size={13} className={resendingResetCode ? "animate-spin" : ""} />
                {resendResetCooldown > 0 ? `Resend code in ${resendResetCooldown}s` : "Resend reset email"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false)
                  setForgotStep("request")
                  setError("")
                  setSuccessNotice("")
                }}
                className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer font-medium"
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold" style={{ color: "var(--charcoal)" }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true)
                    setForgotStep("request")
                    setError("")
                    setSuccessNotice("")
                  }}
                  className="text-xs font-semibold hover:underline cursor-pointer"
                  style={{ color: "var(--burgundy)" }}
                >
                  Forgot password?
                </button>
              </div>
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
