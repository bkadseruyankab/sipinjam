'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { Loader2, PenLine, Upload } from 'lucide-react'
import ImageUploader from '@/components/ImageUploader'

export default function UserProfileDialog() {
  const { user, setUser, profileDialogOpen, setProfileDialogOpen } = useAppStore()
  const [fotoTtd, setFotoTtd] = useState('')
  const [saving, setSaving] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (profileDialogOpen && user) {
      setFotoTtd(user.fotoTtd || '')
    }
  }, [profileDialogOpen, user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, fotoTtd }),
      })
      if (res.ok) {
        toast.success('Foto tanda tangan berhasil disimpan')
        // Update the stored user info
        setUser({ ...user, fotoTtd })
        setProfileDialogOpen(false)
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Gagal menyimpan foto tanda tangan')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-700">
            <PenLine className="size-5 text-emerald-600" />
            Profil & Tanda Tangan
          </DialogTitle>
          <DialogDescription>
            Upload foto tanda tangan Anda untuk dokumen perjanjian dan kwitansi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800">
              <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                {user.instansi && <p className="text-xs text-muted-foreground">{user.instansi}</p>}
              </div>
            </div>
          )}

          {/* TTD Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <PenLine className="size-3.5 text-emerald-600" />
              Foto Tanda Tangan (TTD)
            </label>
            <p className="text-xs text-muted-foreground">
              Upload foto tanda tangan Anda yang akan digunakan pada dokumen resmi perjanjian dan kwitansi
            </p>
            <ImageUploader
              value={fotoTtd}
              onChange={setFotoTtd}
              category="ttd"
              label="Pilih Foto TTD"
              hint="Format: JPG, PNG. Maksimal 2MB. Disarankan latar belakang putih"
              previewClassName="h-24 w-48"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setProfileDialogOpen(false)} disabled={saving}>
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Simpan TTD
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
