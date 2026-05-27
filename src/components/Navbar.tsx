'use client'

import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'

import { Menu, LogOut, User, LayoutDashboard, FileText, Settings, Bell, Home, Building2, Car, CalendarDays, Moon, Sun, BarChart3, Star, Users, PenLine, Warehouse, Bus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAppStore } from '@/lib/store'
import { useIdentity } from '@/hooks/useIdentity'
import { toast } from 'sonner'
import Image from 'next/image'

const navLinks = [
  { label: 'Beranda', view: 'home' as const, icon: Home, color: 'text-emerald-600' },
  { label: 'Peminjaman Aula', view: 'pinjam-aula' as const, icon: Building2, color: 'text-teal-600' },
  { label: 'Peminjaman Kendaraan', view: 'pinjam-kendaraan' as const, icon: Car, color: 'text-cyan-600' },
  { label: 'Kalender', view: 'kalender-aula' as const, icon: CalendarDays, color: 'text-amber-600' },
]

const adminNavLinks = [
  { label: 'Kelola Aula', view: 'admin-aula' as const, icon: Warehouse, color: 'text-teal-600' },
  { label: 'Kelola Kendaraan', view: 'admin-kendaraan' as const, icon: Bus, color: 'text-cyan-600' },
  { label: 'Laporan', view: 'admin-reports' as const, icon: BarChart3, color: 'text-indigo-600' },
  { label: 'Testimoni', view: 'admin-testimonials' as const, icon: Star, color: 'text-yellow-600' },
]

const emptySubscribe = () => () => {}

/* ─── Theme Toggle ──────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9 rounded-full">
        <Sun className="size-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9 rounded-full transition-all duration-300 hover:scale-110 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: 90, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="size-4" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: -90, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="size-4" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

/* ─── Logo Display ──────────────────────────────────────────── */
function LogoDisplay({ siteLogo, siteName, size = 'default' }: { siteLogo: string; siteName: string; size?: 'default' | 'small' }) {
  const initials = siteName ? siteName.charAt(0).toUpperCase() : 'E'
  if (siteLogo) {
    return (
      <Image
        src={siteLogo}
        alt={`${siteName || 'E-Pakar'} Logo`}
        width={size === 'small' ? 32 : 36}
        height={size === 'small' ? 32 : 36}
        className="rounded-lg object-contain"
      />
    )
  }
  return (
    <div className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30 ${size === 'small' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm'}`}>
      {initials}
    </div>
  )
}

/* ─── Shimmer Button ────────────────────────────────────────── */
function ShimmerButton({ children, onClick, className }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600 text-white shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30 transition-all duration-300 hover:shadow-lg rounded-md px-4 py-2 text-sm font-medium ${className || ''}`}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Shimmer overlay */}
      <motion.span
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
        animate={{ x: ['-100%', '200%'] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeInOut',
        }}
      />
      <span className="relative flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}

/* ─── Desktop Nav Link ──────────────────────────────────────── */
function DesktopNavLink({
  link,
  isActive,
  onClick,
}: {
  link: typeof navLinks[number]
  isActive: boolean
  onClick: () => void
}) {
  const Icon = link.icon
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      key={link.view}
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
    >
      {/* Hover background pill */}
      <motion.span
        className="absolute inset-0 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/30"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.9 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      />

      {/* Active indicator pill */}
      {isActive && (
        <motion.span
          layoutId="nav-active-pill"
          className="absolute inset-0 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/40"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}

      <span className="relative z-10 flex items-center gap-1.5">
        <Icon className={`size-4 transition-colors duration-200 ${isActive ? link.color + ' opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
        <span className={`transition-colors duration-200 ${
          isActive
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-gray-700 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-400'
        }`}>
          {link.label}
        </span>
      </span>

      {/* Active bottom indicator bar */}
      {isActive && (
        <motion.span
          layoutId="nav-active-underline"
          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </motion.button>
  )
}

/* ─── Mobile Nav Item (staggered) ───────────────────────────── */
const mobileItemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.15 } },
}

/* ─── Main Navbar ───────────────────────────────────────────── */
export default function Navbar() {
  const { user, currentView, setUser, setCurrentView, setLoginDialogOpen, setProfileDialogOpen, setEditProfileDialogOpen } = useAppStore()
  const { identity } = useIdentity()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const siteName = identity.site_name || 'E-Pakar'
  const siteLogo = identity.site_logo || ''

  /* Scroll listener — use a ref so we only re-render when the boolean flips */
  const scrollRef = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrollRef.current) {
        scrollRef.current = isScrolled
        setScrolled(isScrolled)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (view: Parameters<typeof setCurrentView>[0]) => {
    setCurrentView(view)
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore errors — clear client state anyway
    }
    setUser(null)
    setLoggingOut(false)
    setCurrentView('home')
    toast.success('Berhasil keluar')
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? 'shadow-lg shadow-emerald-900/5 dark:shadow-emerald-900/20 border-b border-white/20 dark:border-gray-700/30'
          : 'border-b border-emerald-200/30 dark:border-gray-700/20'
      } bg-gradient-to-r from-white/80 via-emerald-50/60 to-teal-50/60 dark:from-gray-900/90 dark:via-gray-900/80 dark:to-gray-800/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-gray-900/50`}
    >
      {/* Subtle border glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 dark:via-emerald-500/20 to-transparent" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.button
          onClick={() => handleNavClick('home')}
          className="group flex items-center gap-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="relative">
            <LogoDisplay siteLogo={siteLogo} siteName={siteName} />
            {/* Glow ring on hover */}
            <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-emerald-400/20 dark:bg-emerald-500/30 blur-md" />
          </span>
          <span className="text-xl font-bold gradient-text transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
            {siteName}
          </span>
        </motion.button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <DesktopNavLink
              key={link.view}
              link={link}
              isActive={currentView === link.view}
              onClick={() => handleNavClick(link.view)}
            />
          ))}
        </nav>

        {/* Desktop Auth Area */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-800 dark:hover:text-emerald-300">
                  <User className="size-4" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-emerald-600">{user.role === 'admin' ? 'Administrator' : 'Pengguna'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavClick('pengajuan-saya')}>
                  <FileText className="mr-2 size-4" />
                  Pengajuan Saya
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
                  <PenLine className="mr-2 size-4" />
                  Profil & Tanda Tangan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditProfileDialogOpen(true)}>
                  <User className="mr-2 size-4" />
                  Edit Profil
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => handleNavClick('admin-dashboard')}>
                    <LayoutDashboard className="mr-2 size-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => handleNavClick('admin-aula')}>
                    <Warehouse className="mr-2 size-4" />
                    Kelola Aula
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => handleNavClick('admin-kendaraan')}>
                    <Bus className="mr-2 size-4" />
                    Kelola Kendaraan
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => handleNavClick('admin-reports')}>
                    <BarChart3 className="mr-2 size-4" />
                    Laporan
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => handleNavClick('admin-testimonials')}>
                    <Star className="mr-2 size-4" />
                    Testimoni
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => handleNavClick('admin-users')}>
                    <Users className="mr-2 size-4" />
                    Kelola Pengguna
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => handleNavClick('admin-settings')}>
                    <Settings className="mr-2 size-4" />
                    Pengaturan
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => handleNavClick('admin-notifications')}>
                    <Bell className="mr-2 size-4" />
                    Notifikasi
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={loggingOut} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-2 size-4" />
                  {loggingOut ? 'Keluar...' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <ShimmerButton onClick={() => setLoginDialogOpen(true)}>
              Masuk
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 dark:bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300 dark:bg-emerald-400" />
              </span>
            </ShimmerButton>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-emerald-700 dark:text-emerald-400"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-5" />
          <span className="sr-only">Buka menu</span>
        </Button>
      </div>

      {/* Mobile Sheet Menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-white dark:bg-gray-900 p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle className="flex items-center gap-2 gradient-text text-xl font-bold">
              <LogoDisplay siteLogo={siteLogo} siteName={siteName} size="small" />
              {siteName}
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4 pt-4">
            <AnimatePresence mode="wait">
              {mobileOpen && navLinks.map((link, i) => {
                const Icon = link.icon
                const isActive = currentView === link.view
                return (
                  <motion.button
                    key={link.view}
                    custom={i}
                    variants={mobileItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={() => handleNavClick(link.view)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400'
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isActive
                        ? 'bg-emerald-100 dark:bg-emerald-800/50'
                        : 'bg-gray-100 dark:bg-gray-800'
                    } ${link.color}`}>
                      <Icon className="size-4" />
                    </div>
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="mobile-active-dot"
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </nav>
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 px-4 pt-4">
            {/* Dark Mode Toggle - Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinks.length * 0.06 + 0.05, duration: 0.3 }}
              className="flex items-center justify-between px-3 py-2.5 mb-2"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Mode Gelap</span>
              <ThemeToggle />
            </motion.div>

            <AnimatePresence mode="wait">
              {mobileOpen && user ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.06 + 0.1, duration: 0.3 }}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium dark:text-gray-100">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleNavClick('pengajuan-saya') }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                  >
                    <FileText className="size-4 text-blue-500" />
                    Pengajuan Saya
                  </button>
                  <button
                    onClick={() => { setProfileDialogOpen(true); setMobileOpen(false) }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                  >
                    <PenLine className="size-4 text-emerald-500" />
                    Profil & Tanda Tangan
                  </button>
                  <button
                    onClick={() => { setEditProfileDialogOpen(true); setMobileOpen(false) }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                  >
                    <User className="size-4 text-emerald-500" />
                    Edit Profil
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => { handleNavClick('admin-dashboard') }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
                    >
                      <LayoutDashboard className="size-4 text-purple-500" />
                      Admin Dashboard
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <button
                      onClick={() => { handleNavClick('admin-aula') }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                    >
                      <Warehouse className="size-4 text-teal-500" />
                      Kelola Aula
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <button
                      onClick={() => { handleNavClick('admin-kendaraan') }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors"
                    >
                      <Bus className="size-4 text-cyan-500" />
                      Kelola Kendaraan
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <button
                      onClick={() => { handleNavClick('admin-reports') }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
                    >
                      <BarChart3 className="size-4 text-indigo-500" />
                      Laporan
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <button
                      onClick={() => { handleNavClick('admin-testimonials') }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 hover:text-yellow-700 dark:hover:text-yellow-400 transition-colors"
                    >
                      <Star className="size-4 text-yellow-500" />
                      Testimoni
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <button
                      onClick={() => { handleNavClick('admin-users') }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-400 transition-colors"
                    >
                      <Users className="size-4 text-violet-500" />
                      Kelola Pengguna
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <button
                      onClick={() => { handleNavClick('admin-settings') }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                    >
                      <Settings className="size-4 text-amber-500" />
                      Pengaturan
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <button
                      onClick={() => { handleNavClick('admin-notifications') }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-700 dark:hover:text-rose-400 transition-colors"
                    >
                      <Bell className="size-4 text-rose-500" />
                      Notifikasi
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <LogOut className="size-4" />
                    {loggingOut ? 'Keluar...' : 'Logout'}
                  </button>
                </motion.div>
              ) : mobileOpen && !user ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.06 + 0.1, duration: 0.3 }}
                >
                  <ShimmerButton
                    onClick={() => { setLoginDialogOpen(true); setMobileOpen(false) }}
                    className="w-full"
                  >
                    Masuk
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 dark:bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300 dark:bg-emerald-400" />
                    </span>
                  </ShimmerButton>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
