'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { KeyRound, Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordDialog() {
  const { forgotPasswordDialogOpen, setForgotPasswordDialogOpen, setLoginDialogOpen } = useAppStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Harap isi email')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Gagal mengirim email reset')
        return
      }
      setSent(true)
      toast.success('Link reset password telah dikirim ke email Anda')
    } catch {
      toast.error('Terjadi kesalahan saat mengirim email')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = (open: boolean) => {
    setForgotPasswordDialogOpen(open)
    if (!open) {
      // Reset state after dialog closes
      setTimeout(() => {
        setEmail('')
        setSent(false)
      }, 200)
    }
  }

  const switchToLogin = () => {
    setForgotPasswordDialogOpen(false)
    setLoginDialogOpen(true)
  }

  return (
    <Dialog open={forgotPasswordDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-700">
            <KeyRound className="size-5" />
            Lupa Password
          </DialogTitle>
          <DialogDescription>
            {sent
              ? 'Cek email Anda untuk link reset password'
              : 'Masukkan email Anda untuk menerima link reset password'
            }
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="size-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">Email Terkirim!</p>
                <p className="text-sm text-muted-foreground">
                  Kami telah mengirim link reset password ke <strong>{email}</strong>.
                  Silakan cek inbox dan folder spam Anda.
                </p>
                <p className="text-xs text-muted-foreground">
                  Link berlaku selama 1 jam.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-700">
                💡 Jika email tidak ditemukan, cek folder spam atau tunggu beberapa menit.
              </p>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button
                type="button"
                onClick={() => {
                  setSent(false)
                  setEmail('')
                }}
                variant="outline"
                className="w-full"
              >
                <Mail className="size-4 mr-2" />
                Kirim Ulang ke Email Lain
              </Button>
              <Button
                type="button"
                onClick={switchToLogin}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <ArrowLeft className="size-4 mr-2" />
                Kembali ke Login
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
              />
              <p className="text-xs text-muted-foreground">
                Masukkan email yang terdaftar pada akun Anda. Kami akan mengirim link untuk mereset password.
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs text-blue-700">
                🔒 Link reset password hanya berlaku selama 1 jam. Jika Anda tidak meminta reset, abaikan email yang diterima.
              </p>
            </div>

            <DialogFooter className="flex-col gap-3 sm:flex-col">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Mail className="size-4" />
                    Kirim Link Reset Password
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={switchToLogin}
                className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <ArrowLeft className="size-3" />
                Kembali ke Login
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
