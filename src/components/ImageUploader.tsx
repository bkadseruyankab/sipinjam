'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  category: string
  label?: string
  hint?: string
  accept?: string
  previewClassName?: string
}

export default function ImageUploader({
  value,
  onChange,
  category,
  label = 'Upload Gambar',
  hint = 'Format: JPG, PNG, GIF, WEBP. Maks 5MB',
  accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
  previewClassName = 'h-32 w-32',
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        setImgError(false)
        onChange(data.url)
        if (data.wasCompressed && data.savedPercent > 0) {
          toast.success(`Gambar berhasil diupload & dikompres (hemat ${data.savedPercent}%)`)
        } else {
          toast.success('Gambar berhasil diupload')
        }
      } else {
        toast.error(data.error || 'Gagal mengupload gambar')
      }
    } catch {
      toast.error('Terjadi kesalahan saat upload')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  const handleRemove = () => {
    onChange('')
    setImgError(false)
  }

  const handleUrlChange = (url: string) => {
    setImgError(false)
    onChange(url)
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      
      {value && !imgError ? (
        <div className="relative inline-block">
          <div className={`relative overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50 ${previewClassName}`}>
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : value && imgError ? (
        <div className="space-y-2">
          <div className={`flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 ${previewClassName}`}>
            <div className="text-center p-2">
              <ImageIcon className="size-6 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] text-amber-600">Gambar tidak dapat dimuat</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setImgError(false)}
              className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Coba Lagi
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="text-xs border-red-300 text-red-600 hover:bg-red-50"
            >
              Hapus
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
            dragOver
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/50'
          }`}
        >
          <ImageIcon className="size-8 text-gray-300 mb-2" />
          <p className="text-sm text-muted-foreground mb-2">Drag & drop gambar di sini</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Pilih File
              </>
            )}
          </Button>
        </div>
      )}

      {/* URL input as alternative */}
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Atau masukkan URL gambar"
          value={value || ''}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="text-xs focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
        />
      </div>

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
