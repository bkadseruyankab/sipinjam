'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { User, Phone, Building2, Loader2, PenLine } from 'lucide-react'

export default function EditProfileDialog() {
  const { user, setUser, editProfileDialogOpen, setEditProfileDialogOpen } = useAppStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [instansi, setInstansi] = useState('')
  const [loading, setLoading] = useState(false)

  // Pre-fill form when dialog opens or user changes
  useEffect(() => {
    if (editProfileDialogOpen && user) {
      setName(user.name || '')
      setPhone(user.phone || '')
      setInstansi(user.instansi || '')
    }
  }, [editProfileDialogOpen, user])

  const handleSave = async () => {
    if (!user) return

    if (!name.trim()) {
      toast.error('Nama tidak boleh kosong')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || undefined,
          instansi: instansi.trim() || undefined,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        // Update the user in the Zustand store
        const updatedUser = {
          ...user,
          name: name.trim(),
          phone: phone.trim() || undefined,
          instansi: instansi.trim() || undefined,
        }
        setUser(updatedUser)
        toast.success('Profil berhasil diperbarui')
        setEditProfileDialogOpen(false)
      } else {
        toast.error(data.error || 'Gagal memperbarui profil')
      }
    } catch {
      toast.error('Terjadi kesalahan saat memperbarui profil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={editProfileDialogOpen} onOpenChange={setEditProfileDialogOpen}>
      <DialogContent className="glass sm:max-w-md border-emerald-200/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-700">
            <PenLine className="size-5" />
            Edit Profil
          </DialogTitle>
          <DialogDescription>
            Perbarui informasi profil Anda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="flex items-center gap-1.5">
              <User className="size-3.5 text-emerald-600" />
              Nama Lengkap *
            </Label>
            <Input
              id="edit-name"
              type="text"
              placeholder="Masukkan nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="edit-phone" className="flex items-center gap-1.5">
              <Phone className="size-3.5 text-emerald-600" />
              No. HP / WhatsApp
            </Label>
            <Input
              id="edit-phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
            />
          </div>

          {/* Instansi */}
          <div className="space-y-2">
            <Label htmlFor="edit-instansi" className="flex items-center gap-1.5">
              <Building2 className="size-3.5 text-emerald-600" />
              Instansi / Organisasi
            </Label>
            <Input
              id="edit-instansi"
              type="text"
              placeholder="Masukkan nama instansi atau organisasi"
              value={instansi}
              onChange={(e) => setInstansi(e.target.value)}
              className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setEditProfileDialogOpen(false)}
              className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !name.trim()}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white btn-modern"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <PenLine className="size-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
