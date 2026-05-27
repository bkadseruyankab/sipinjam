'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Star, Loader2, Send } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useIdentity } from '@/hooks/useIdentity'
import { toast } from 'sonner'

interface TestimonialFormProps {
  borrowingId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TestimonialForm({ borrowingId, open, onOpenChange }: TestimonialFormProps) {
  const { user } = useAppStore()
  const { identity } = useIdentity()
  const siteName = identity.site_name || 'E-Pakar'
  const [name, setName] = useState(user?.name || '')
  const [instansi, setInstansi] = useState(user?.instansi || '')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const displayRating = hoverRating || rating

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu')
      return
    }
    if (!name.trim()) {
      toast.error('Nama wajib diisi')
      return
    }
    if (!message.trim()) {
      toast.error('Pesan testimoni wajib diisi')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/testimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: name.trim(),
          instansi: instansi.trim() || null,
          rating,
          message: message.trim(),
          borrowingId: borrowingId || null,
          source: 'app',
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Gagal mengirim testimoni')
        return
      }

      toast.success('Testimoni berhasil dikirim! Terima kasih atas masukan Anda.')
      // Reset form
      setMessage('')
      setRating(5)
      setHoverRating(0)
      onOpenChange(false)
    } catch {
      toast.error('Terjadi kesalahan saat mengirim testimoni')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset hover state
      setHoverRating(0)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Star className="size-5 text-amber-400 fill-amber-400" />
            Beri Testimoni
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Bagikan pengalaman Anda menggunakan layanan {siteName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Nama</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
              className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 dark:bg-gray-800 dark:border-gray-600"
            />
          </div>

          {/* Instansi */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Instansi / Organisasi</Label>
            <Input
              value={instansi}
              onChange={(e) => setInstansi(e.target.value)}
              placeholder="Instansi / Organisasi (opsional)"
              className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 dark:bg-gray-800 dark:border-gray-600"
            />
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`Rating ${star} bintang`}
                >
                  <Star
                    className={`size-8 ${
                      star <= displayRating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                    } transition-colors`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {displayRating}/5
              </span>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Pesan Testimoni</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bagikan pengalaman Anda menggunakan layanan {siteName}..."
              rows={4}
              className="min-h-24 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 dark:bg-gray-800 dark:border-gray-600 resize-none"
            />
          </div>

          {/* Info */}
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-300">
            Testimoni Anda akan ditinjau oleh admin sebelum dipublikasikan.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="border-emerald-200 dark:border-gray-600"
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Kirim Testimoni
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
