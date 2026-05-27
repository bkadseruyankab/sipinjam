'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

/**
 * SearchParamsHandler handles URL query parameters for password reset,
 * forgot password, QR verification, and OAuth error flows.
 *
 * IMPORTANT: This component uses useSearchParams() which triggers Next.js
 * to auto-wrap it in Suspense during SSR. It MUST be wrapped in an explicit
 * <Suspense> boundary in the parent server component to avoid hydration mismatch.
 */

function showOAuthError(error: string) {
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
  } else {
    toast.error('Terjadi kesalahan saat login. Silakan coba lagi.')
  }
}

export default function SearchParamsHandler() {
  const searchParams = useSearchParams()
  const setResetPasswordDialogOpen = useAppStore((s) => s.setResetPasswordDialogOpen)
  const setResetPasswordToken = useAppStore((s) => s.setResetPasswordToken)
  const setForgotPasswordDialogOpen = useAppStore((s) => s.setForgotPasswordDialogOpen)
  const setVerifyDialogOpen = useAppStore((s) => s.setVerifyDialogOpen)
  const setVerifyToken = useAppStore((s) => s.setVerifyToken)
  const oauthErrorShown = useRef(false)

  // Handle reset-password query param
  useEffect(() => {
    const resetToken = searchParams.get('reset-password')
    if (resetToken) {
      const timer = setTimeout(() => {
        setResetPasswordToken(resetToken)
        setResetPasswordDialogOpen(true)
        window.history.replaceState({}, '', '/')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchParams, setResetPasswordToken, setResetPasswordDialogOpen])

  // Handle forgot-password query param (for email link fallback)
  useEffect(() => {
    const forgotParam = searchParams.get('forgot-password')
    if (forgotParam === 'true') {
      const timer = setTimeout(() => {
        setForgotPasswordDialogOpen(true)
        window.history.replaceState({}, '', '/')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchParams, setForgotPasswordDialogOpen])

  // Handle verify query param (for QR code verification)
  useEffect(() => {
    const verifyParam = searchParams.get('verify')
    if (verifyParam) {
      const timer = setTimeout(() => {
        setVerifyToken(verifyParam)
        setVerifyDialogOpen(true)
        window.history.replaceState({}, '', '/')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchParams, setVerifyToken, setVerifyDialogOpen])

  // Handle OAuth error query param
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam && !oauthErrorShown.current) {
      oauthErrorShown.current = true
      showOAuthError(errorParam)
      // Clean up URL after showing error
      const timer = setTimeout(() => {
        window.history.replaceState({}, '', '/')
        oauthErrorShown.current = false
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  return null
}
