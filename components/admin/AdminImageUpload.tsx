"use client"

import React, { useState, useRef } from "react"
import { UploadCloud, Image as ImageIcon, CheckCircle2, AlertCircle, RefreshCw, X, Link as LinkIcon, Sparkles } from "lucide-react"
import { uploadImageToStorage, StorageBucket } from "@/lib/admin/storage"

interface AdminImageUploadProps {
  value: string
  onChange: (url: string) => void
  bucket?: StorageBucket
  label?: string
  aspectRatio?: "3/4" | "16/9" | "square"
  prefix?: string
  placeholderText?: string
  allowUrlToggle?: boolean
}

export function AdminImageUpload({
  value,
  onChange,
  bucket = "product-images",
  label = "Upload Image",
  aspectRatio = "3/4",
  prefix = "img",
  placeholderText = "Drag & drop an authentic saree image, or click to browse",
  allowUrlToggle = true,
}: AdminImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [mode, setMode] = useState<"upload" | "url">("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const aspectClass =
    aspectRatio === "16/9"
      ? "aspect-[16/9]"
      : aspectRatio === "square"
      ? "aspect-square"
      : "aspect-[3/4]"

  const handleFile = async (file: File) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (JPG, PNG, WEBP).")
      return
    }

    // Size limit check (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setUploadError("File size exceeds 15MB limit.")
      return
    }

    try {
      setIsUploading(true)
      setUploadError(null)
      const res = await uploadImageToStorage(file, bucket, prefix)
      onChange(res.url)
    } catch (err: any) {
      setUploadError(err?.message || "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div className="space-y-2">
      {/* Label & Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#25201D] uppercase tracking-wider flex items-center gap-1.5">
          <UploadCloud className="w-3.5 h-3.5 text-[#B88A3B]" />
          <span>{label}</span>
        </label>

        {allowUrlToggle && (
          <button
            type="button"
            onClick={() => setMode(mode === "upload" ? "url" : "upload")}
            className="text-[10px] font-semibold text-[#651F35] hover:text-[#8B2D47] flex items-center gap-1 cursor-pointer transition-colors"
          >
            {mode === "upload" ? (
              <>
                <LinkIcon className="w-3 h-3" />
                <span>Or paste URL</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3 h-3" />
                <span>Switch to File Upload</span>
              </>
            )}
          </button>
        )}
      </div>

      {mode === "upload" ? (
        <div>
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleInputChange}
            className="hidden"
          />

          {value ? (
            /* Uploaded Preview State */
            <div className="relative group rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 bg-[#FAF7F2] p-2 flex items-center gap-3">
              <div
                className={`w-20 ${aspectClass} rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-[#E8DCC8] relative shadow-xs`}
              >
                <img
                  src={value}
                  alt="Uploaded image"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Image Uploaded Successfully</span>
                </div>
                <p className="text-[10px] font-mono text-[#8C8074] truncate mt-0.5">
                  {value}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white border border-[#D8CFBC] text-[#25201D] hover:bg-[#FAF7F2] hover:border-[#D4AF37] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isUploading ? "animate-spin" : ""}`} />
                    <span>Replace File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChange("")}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Dropzone Empty State */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? "border-[#651F35] bg-[#651F35]/10 scale-[1.01]"
                  : "border-[#D4AF37]/50 hover:border-[#651F35] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2]"
              } ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <RefreshCw className="w-7 h-7 text-[#651F35] animate-spin" />
                  <span className="text-xs font-bold text-[#651F35]">
                    Uploading to Supabase Storage ({bucket})...
                  </span>
                  <span className="text-[10px] text-[#8C8074]">
                    Generating high-res CDN delivery URL
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DCC8] shadow-xs flex items-center justify-center text-[#B88A3B] group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#25201D]">
                      {placeholderText}
                    </p>
                    <p className="text-[10px] text-[#8C8074] mt-0.5">
                      Supports JPG, PNG, WEBP (Max 15MB) · Auto-optimized for catalog
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-lg bg-white border border-[#D8CFBC] text-[10px] font-bold text-[#651F35] shadow-2xs hover:bg-[#FAF7F2]">
                    Browse Computer / Device
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Direct URL Input Mode */
        <div className="space-y-1.5">
          <div className="relative">
            <input
              type="url"
              placeholder="https://... (Supabase storage or CDN URL)"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none pr-8"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8074] hover:text-[#25201D]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {value && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8]">
              <div
                className={`w-10 ${aspectClass} rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-[#E8DCC8]`}
              >
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] text-[#6B5E51] font-mono truncate">
                {value}
              </span>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  )
}
