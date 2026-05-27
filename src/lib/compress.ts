/**
 * Client-side image compression utility using Canvas API.
 * Reduces image file size significantly before storing as base64 or uploading.
 */

interface CompressOptions {
  maxWidth?: number       // Max width in pixels (default: 1200)
  maxHeight?: number      // Max height in pixels (default: 1600)
  quality?: number        // JPEG quality 0-1 (default: 0.7)
  maxSizeKB?: number      // Target max size in KB (default: 300)
  mimeType?: string       // Output MIME type (default: 'image/jpeg')
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxWidth: 1200,
  maxHeight: 1600,
  quality: 0.7,
  maxSizeKB: 300,
  mimeType: 'image/jpeg',
}

/**
 * Compress an image File/Blob using Canvas API.
 * Returns a base64 data URL string.
 */
export async function compressImage(
  file: File | Blob,
  options: CompressOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img
      if (width > opts.maxWidth) {
        height = Math.round((height * opts.maxWidth) / width)
        width = opts.maxWidth
      }
      if (height > opts.maxHeight) {
        width = Math.round((width * opts.maxHeight) / height)
        height = opts.maxHeight
      }

      // Draw on canvas at new size
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // Use high-quality image smoothing
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      // Try progressive quality reduction to hit target size
      let quality = opts.quality
      let dataUrl = canvas.toDataURL(opts.mimeType, quality)

      // If still too large, reduce quality progressively
      const maxBytes = opts.maxSizeKB * 1024
      // Estimate base64 size (base64 is ~33% larger than binary)
      while (dataUrl.length * 0.75 > maxBytes && quality > 0.1) {
        quality -= 0.1
        dataUrl = canvas.toDataURL(opts.mimeType, quality)
      }

      // If still too large after max quality reduction, reduce dimensions
      if (dataUrl.length * 0.75 > maxBytes && (width > 600 || height > 800)) {
        const scale = 0.7
        canvas.width = Math.round(width * scale)
        canvas.height = Math.round(height * scale)
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        dataUrl = canvas.toDataURL(opts.mimeType, 0.6)
      }

      resolve(dataUrl)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Check if a file is an image type that can be compressed
 */
export function isCompressibleImage(file: File | Blob): boolean {
  if (file instanceof File) {
    const type = file.type.toLowerCase()
    return type.startsWith('image/') && 
      !type.includes('svg') && 
      !type.includes('gif') // Don't compress GIFs (would lose animation)
  }
  // For Blob, try to compress anyway
  return true
}

/**
 * Compress a file if it's an image, otherwise return as base64 without compression.
 */
export async function compressFileAsBase64(
  file: File,
  options: CompressOptions = {}
): Promise<{ data: string; wasCompressed: boolean; originalSize: number; compressedSize: number }> {
  const originalSize = file.size

  if (isCompressibleImage(file)) {
    try {
      const compressed = await compressImage(file, options)
      const compressedSize = Math.round(compressed.length * 0.75) // base64 to binary estimate
      return {
        data: compressed,
        wasCompressed: true,
        originalSize,
        compressedSize,
      }
    } catch {
      // Fall back to reading as base64 without compression
    }
  }

  // Non-image or compression failed — read as base64 directly
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const data = reader.result as string
      resolve({
        data,
        wasCompressed: false,
        originalSize,
        compressedSize: Math.round(data.length * 0.75),
      })
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
