'use client'

import { useState, useRef } from 'react'
import {
  Home,
  Building2,
  Car,
  CalendarDays,
  MoreHorizontal,
  Moon,
  Sun,
  LogOut,
  FileText,
  LayoutDashboard,
  Settings,
  Star,
  BarChart3,
  Warehouse,
  Bus,
} from 'lucide-react'
import { useAppStore, type ViewType } from '@/lib/store'
import { useTheme } from 'next-themes'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const mainNavItems = [
  { label: 'Beranda', view: 'home' as ViewType, icon: Home, activeIcon: Home },
  { label: 'Aula', view: 'pinjam-aula' as ViewType, icon: Building2, activeIcon: Building2 },
  { label: 'Kendaraan', view: 'pinjam-kendaraan' as ViewType, icon: Car, activeIcon: Car },
  { label: 'Kalender', view: 'kalender-aula' as ViewType, icon: CalendarDays, activeIcon: CalendarDays },
]

// Stagger animation variants for Sheet menu items
const sheetListVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const sheetItemVariants = {
  hidden: { opacity: 0, x: -16, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 25,
    },
  },
}

export default function MobileBottomNav() {
  const { currentView, setCurrentView, user, setUser, setLoginDialogOpen } =
    useAppStore()
  const { theme, setTheme } = useTheme()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [pressedItem, setPressedItem] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  const handleNavClick = (view: ViewType) => {
    setCurrentView(view)
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
    setSheetOpen(false)
    toast.success('Berhasil keluar')
  }

  const handleMoreMenuAction = (action: () => void) => {
    setSheetOpen(false)
    action()
  }

  // Determine if a main nav item is active
  const isActive = (view: ViewType) => {
    if (view === 'home') return currentView === 'home'
    if (view === 'pinjam-aula') return currentView === 'pinjam-aula'
    if (view === 'pinjam-kendaraan') return currentView === 'pinjam-kendaraan'
    if (view === 'kalender-aula')
      return (
        currentView === 'kalender-aula' || currentView === 'kalender-kendaraan'
      )
    return false
  }

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-dark border-t border-white/5"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="flex items-center justify-around h-[64px] relative px-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.view)
          const isPressed = pressedItem === item.view

          return (
            <button
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              onTouchStart={() => setPressedItem(item.view)}
              onTouchEnd={() => setPressedItem(null)}
              onMouseDown={() => setPressedItem(item.view)}
              onMouseUp={() => setPressedItem(null)}
              onMouseLeave={() => setPressedItem(null)}
              className="flex flex-col items-center justify-center py-1.5 flex-1 relative transition-transform duration-150"
              style={{
                transform: isPressed ? 'scale(0.9)' : 'scale(1)',
              }}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {/* Sliding indicator bar with layoutId */}
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}

              {/* Icon container with active background */}
              <motion.div
                className="relative flex items-center justify-center"
                animate={{
                  scale: active ? 1.15 : 1,
                  y: active ? -2 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 20,
                }}
              >
                {/* Active glow background */}
                {active && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute inset-0 -m-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                {/* Badge / notification dot on active */}
                {active && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"
                  />
                )}

                <Icon
                  className={`size-5 transition-all duration-300 ${
                    active
                      ? 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                  strokeWidth={active ? 2.5 : 1.5}
                  fill={active ? 'currentColor' : 'none'}
                  style={{ fillOpacity: active ? 0.15 : 0 }}
                />
              </motion.div>

              {/* Label */}
              <motion.span
                className={`text-[10px] mt-1 font-semibold transition-colors duration-300 ${
                  active
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                animate={{
                  y: active ? -1 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 20,
                }}
              >
                {item.label}
              </motion.span>

              {/* Active dot indicator below label */}
              {active && (
                <motion.span
                  layoutId="nav-dot"
                  className="h-1 w-1 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 mt-0.5"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
            </button>
          )
        })}

        {/* Lainnya (More) button - opens Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              className="flex flex-col items-center justify-center py-1.5 flex-1 transition-transform duration-150"
              aria-label="Lainnya"
              onTouchStart={() => setPressedItem('more')}
              onTouchEnd={() => setPressedItem(null)}
              onMouseDown={() => setPressedItem('more')}
              onMouseUp={() => setPressedItem(null)}
              onMouseLeave={() => setPressedItem(null)}
              style={{
                transform: pressedItem === 'more' ? 'scale(0.9)' : 'scale(1)',
              }}
            >
              <motion.div
                className="relative flex items-center justify-center"
                whileTap={{ scale: 0.9 }}
              >
                <MoreHorizontal className="size-5 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
              </motion.div>
              <span className="text-[10px] mt-1 font-semibold text-gray-400 dark:text-gray-500">
                Lainnya
              </span>
            </button>
          </SheetTrigger>

          <SheetContent side="bottom" className="rounded-t-2xl px-0">
            <SheetHeader className="px-6">
              <SheetTitle className="text-left text-lg font-bold gradient-text">
                Menu Lainnya
              </SheetTitle>
            </SheetHeader>

            <AnimatePresence>
              {sheetOpen && (
                <motion.div
                  className="flex flex-col gap-1 px-4 pb-8 pt-2"
                  variants={sheetListVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {user && (
                    <motion.button
                      variants={sheetItemVariants}
                      onClick={() =>
                        handleMoreMenuAction(() =>
                          setCurrentView('pengajuan-saya')
                        )
                      }
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 active:scale-[0.97]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-transform duration-200 group-hover:scale-110">
                        <FileText className="size-4" />
                      </div>
                      Pengajuan Saya
                    </motion.button>
                  )}

                  {user?.role === 'admin' && (
                    <motion.button
                      variants={sheetItemVariants}
                      onClick={() =>
                        handleMoreMenuAction(() =>
                          setCurrentView('admin-dashboard')
                        )
                      }
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-400 active:scale-[0.97]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 transition-transform duration-200 group-hover:scale-110">
                        <LayoutDashboard className="size-4" />
                      </div>
                      Dashboard Admin
                    </motion.button>
                  )}

                  {user?.role === 'admin' && (
                    <motion.button
                      variants={sheetItemVariants}
                      onClick={() =>
                        handleMoreMenuAction(() =>
                          setCurrentView('admin-aula')
                        )
                      }
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400 active:scale-[0.97]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 transition-transform duration-200 group-hover:scale-110">
                        <Warehouse className="size-4" />
                      </div>
                      Kelola Aula
                    </motion.button>
                  )}

                  {user?.role === 'admin' && (
                    <motion.button
                      variants={sheetItemVariants}
                      onClick={() =>
                        handleMoreMenuAction(() =>
                          setCurrentView('admin-kendaraan')
                        )
                      }
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-700 dark:hover:text-cyan-400 active:scale-[0.97]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 transition-transform duration-200 group-hover:scale-110">
                        <Bus className="size-4" />
                      </div>
                      Kelola Kendaraan
                    </motion.button>
                  )}

                  {user?.role === 'admin' && (
                    <motion.button
                      variants={sheetItemVariants}
                      onClick={() =>
                        handleMoreMenuAction(() =>
                          setCurrentView('admin-settings')
                        )
                      }
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 active:scale-[0.97]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 transition-transform duration-200 group-hover:scale-110">
                        <Settings className="size-4" />
                      </div>
                      Pengaturan
                    </motion.button>
                  )}

                  {user?.role === 'admin' && (
                    <motion.button
                      variants={sheetItemVariants}
                      onClick={() =>
                        handleMoreMenuAction(() =>
                          setCurrentView('admin-testimonials')
                        )
                      }
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-700 dark:hover:text-rose-400 active:scale-[0.97]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 transition-transform duration-200 group-hover:scale-110">
                        <Star className="size-4" />
                      </div>
                      Testimoni
                    </motion.button>
                  )}

                  {user?.role === 'admin' && (
                    <motion.button
                      variants={sheetItemVariants}
                      onClick={() =>
                        handleMoreMenuAction(() =>
                          setCurrentView('admin-reports')
                        )
                      }
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400 active:scale-[0.97]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 transition-transform duration-200 group-hover:scale-110">
                        <BarChart3 className="size-4" />
                      </div>
                      Laporan
                    </motion.button>
                  )}

                  {/* Dark Mode Toggle */}
                  <motion.button
                    variants={sheetItemVariants}
                    onClick={() =>
                      setTheme(theme === 'dark' ? 'light' : 'dark')
                    }
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.97]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-transform duration-200 group-hover:scale-110">
                      {theme === 'dark' ? (
                        <Sun className="size-4" />
                      ) : (
                        <Moon className="size-4" />
                      )}
                    </div>
                    {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                  </motion.button>

                  {/* Divider */}
                  <motion.div
                    variants={sheetItemVariants}
                    className="my-2 border-t border-gray-200 dark:border-gray-700"
                  />

                  {user ? (
                    <motion.button
                      variants={sheetItemVariants}
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-[0.97]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 transition-transform duration-200 group-hover:scale-110">
                        <LogOut className="size-4" />
                      </div>
                      {loggingOut ? 'Keluar...' : 'Logout'}
                    </motion.button>
                  ) : (
                    <motion.div variants={sheetItemVariants}>
                      <Button
                        onClick={() => {
                          setSheetOpen(false)
                          setLoginDialogOpen(true)
                        }}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md mt-1 btn-modern"
                      >
                        <span className="flex items-center gap-2">
                          Masuk
                          <span className="animate-pulse h-2 w-2 rounded-full bg-emerald-300" />
                        </span>
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
