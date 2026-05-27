'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star, MessageCircle, Mail, Smartphone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { useIdentity } from '@/hooks/useIdentity'

interface TestimonialData {
  id: string
  name: string
  instansi?: string | null
  rating: number
  message: string
  source: string
  createdAt: string
  user?: {
    name: string
    email: string
    instansi?: string | null
  }
}

const fallbackTestimonials = [
  {
    id: 'fallback-1',
    name: 'Hj. Siti Nurhaliza, S.H., M.H.',
    instansi: 'Kepala Dinas Pendidikan',
    rating: 5,
    message: 'Proses peminjaman aula melalui E-Pakar sangat mudah dan cepat. Tidak perlu lagi datang ke kantor untuk mengurus surat-menyurat. Sistem ini benar-benar memudahkan kami dalam mengajukan peminjaman.',
    source: 'app',
    createdAt: new Date().toISOString(),
    avatarBg: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'fallback-2',
    name: 'Drs. H. Ahmad Fauzi, M.Si.',
    instansi: 'Sekretaris Badan Perencanaan Pembangunan',
    rating: 5,
    message: 'Sejak menggunakan E-Pakar, pengajuan peminjaman kendaraan dinas menjadi lebih terstruktur dan transparan. Kami bisa memantau status pengajuan secara real-time. Sangat membantu!',
    source: 'whatsapp',
    createdAt: new Date().toISOString(),
    avatarBg: 'from-violet-500 to-purple-600',
  },
  {
    id: 'fallback-3',
    name: 'Ir. Rina Wulandari, M.T.',
    instansi: 'Kepala Bidang Infrastruktur Dinas PUPR',
    rating: 4,
    message: 'Aplikasi E-Pakar memberikan kemudahan akses yang luar biasa. Jadwal ketersediaan aula bisa dilihat langsung, sehingga perencanaan kegiatan menjadi lebih efisien dan terorganisir.',
    source: 'email',
    createdAt: new Date().toISOString(),
    avatarBg: 'from-rose-500 to-pink-600',
  },
]

const avatarColors = [
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
]

function SourceBadge({ source }: { source: string }) {
  switch (source) {
    case 'whatsapp':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] gap-1 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
          <MessageCircle className="size-3" />
          WhatsApp
        </Badge>
      )
    case 'email':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] gap-1 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
          <Mail className="size-3" />
          Email
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
          <Smartphone className="size-3" />
          App
        </Badge>
      )
  }
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const iconSize = size === 'md' ? 'size-5' : 'size-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.div
          key={star}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.3,
            delay: star * 0.08,
            type: 'spring',
            stiffness: 300,
            damping: 15,
          }}
        >
          <Star
            className={`${iconSize} ${
              star <= rating
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </motion.div>
      ))}
    </div>
  )
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

const AUTO_ADVANCE_MS = 6000

export default function TestimonialSection() {
  const { identity } = useIdentity()
  const siteName = identity.site_name || 'E-Pakar'
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [testimonials, setTestimonials] = useState<(TestimonialData & { avatarBg?: string })[]>(fallbackTestimonials)
  const [isRealData, setIsRealData] = useState(false)
  const [progressKey, setProgressKey] = useState(0)

  // Fetch real published testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/testimonial?published=true')
        if (res.ok) {
          const data = await res.json()
          if (data.testimonials && data.testimonials.length > 0) {
            const mapped = data.testimonials.map((t: TestimonialData, i: number) => ({
              ...t,
              instansi: t.instansi || t.user?.instansi || null,
              avatarBg: avatarColors[i % avatarColors.length],
            }))
            setTestimonials(mapped)
            setIsRealData(true)
          }
        }
      } catch {
        // Keep fallback testimonials
      }
    }
    fetchTestimonials()
  }, [])

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % testimonials.length)
    setProgressKey((k) => k + 1)
  }, [testimonials.length])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setProgressKey((k) => k + 1)
  }, [testimonials.length])

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [next])

  const goToSlide = (i: number) => {
    setDirection(i > current ? 1 : -1)
    setCurrent(i)
    setProgressKey((k) => k + 1)
  }

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
    }),
  }

  const t = testimonials[current]

  if (!t) return null

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-white to-emerald-50/20 dark:from-gray-950 dark:to-gray-900/20 overflow-hidden">
      {/* Subtle Background Blob Decoration */}
      <div className="blob-decoration w-96 h-96 bg-emerald-400 -top-48 -right-48 animate-morph" />
      <div className="blob-decoration w-72 h-72 bg-teal-400 -bottom-36 -left-36 animate-morph" style={{ animationDelay: '3s' }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
            Testimoni
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text">
            Apa Kata Mereka?
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Pendapat para pengguna tentang layanan {siteName}
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-3xl mx-auto">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <Card className="card-3d card-shine glow-border border-emerald-100 dark:border-gray-700 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-gray-800/50 dark:to-gray-800/30 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 md:p-10 relative z-10">
                    {/* Rotating Quote Icon */}
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="inline-block mb-4"
                    >
                      <Quote className="size-10 text-emerald-300/60 dark:text-emerald-700/60" />
                    </motion.div>

                    <blockquote className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      &ldquo;{t.message}&rdquo;
                    </blockquote>

                    {/* Star Rating with staggered pop-in */}
                    <div className="mb-4">
                      <StarRating rating={t.rating} size="md" />
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        {/* Avatar with rotating gradient ring */}
                        <div className="relative">
                          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 animate-spin-slow opacity-80" />
                          <div className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${t.avatarBg || avatarColors[0]} text-white font-bold text-lg shadow-lg ring-2 ring-white dark:ring-gray-900`}>
                            {t.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{t.name}</p>
                          <p className="text-sm text-emerald-600 dark:text-emerald-400">{t.instansi}</p>
                          {isRealData && t.createdAt && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(t.createdAt)}</p>
                          )}
                        </div>
                      </div>
                      {isRealData && (
                        <SourceBadge source={t.source} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows with Glassmorphism */}
          <button
            onClick={prev}
            className="glass absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-12 flex h-10 w-10 items-center justify-center rounded-full text-emerald-600 dark:text-emerald-400 shadow-sm hover:scale-110 transition-all duration-300 cursor-pointer"
            aria-label="Testimoni sebelumnya"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={next}
            className="glass absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-12 flex h-10 w-10 items-center justify-center rounded-full text-emerald-600 dark:text-emerald-400 shadow-sm hover:scale-110 transition-all duration-300 cursor-pointer"
            aria-label="Testimoni berikutnya"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === current
                    ? 'w-8 bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'w-2.5 bg-emerald-200 dark:bg-gray-600 hover:bg-emerald-300 dark:hover:bg-gray-500'
                }`}
                aria-label={`Testimoni ${i + 1}`}
              />
            ))}
          </div>

          {/* Progress Bar - CSS animated, resets via key change */}
          <div className="mt-4 h-0.5 w-full max-w-xs mx-auto bg-emerald-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              key={progressKey}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: 'linear' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
