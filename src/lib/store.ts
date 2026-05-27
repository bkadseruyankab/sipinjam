import { create } from 'zustand'

export type ViewType = 
  | 'home' 
  | 'pinjam-aula' 
  | 'pinjam-kendaraan' 
  | 'kalender-aula' 
  | 'kalender-kendaraan'
  | 'pengajuan-saya' 
  | 'riwayat-aula'
  | 'riwayat-kendaraan'
  | 'daftar-kendaraan'
  | 'status-peminjaman'
  | 'admin-dashboard'
  | 'admin-peminjaman'
  | 'perjanjian'
  | 'admin-settings'
  | 'admin-notifications'
  | 'admin-reports'
  | 'admin-testimonials'
  | 'admin-users'
  | 'admin-kendaraan'
  | 'admin-aula'

interface UserInfo {
  id: string
  email: string
  name: string
  role: string
  phone?: string
  instansi?: string
  fotoTtd?: string
}

interface AppState {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  user: UserInfo | null
  setUser: (user: UserInfo | null) => void
  loginDialogOpen: boolean
  setLoginDialogOpen: (open: boolean) => void
  registerDialogOpen: boolean
  setRegisterDialogOpen: (open: boolean) => void
  profileDialogOpen: boolean
  setProfileDialogOpen: (open: boolean) => void
  forgotPasswordDialogOpen: boolean
  setForgotPasswordDialogOpen: (open: boolean) => void
  resetPasswordDialogOpen: boolean
  setResetPasswordDialogOpen: (open: boolean) => void
  resetPasswordToken: string | null
  setResetPasswordToken: (token: string | null) => void
  selectedAgreementId: string | null
  setSelectedAgreementId: (id: string | null) => void
  paymentDialogOpen: boolean
  setPaymentDialogOpen: (open: boolean) => void
  paymentBorrowingId: string
  setPaymentBorrowingId: (id: string) => void
  verifyDialogOpen: boolean
  setVerifyDialogOpen: (open: boolean) => void
  verifyToken: string
  setVerifyToken: (token: string) => void
  sessionChecked: boolean
  setSessionChecked: (checked: boolean) => void
  templateManagerOpen: boolean
  setTemplateManagerOpen: (open: boolean) => void
  editProfileDialogOpen: boolean
  setEditProfileDialogOpen: (open: boolean) => void
}

// Load user from localStorage on init (client-side only)
function getStoredUser(): UserInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('epakar-user')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  return null
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'home',
  setCurrentView: (view) => set({ currentView: view }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  user: null, // Will be set by SessionChecker on mount
  setUser: (user) => {
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('epakar-user', JSON.stringify(user))
      } else {
        localStorage.removeItem('epakar-user')
      }
    }
    set({ user })
  },
  loginDialogOpen: false,
  setLoginDialogOpen: (open) => set({ loginDialogOpen: open }),
  registerDialogOpen: false,
  setRegisterDialogOpen: (open) => set({ registerDialogOpen: open }),
  profileDialogOpen: false,
  setProfileDialogOpen: (open) => set({ profileDialogOpen: open }),
  forgotPasswordDialogOpen: false,
  setForgotPasswordDialogOpen: (open) => set({ forgotPasswordDialogOpen: open }),
  resetPasswordDialogOpen: false,
  setResetPasswordDialogOpen: (open) => set({ resetPasswordDialogOpen: open }),
  resetPasswordToken: null,
  setResetPasswordToken: (token) => set({ resetPasswordToken: token }),
  selectedAgreementId: null,
  setSelectedAgreementId: (id) => set({ selectedAgreementId: id }),
  paymentDialogOpen: false,
  setPaymentDialogOpen: (open) => set({ paymentDialogOpen: open }),
  paymentBorrowingId: '',
  setPaymentBorrowingId: (id) => set({ paymentBorrowingId: id }),
  verifyDialogOpen: false,
  setVerifyDialogOpen: (open) => set({ verifyDialogOpen: open }),
  verifyToken: '',
  setVerifyToken: (token) => set({ verifyToken: token }),
  sessionChecked: false,
  setSessionChecked: (checked) => set({ sessionChecked: checked }),
  templateManagerOpen: false,
  setTemplateManagerOpen: (open) => set({ templateManagerOpen: open }),
  editProfileDialogOpen: false,
  setEditProfileDialogOpen: (open) => set({ editProfileDialogOpen: open }),
}))

// NOTE: Do NOT initialize user from localStorage at module level.
// This was causing hydration mismatches because the client would have a
// different initial state than the server. Instead, the SessionChecker
// component restores the user from localStorage inside useEffect (after hydration).
