"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Camera,
  CheckCircle2,
  AlertCircle,
  Shield,
  Sparkles,
  MapPin,
  Package,
} from "lucide-react"

export default function ProfilePage() {
  const { user, isLoaded } = useUser()

  // Form State
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [gender, setGender] = useState("female")
  const [dob, setDob] = useState("")
  const [altPhone, setAltPhone] = useState("")

  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Populate form from Clerk user & local storage / Supabase
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "")
      setLastName(user.lastName || "")

      // Phone from Clerk
      const userPhone = user.primaryPhoneNumber?.phoneNumber || ""
      if (userPhone) {
        setPhone(userPhone.replace(/^\+91/, ""))
      }

      // Load additional profile fields (gender, dob, altPhone) from Supabase or localStorage
      async function loadExtraProfile() {
        try {
          const localData = localStorage.getItem(`ts_profile_${user?.id}`)
          if (localData) {
            const parsed = JSON.parse(localData)
            if (parsed.gender) setGender(parsed.gender)
            if (parsed.dob) setDob(parsed.dob)
            if (parsed.altPhone) setAltPhone(parsed.altPhone)
            if (parsed.phone && !userPhone) setPhone(parsed.phone)
          }

          // Also check Supabase profiles
          const supabase = createClient()
          const { data } = await (supabase as any)
            .from("profiles")
            .select("*")
            .eq("id", user?.id)
            .maybeSingle()

          if (data) {
            if (data.phone && !userPhone) setPhone(data.phone)
          }
        } catch (err) {
          console.error("Error loading extended profile:", err)
        }
      }

      loadExtraProfile()
    }
  }, [user])

  // Handle avatar upload
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please upload an image file (JPEG, PNG, WebP)." })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 5MB." })
      return
    }

    setAvatarUploading(true)
    setMessage(null)

    try {
      await user.setProfileImage({ file })
      setMessage({ type: "success", text: "Profile picture updated successfully!" })
    } catch (err: any) {
      console.error("Error uploading avatar:", err)
      setMessage({
        type: "error",
        text: err?.errors?.[0]?.message || "Failed to update profile image. Please try again.",
      })
    } finally {
      setAvatarUploading(false)
    }
  }

  // Handle saving profile information
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    if (!firstName.trim()) {
      setMessage({ type: "error", text: "First name is required." })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      // 1. Update Clerk user profile
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })

      // 2. Save extended profile details (phone, gender, dob, altPhone) locally & to Supabase
      const extendedData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        gender,
        dob,
        altPhone: altPhone.trim(),
        updatedAt: new Date().toISOString(),
      }

      localStorage.setItem(`ts_profile_${user.id}`, JSON.stringify(extendedData))

      // Sync with Supabase profiles table
      try {
        const supabase = createClient()
        await (supabase as any).from("profiles").upsert({
          id: user.id,
          full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          phone: phone.trim() ? `+91${phone.trim().replace(/^\+91/, "")}` : null,
          email: user.primaryEmailAddress?.emailAddress || null,
          avatar_url: user.imageUrl,
          updated_at: new Date().toISOString(),
        })
      } catch (dbErr) {
        console.warn("Supabase profile sync skipped:", dbErr)
      }

      setMessage({ type: "success", text: "Your profile information has been saved successfully!" })
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setMessage({
        type: "error",
        text: err?.errors?.[0]?.message || "Failed to save profile changes. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded) {
    return (
      <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-burgundy border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const email = user?.primaryEmailAddress?.emailAddress || ""
  const displayName = `${firstName} ${lastName}`.trim() || user?.firstName || "Shopper"

  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen pb-20 lg:pb-12">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/account"
              className="p-2 -ml-2 rounded-full hover:bg-ivory-dark transition-colors"
              aria-label="Back to account"
            >
              <ArrowLeft size={20} className="text-charcoal" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl lg:text-3xl font-bold text-charcoal">Profile Information</h1>
              <p className="text-xs text-[#9B8A7A]">View and update your personal details and account settings</p>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 border ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Avatar & Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[var(--border)] shadow-sm text-center">
              {/* Avatar with Upload button */}
              <div className="relative w-28 h-28 mx-auto mb-4">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-burgundy flex items-center justify-center text-white text-3xl font-serif font-bold relative">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={displayName}
                      fill
                      className="object-cover"
                      sizes="112px"
                      unoptimized
                    />
                  ) : (
                    displayName[0]?.toUpperCase() || "U"
                  )}
                </div>

                {/* Upload Trigger */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute bottom-0 right-0 p-2.5 rounded-full bg-burgundy hover:bg-burgundy-light text-white shadow-md transition-transform hover:scale-105"
                  title="Upload profile photo"
                >
                  <Camera size={16} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
              </div>

              {avatarUploading && (
                <p className="text-xs text-burgundy font-medium mb-2 animate-pulse">Uploading new photo...</p>
              )}

              <h2 className="font-serif text-lg font-bold text-charcoal">{displayName}</h2>
              <p className="text-xs text-[#9B8A7A] truncate mt-0.5">{email}</p>

              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-medium">
                <Shield size={14} />
                <span>Verified Trendy Sisters Member</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-3xl p-5 border border-[var(--border)] shadow-sm space-y-2">
              <p className="text-xs font-semibold text-[#9B8A7A] uppercase tracking-wider mb-2">Quick Shortcuts</p>
              <Link
                href="/account/orders"
                className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-charcoal hover:bg-ivory hover:text-burgundy transition-colors"
              >
                <Package size={16} className="text-burgundy" />
                <span>My Orders & Tracking</span>
              </Link>
              <Link
                href="/account/addresses"
                className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-charcoal hover:bg-ivory hover:text-burgundy transition-colors"
              >
                <MapPin size={16} className="text-burgundy" />
                <span>Saved Delivery Addresses</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Editable Profile Information Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--border)]">
                <div>
                  <h2 className="font-serif text-xl font-bold text-charcoal">Personal Details</h2>
                  <p className="text-xs text-[#9B8A7A]">Update your profile name and contact information</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-ivory text-burgundy border border-[var(--border)]">
                  Account Info
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* First and Last Name */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8A7A]" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Shekhar"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-ivory/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Rami Reddy"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-ivory/20"
                    />
                  </div>
                </div>

                {/* Email (Readonly) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-charcoal">Email Address</label>
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  </div>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8A7A]" />
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[#9B8A7A] bg-ivory-dark/40 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-[#9B8A7A] mt-1">
                    Your primary login email address managed securely.
                  </p>
                </div>

                {/* Phone & Alternate Phone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">
                      Primary Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-semibold text-[#9B8A7A] border-r border-[var(--border)] pr-2">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="9876543210"
                        className="w-full pl-16 pr-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-ivory/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">
                      WhatsApp / Alternate Number
                    </label>
                    <div className="relative flex items-center">
                      <Phone size={16} className="absolute left-3.5 text-[#9B8A7A]" />
                      <input
                        type="tel"
                        maxLength={10}
                        value={altPhone}
                        onChange={(e) => setAltPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="Optional alternate mobile"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-ivory/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Gender & Date of Birth */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-white text-charcoal"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Non-binary / Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8A7A]" />
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-ivory/20"
                      />
                    </div>
                    <p className="text-[10px] text-[#9B8A7A] mt-1">Receive surprise anniversary & birthday rewards!</p>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#9B8A7A]">
                    <Sparkles size={14} className="text-gold" />
                    <span>Your privacy is 100% protected</span>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-burgundy hover:bg-burgundy-light transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? "Saving Changes..." : "Save Information"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
