import { createClient } from "@/lib/supabase/client"

export type StorageBucket = "product-images" | "category-images" | "banner-images"

export interface UploadResult {
  url: string
  path: string
  error?: string | null
}

/**
 * Uploads an image file to the designated Supabase Storage bucket.
 * Generates a clean timestamped filename and returns the public CDN URL.
 * Falls back to Base64 data URL if network fails or RLS blocks.
 */
export async function uploadImageToStorage(
  file: File,
  bucket: StorageBucket = "product-images",
  prefix: string = "upload"
): Promise<UploadResult> {
  const supabase = createClient()

  // Clean filename: remove special chars and append timestamp
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const cleanName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 30)

  const timestamp = Date.now()
  const filePath = `${prefix}-${cleanName}-${timestamp}.${ext}`

  try {
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    })

    if (error) {
      console.warn(`Supabase storage upload error in ${bucket}:`, error)
      // Fallback to Base64 data URL
      const fallbackUrl = await fileToBase64(file)
      return {
        url: fallbackUrl,
        path: filePath,
        error: error.message,
      }
    }

    if (data) {
      const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(data.path)
      return {
        url: pubData.publicUrl,
        path: data.path,
        error: null,
      }
    }
  } catch (err: any) {
    console.warn("Storage upload exception, falling back to base64:", err)
  }

  // Fallback to Base64 data URL so user can always see and save their image
  const fallbackUrl = await fileToBase64(file)
  return {
    url: fallbackUrl,
    path: filePath,
  }
}

/**
 * Helper to convert File to base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}
