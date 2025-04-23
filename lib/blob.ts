import { put } from "@vercel/blob"

export async function uploadToBlob(file: File, filename: string) {
  try {
    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return {
      url: blob.url,
      success: true,
    }
  } catch (error) {
    console.error("Error uploading to Blob:", error)
    return {
      url: "",
      success: false,
      error,
    }
  }
}
