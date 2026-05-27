'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { KeyRound, Loader2, CheckCircle2, XCircle, Eye, EyeOff, LogIn } from 'lucide-react'

export default function ResetPasswordDialog() {
  const { resetPasswordDialogOpen, setResetPasswordDialogOpen, resetPasswordToken, setResetPasswordToken, setLoginDialogOpen } = useAppStore()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenError, setTokenError] = useState('')
  const [userInfo, setUserInfo] = useState<{ email: string; name: string } | null>(null)
  const [success, setSuccess] = useState(false)

  // Validate the token when dialog opens
  useEffect(() => {
    if (resetPasswordDialogOpen && resetPasswordToken) {
      validateToken(resetPasswordToken)
    } else if (resetPasswordDialogOpen && !resetPasswordToken) {
      setTokenValid(false)
      setTokenError('Token tidak ditemukan')
      setValidating(false)
    }
  }, [resetPasswordDialogOpen, resetPasswordToken])

  const validateToken = async (token: string) => {
    setValidating(true)
    try {
      const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      const data = await res.json()
      if (data.valid) {
        setTokenValid(true)
        setUserInfo({ email: data.email, name: data.name })
      } else {
        setTokenValid(false)
        setTokenError(data.error || 'Token tidak valid')
      }
    } catch {
      setTokenValid(false)
      setTokenError('Gagal memvalidasi token')
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) {
      toast.error('Harap isi semua field')
      return
    }
    if (password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Password dan konfirmasi tidak sama')
      return
    }
    if (!resetPasswordToken) {
      toast.error('Token tidak ditemukan')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetPasswordToken,
          password,
          confirmPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Gagal mereset password')
        return
      }
      setSuccess(true)
      toast.success('Password berhasil direset!')
    } catch {
      toast.error('Terjadi kesalahan saat mereset password')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = (open: boolean) => {
    setResetPasswordDialogOpen(open)
    if (!open) {
      // Reset state after dialog closes
      setTimeout(() => {
        setPassword('')
        setConfirmPassword('')
        setShowPassword(false)
        setShowConfirm(false)
        setSuccess(false)
        setTokenValid(false)
        setTokenError('')
        setUserInfo(null)
        setValidating(true)
        setResetPasswordToken(null)
      }, 200)
    }
  }

  const goToLogin = () => {
    setResetPasswordDialogOpen(false)
    setLoginDialogOpen(true)
  }

  return (
    <Dialog open={resetPasswordDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-700">
            <KeyRound className="size-5" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Buat password baru untuk akun Anda
          </DialogDescription>
        </DialogHeader>

        {/* Validating token state */}
        {validating && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="size-8 animate-spin text-emerald-600" />
            <p className="text-sm text-muted-foreground">Memvalidasi token...</p>
          </div>
        )}

        {/* Invalid token state */}
        {!validating && !tokenValid && !success && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="size-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">Link Tidak Valid</p>
                <p className="text-sm text-muted-foreground">{tokenError}</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={goToLogin}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <LogIn className="size-4 mr-2" />
                Kembali ke Login
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Success state */}
        {success && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="size-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">Password Berhasil Direset!</p>
                <p className="text-sm text-muted-foreground">
                  Password Anda telah berhasil diubah. Silakan login dengan password baru Anda.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={goToLogin}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <LogIn className="size-4 mr-2" />
                Login Sekarang
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Reset form */}
        {!validating && tokenValid && !success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {userInfo && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-sm text-emerald-700">
                  Mengatur ulang password untuk: <strong>{userInfo.email}</strong>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-password">Password Baru</Label>
              <div className="relative">
                <Input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pr-10 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-confirm">Konfirmasi Password Baru</Label>
              <div className="relative">
                <Input
                  id="reset-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pr-10 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500">Password tidak sama</p>
              )}
            </div>

            <DialogFooter className="flex-col gap-3 sm:flex-col">
              <Button
                type="submit"
                disabled={loading || (confirmPassword.length > 0 && password !== confirmPassword)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <KeyRound className="size-4" />
                    Reset Password
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
