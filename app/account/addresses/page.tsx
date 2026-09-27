"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth, useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  MapPin,
  Plus,
  Trash2,
  Check,
  Building,
  Home,
  Briefcase,
  AlertCircle,
  Phone,
  User,
} from "lucide-react"

interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  house_flat: string
  street: string
  city: string
  state: string
  pincode: string
  is_default: boolean
  tag?: string
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
]

export default function AddressesPage() {
  const { userId, isLoaded } = useAuth()
  const { user } = useUser()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form state
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [houseFlat, setHouseFlat] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("Telangana")
  const [pincode, setPincode] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Pre-fill user data when opening form
  useEffect(() => {
    if (user && !fullName) {
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim()
      if (name) setFullName(name)
      if (user.primaryPhoneNumber?.phoneNumber) {
        setPhone(user.primaryPhoneNumber.phoneNumber.replace(/^\+91/, ""))
      }
    }
  }, [user, fullName])

  // Load addresses
  useEffect(() => {
    if (!userId) {
      if (isLoaded) setLoading(false)
      return
    }

    async function loadAddresses() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", userId as string)
          .order("created_at", { ascending: false })

        if (!error && data && data.length > 0) {
          setAddresses(data as Address[])
        } else {
          // Check local storage fallback
          const local = localStorage.getItem(`ts_addresses_${userId}`)
          if (local) {
            try {
              setAddresses(JSON.parse(local))
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error("Failed to load addresses:", err)
      } finally {
        setLoading(false)
      }
    }

    loadAddresses()
  }, [userId, isLoaded])

  function saveLocalBackup(updated: Address[]) {
    if (userId) {
      localStorage.setItem(`ts_addresses_${userId}`, JSON.stringify(updated))
    }
  }

  function resetForm() {
    setFullName(user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "")
    setPhone(user?.primaryPhoneNumber?.phoneNumber?.replace(/^\+91/, "") || "")
    setHouseFlat("")
    setStreet("")
    setCity("")
    setState("Telangana")
    setPincode("")
    setIsDefault(false)
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(addr: Address) {
    setEditingId(addr.id)
    setFullName(addr.full_name)
    setPhone(addr.phone)
    setHouseFlat(addr.house_flat)
    setStreet(addr.street)
    setCity(addr.city)
    setState(addr.state)
    setPincode(addr.pincode)
    setIsDefault(addr.is_default)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    if (!fullName.trim() || !phone.trim() || !houseFlat.trim() || !street.trim() || !city.trim() || !pincode.trim()) {
      setMessage({ type: "error", text: "Please fill in all required address fields." })
      return
    }

    if (phone.replace(/\D/g, "").length < 10) {
      setMessage({ type: "error", text: "Please provide a valid 10-digit mobile number." })
      return
    }

    if (pincode.replace(/\D/g, "").length !== 6) {
      setMessage({ type: "error", text: "Please enter a valid 6-digit PIN code." })
      return
    }

    setSubmitting(true)
    setMessage(null)

    const supabase = createClient()
    const willBeDefault = isDefault || addresses.length === 0

    try {
      if (editingId) {
        // If setting as default, remove default from others
        let updatedList = addresses.map((a) => {
          if (a.id === editingId) {
            return {
              ...a,
              full_name: fullName.trim(),
              phone: phone.trim(),
              house_flat: houseFlat.trim(),
              street: street.trim(),
              city: city.trim(),
              state,
              pincode: pincode.trim(),
              is_default: willBeDefault,
            }
          }
          return willBeDefault ? { ...a, is_default: false } : a
        })

        // Try supabase update
        await (supabase as any)
          .from("addresses")
          .update({
            full_name: fullName.trim(),
            phone: phone.trim(),
            house_flat: houseFlat.trim(),
            street: street.trim(),
            city: city.trim(),
            state,
            pincode: pincode.trim(),
            is_default: willBeDefault,
          })
          .eq("id", editingId)

        if (willBeDefault) {
          await (supabase as any)
            .from("addresses")
            .update({ is_default: false })
            .eq("user_id", userId)
            .neq("id", editingId)
        }

        setAddresses(updatedList)
        saveLocalBackup(updatedList)
        setMessage({ type: "success", text: "Address updated successfully." })
      } else {
        // Add new address
        const newAddress: Address = {
          id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          user_id: userId,
          full_name: fullName.trim(),
          phone: phone.trim(),
          house_flat: houseFlat.trim(),
          street: street.trim(),
          city: city.trim(),
          state,
          pincode: pincode.trim(),
          is_default: willBeDefault,
        }

        // If new address is default, reset others in local state
        let updatedList = willBeDefault
          ? [newAddress, ...addresses.map((a) => ({ ...a, is_default: false }))]
          : [newAddress, ...addresses]

        // Supabase insert
        const { data: inserted, error: insertError } = await (supabase as any)
          .from("addresses")
          .insert({
            user_id: userId,
            full_name: newAddress.full_name,
            phone: newAddress.phone,
            house_flat: newAddress.house_flat,
            street: newAddress.street,
            city: newAddress.city,
            state: newAddress.state,
            pincode: newAddress.pincode,
            is_default: willBeDefault,
          })
          .select()
          .single()

        if (!insertError && inserted) {
          newAddress.id = (inserted as any).id
        }

        if (willBeDefault && !insertError && inserted) {
          await (supabase as any)
            .from("addresses")
            .update({ is_default: false })
            .eq("user_id", userId)
            .neq("id", (inserted as any).id)
        }

        setAddresses(updatedList)
        saveLocalBackup(updatedList)
        setMessage({ type: "success", text: "New delivery address added successfully." })
      }

      resetForm()
    } catch (err) {
      console.error("Error saving address:", err)
      setMessage({ type: "error", text: "Failed to save address. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this address?")) return
    const updated = addresses.filter((a) => a.id !== id)
    setAddresses(updated)
    saveLocalBackup(updated)

    try {
      const supabase = createClient()
      await (supabase as any).from("addresses").delete().eq("id", id)
    } catch (err) {
      console.error("Failed to delete address from DB:", err)
    }
  }

  async function handleSetDefault(id: string) {
    const updated = addresses.map((a) => ({
      ...a,
      is_default: a.id === id,
    }))
    setAddresses(updated)
    saveLocalBackup(updated)

    try {
      const supabase = createClient()
      await (supabase as any).from("addresses").update({ is_default: true }).eq("id", id)
      if (userId) {
        await (supabase as any).from("addresses").update({ is_default: false }).eq("user_id", userId).neq("id", id)
      }
    } catch (err) {
      console.error("Failed to set default address:", err)
    }
  }

  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen pb-20 lg:pb-12">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {/* Navigation & Header */}
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
              <h1 className="font-serif text-2xl lg:text-3xl font-bold text-charcoal">My Addresses</h1>
              <p className="text-xs text-[#9B8A7A]">Manage saved delivery and billing destinations</p>
            </div>
          </div>

          {!showForm && (
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-burgundy hover:bg-burgundy-light transition-all shadow-sm"
            >
              <Plus size={16} />
              Add Address
            </button>
          )}
        </div>

        {/* Feedback message banner */}
        {message && (
          <div
            className={`p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 border ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {message.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Add / Edit Address Form */}
        {showForm && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[var(--border)] shadow-md mb-8 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--border)]">
              <h2 className="font-serif text-xl font-bold text-charcoal flex items-center gap-2">
                <MapPin size={20} className="text-burgundy" />
                {editingId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setShowForm(false)
                }}
                className="text-xs font-semibold text-[#9B8A7A] hover:text-charcoal"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8A7A]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-ivory/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">
                    10-Digit Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8A7A]" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-ivory/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Flat, House No., Building, Apartment <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Sai Residency, Plot 14"
                  value={houseFlat}
                  onChange={(e) => setHouseFlat(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-ivory/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Area, Street, Sector, Landmark <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Road No. 36, Near Jubilee Hills Checkpost"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-ivory/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">
                    City / Town <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-ivory/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-white"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 500033"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-ivory/20"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-burgundy focus:ring-burgundy accent-burgundy"
                />
                <label htmlFor="isDefault" className="text-xs font-medium text-charcoal cursor-pointer">
                  Make this my default delivery address for all future orders
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-burgundy hover:bg-burgundy-light transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingId ? "Update Address" : "Save Address"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setShowForm(false)
                  }}
                  className="px-6 py-3 rounded-xl font-semibold text-sm text-charcoal border border-[var(--border)] hover:bg-ivory transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-[var(--border)]" />
            ))}
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-[var(--border)] shadow-sm">
            <div className="w-20 h-20 bg-ivory-dark rounded-full flex items-center justify-center mx-auto mb-5">
              <MapPin size={32} className="text-burgundy opacity-50" />
            </div>
            <h2 className="font-serif text-xl font-bold text-charcoal mb-2">No addresses saved yet</h2>
            <p className="text-sm text-[#9B8A7A] mb-6 max-w-sm mx-auto">
              Save your home, office, or family delivery addresses for rapid one-click checkout.
            </p>
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-2xl p-5 lg:p-6 border transition-all flex flex-col justify-between ${
                  addr.is_default ? "border-burgundy shadow-sm ring-1 ring-burgundy/20" : "border-[var(--border)] hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-burgundy/5 text-burgundy">
                        {addr.tag === "Office" ? <Briefcase size={16} /> : <Home size={16} />}
                      </span>
                      <h3 className="font-semibold text-charcoal text-base">{addr.full_name}</h3>
                    </div>

                    {addr.is_default && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-burgundy/10 text-burgundy">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-charcoal/90 leading-relaxed mb-1">
                    {addr.house_flat}, {addr.street}
                  </p>
                  <p className="text-sm text-[#9B8A7A] mb-3">
                    {addr.city}, {addr.state} - <span className="font-mono font-medium text-charcoal">{addr.pincode}</span>
                  </p>

                  <div className="flex items-center gap-2 text-xs text-[#9B8A7A] mb-4">
                    <Phone size={13} className="text-burgundy" />
                    <span>+91 {addr.phone}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(addr)}
                      className="text-xs font-semibold text-burgundy hover:underline"
                    >
                      Edit
                    </button>
                    <span className="text-[#D5C4A1]">•</span>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>

                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-semibold text-[#9B8A7A] hover:text-charcoal transition-colors"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
