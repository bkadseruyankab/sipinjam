'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { useIdentity } from '@/hooks/useIdentity'
import { toast } from 'sonner'
import { LogIn, Loader2, Info, KeyRound } from 'lucide-react'

export default function LoginDialog() {
  const { loginDialogOpen, setLoginDialogOpen, setRegisterDialogOpen, setUser, setForgotPasswordDialogOpen } = useAppStore()
  const { identity } = useIdentity()
  const siteName = identity.site_name || 'E-Pakar'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleOAuthAvailable, setGoogleOAuthAvailable] = useState(false)
  const [checkingOAuth, setCheckingOAuth] = useState(true)

  // Check Google OAuth availability on mount
  useEffect(() => {
    const checkOAuth = async () => {
      try {
        const res = await fetch('/api/auth/oauth-status')
        if (res.ok) {
          const data = await res.json()
          setGoogleOAuthAvailable(data.configured === true)
        } else {
          setGoogleOAuthAvailable(false)
        }
      } catch {
        setGoogleOAuthAvailable(false)
      } finally {
        setCheckingOAuth(false)
      }
    }
    checkOAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Harap isi email dan password')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Login gagal')
        return
      }
      setUser(data.user)
      setLoginDialogOpen(false)
      setEmail('')
      setPassword('')
      toast.success(`Selamat datang, ${data.user.name}!`)
    } catch {
      toast.error('Terjadi kesalahan saat login')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      // Use our custom dynamic Google OAuth initiation endpoint
      // This reads credentials from DB settings, bypassing NextAuth's static provider
      window.location.href = '/api/auth/google-signin'
    } catch {
      toast.error('Terjadi kesalahan saat masuk dengan Google')
      setGoogleLoading(false)
    }
  }

  const switchToRegister = () => {
    setLoginDialogOpen(false)
    setRegisterDialogOpen(true)
  }

  const switchToForgotPassword = () => {
    setLoginDialogOpen(false)
    setForgotPasswordDialogOpen(true)
  }

  return (
    <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-700">
            <LogIn className="size-5" />
            Masuk ke {siteName}
          </DialogTitle>
          <DialogDescription>
            Masuk untuk mengajukan peminjaman aula dan kendaraan
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={switchToForgotPassword}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-4 flex items-center gap-1"
              >
                <KeyRound className="size-3" />
                Lupa Password?
              </button>
            </div>
          </div>

          {/* Demo credentials hint */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-start gap-2">
              <Info className="size-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-700 space-y-1">
                <p className="font-medium">Akun Demo:</p>
                <p>Admin: <code className="bg-blue-100 px-1 rounded">admin@epakar.id</code> / <code className="bg-blue-100 px-1 rounded">admin123</code></p>
                <p>User: <code className="bg-blue-100 px-1 rounded">user@demo.id</code> / <code className="bg-blue-100 px-1 rounded">user123</code></p>
              </div>
            </div>
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
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  Masuk
                </>
              )}
            </Button>

            {/* Google Sign-in Button — only shown if OAuth is configured */}
            {googleOAuthAvailable && (
              <>
                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                  </div>
                  <span className="relative bg-white px-3 text-xs text-muted-foreground">atau</span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={googleLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Menghubungkan...
                    </>
                  ) : (
                    <>
                      <svg className="size-4 mr-2" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Masuk dengan Google
                    </>
                  )}
                </Button>
              </>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={switchToRegister}
                className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-4"
              >
                Daftar di sini
              </button>
            </p>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
