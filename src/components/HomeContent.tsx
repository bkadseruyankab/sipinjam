'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import TarifSection from '@/components/TarifSection'
import CalendarSection from '@/components/CalendarSection'
import FasilitasSection from '@/components/FasilitasSection'
import LayananSection from '@/components/LayananSection'
import AlurSection from '@/components/AlurSection'
import TestimonialSection from '@/components/TestimonialSection'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'
import LoginDialog from '@/components/LoginDialog'
import RegisterDialog from '@/components/RegisterDialog'
import PeminjamanAulaForm from '@/components/PeminjamanAulaForm'
import PeminjamanKendaraanForm from '@/components/PeminjamanKendaraanForm'
import PengajuanSaya from '@/components/PengajuanSaya'
import KalenderView from '@/components/KalenderView'
import AdminDashboard from '@/components/AdminDashboard'
import PerjanjianView from '@/components/PerjanjianView'
import SettingsPage from '@/components/SettingsPage'
import NotificationsPage from '@/components/NotificationsPage'
import ReportPage from '@/components/ReportPage'
import AdminTestimonials from '@/components/AdminTestimonials'
import UserManagement from '@/components/UserManagement'
import KendaraanManagement from '@/components/KendaraanManagement'
import AulaManagement from '@/components/AulaManagement'
import SessionChecker from '@/components/SessionChecker'

import MobileBottomNav from '@/components/MobileBottomNav'
import SetupWizard from '@/components/SetupWizard'
import UserProfileDialog from '@/components/UserProfileDialog'
import ForgotPasswordDialog from '@/components/ForgotPasswordDialog'
import ResetPasswordDialog from '@/components/ResetPasswordDialog'
import PaymentDialog from '@/components/PaymentDialog'
import VerifyDialog from '@/components/VerifyDialog'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import TemplateManagerOverlay from '@/components/TemplateManagerOverlay'
import EditProfileDialog from '@/components/EditProfileDialog'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const pageTransition = {
  type: 'tween',
  ease: [0.4, 0, 0.2, 1],
  duration: 0.3,
}

export default function HomeContent() {
  // Use selector to only subscribe to currentView — prevents re-renders from other store changes
  const currentView = useAppStore((state) => state.currentView)
  const [setupCompleted, setSetupCompleted] = useState<boolean | null>(null)
  const [checkingSetup, setCheckingSetup] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Mark as mounted on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch('/api/setup')
        if (res.ok) {
          const data = await res.json()
          setSetupCompleted(data.completed === true)
        } else {
          // If endpoint errors, assume setup is done (backward compat)
          setSetupCompleted(true)
        }
      } catch {
        // Network error — assume setup is done to not block the app
        setSetupCompleted(true)
      } finally {
        setCheckingSetup(false)
      }
    }
    checkSetup()
  }, [])

  // Memoize to prevent SetupWizard from re-rendering when parent re-renders
  const handleSetupComplete = useCallback(() => {
    setSetupCompleted(true)
    // Reload the page to apply new settings
    window.location.reload()
  }, [])

  // Show loading while checking setup status (avoid hydration mismatch by deferring to client)
  if (!mounted || checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse-glow">
              <Loader2 className="h-7 w-7 text-white animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 animate-pulse-ring opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Memuat aplikasi...</p>
            <div className="mt-2 flex justify-center gap-1">
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show setup wizard if not completed
  if (!setupCompleted) {
    return <SetupWizard onComplete={handleSetupComplete} />
  }

  const renderView = () => {
    switch (currentView) {
      case 'pinjam-aula':
        return <PeminjamanAulaForm />
      case 'pinjam-kendaraan':
        return <PeminjamanKendaraanForm />
      case 'pengajuan-saya':
        return <PengajuanSaya />
      case 'kalender-aula':
        return <KalenderView initialType="aula" />
      case 'kalender-kendaraan':
        return <KalenderView initialType="kendaraan" />
      case 'admin-dashboard':
        return <AdminDashboard />
      case 'perjanjian':
        return <PerjanjianView />
      case 'admin-settings':
        return <SettingsPage />
      case 'admin-notifications':
        return <NotificationsPage />
      case 'admin-reports':
        return <ReportPage />
      case 'admin-testimonials':
        return <AdminTestimonials />
      case 'admin-users':
        return <UserManagement />
      case 'admin-kendaraan':
        return <KendaraanManagement />
      case 'admin-aula':
        return <AulaManagement />
      case 'home':
      default:
        return (
          <>
            <HeroSection />
            <TarifSection />
            <CalendarSection />
            <LayananSection />
            <FasilitasSection />
            <AlurSection />
            <TestimonialSection />
            <CTASection />
          </>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <LoginDialog />
      <RegisterDialog />
      <UserProfileDialog />
      <ForgotPasswordDialog />
      <ResetPasswordDialog />
      <PaymentDialog />
      <VerifyDialog />
      <EditProfileDialog />
      <MobileBottomNav />
      <PWAInstallPrompt />
      <TemplateManagerOverlay />
    </div>
  )
}
