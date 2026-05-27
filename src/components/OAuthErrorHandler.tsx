'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

interface OAuthErrorHandlerProps {
  error?: string | null
}

/**
 * OAuthErrorHandler displays appropriate toast messages for OAuth errors.
 * Accepts the error string as a prop instead of using useSearchParams()
 * to avoid hydration issues in Next.js App Router.
 */
export default function OAuthErrorHandler({ error }: OAuthErrorHandlerProps) {
  useEffect(() => {
    if (!error) return

    if (error === 'google') {
      toast.error('Login Google gagal. Pastikan Google OAuth sudah dikonfigurasi oleh administrator, atau gunakan login email/password.')
    } else if (error === 'Callback') {
      toast.error('Autentikasi gagal. Silakan coba lagi atau gunakan login email/password.')
    } else if (error === 'OAuthSignin' || error === 'OAuthCallback' || error === 'OAuthCreateAccount') {
      toast.error('Gagal terhubung ke Google. Silakan coba lagi nanti.')
    } else if (error === 'google_oauth_disabled') {
      toast.error('Login Google tidak diaktifkan. Gunakan login email/password.')
    } else if (error === 'google_oauth_not_configured') {
      toast.error('Google OAuth belum dikonfigurasi oleh administrator. Gunakan login email/password.')
    } else if (error === 'google_token_exchange') {
      toast.error('Gagal menukar token Google. Pastikan Client ID dan Client Secret sudah benar.')
    } else if (error === 'google_state_mismatch') {
      toast.error('Verifikasi keamanan gagal. Silakan coba lagi.')
    } else if (error === 'google_no_email') {
      toast.error('Tidak dapat mendapatkan email dari akun Google.')
    } else if (error === 'google_oauth_no_public_url') {
      toast.error('URL Aplikasi belum dikonfigurasi. Admin harus mengisi URL Aplikasi di Pengaturan → Identitas agar Google OAuth dapat digunakan.', { duration: 8000 })
    } else if (error === 'google_no_id_token') {
      toast.error('Gagal mendapatkan ID token dari Google. Silakan coba lagi.')
    } else if (error) {
      toast.error('Terjadi kesalahan saat login. Silakan coba lagi.')
    }
  }, [error])

  return null
}
