'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Users,
  Coffee,
  Snowflake,
  Volume2,
  Monitor,
  Wifi,
  Video,
  ImageIcon,
  ZoomIn,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Icon mapping from string names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Coffee,
  Snowflake,
  Volume2,
  Monitor,
  Wifi,
  Video,
  ImageIcon,
  Projector: Monitor,
  Mic: Volume2,
  Presentation: Monitor,
  Tv: Monitor,
  Lamp: ImageIcon,
  Plug: ImageIcon,
  Shirt: ImageIcon,
  Utensils: Coffee,
  Car: ImageIcon,
}

// Gradient backgrounds for different icon types
const GRADIENTS = [
  'bg-gradient-to-br from-emerald-400 to-teal-500',
  'bg-gradient-to-br from-amber-400 to-orange-500',
  'bg-gradient-to-br from-cyan-400 to-blue-500',
  'bg-gradient-to-br from-violet-400 to-purple-500',
  'bg-gradient-to-br from-rose-400 to-pink-500',
  'bg-gradient-to-br from-teal-400 to-emerald-500',
  'bg-gradient-to-br from-green-400 to-emerald-500',
  'bg-gradient-to-br from-lime-400 to-green-500',
  'bg-gradient-to-br from-orange-400 to-amber-500',
  'bg-gradient-to-br from-emerald-400 to-cyan-500',
]

const HOVER_GRADIENTS = [
  'group-hover:from-emerald-500 group-hover:to-teal-600',
  'group-hover:from-amber-500 group-hover:to-orange-600',
  'group-hover:from-cyan-500 group-hover:to-blue-600',
  'group-hover:from-violet-500 group-hover:to-purple-600',
  'group-hover:from-rose-500 group-hover:to-pink-600',
  'group-hover:from-teal-500 group-hover:to-emerald-600',
  'group-hover:from-green-500 group-hover:to-emerald-600',
  'group-hover:from-lime-500 group-hover:to-green-600',
  'group-hover:from-orange-500 group-hover:to-amber-600',
  'group-hover:from-emerald-500 group-hover:to-cyan-600',
]

// Spinning gradient classes for icon background animation
const SPIN_GRADIENTS = [
  'from-emerald-300 via-teal-300 to-cyan-300',
  'from-amber-300 via-orange-300 to-yellow-300',
  'from-cyan-300 via-blue-300 to-sky-300',
  'from-violet-300 via-purple-300 to-fuchsia-300',
  'from-rose-300 via-pink-300 to-red-300',
  'from-teal-300 via-emerald-300 to-green-300',
  'from-green-300 via-emerald-300 to-lime-300',
  'from-lime-300 via-green-300 to-emerald-300',
  'from-orange-300 via-amber-300 to-yellow-300',
  'from-emerald-300 via-cyan-300 to-teal-300',
]

interface FasilitasItem {
  id: string
  nama: string
  deskripsi: string
  icon: string
  imageUrl: string | null
  urutan: number
  aktif: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function FasilitasSection() {
  const [fasilitas, setFasilitas] = useState<FasilitasItem[]>([])
  const [loading, setLoading] = useState(true)
  const [aulaImage, setAulaImage] = useState('')
  const [aulaGallery, setAulaGallery] = useState<string[]>([])
  const sectionRef = useRef<HTMLElement>(null)

  // Parallax scroll effect for gallery
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const galleryY = useTransform(scrollYProgress, [0, 1], [40, -40])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch fasilitas from API
        const fasilitasRes = await fetch('/api/fasilitas')
        if (fasilitasRes.ok) {
          const fasilitasData = await fasilitasRes.json()
          // Only show active facilities
          const activeFasilitas = (fasilitasData.fasilitas || []).filter(
            (f: FasilitasItem) => f.aktif
          )
          setFasilitas(activeFasilitas)
        }
      } catch {
        // Use empty array on error
      }

      try {
        // Fetch settings for aula images
        const settingsRes = await fetch('/api/settings')
        if (settingsRes.ok) {
          const data = await settingsRes.json()
          const settings = data.settings || {}
          if (settings.aula_image) setAulaImage(settings.aula_image)

          try {
            const gallery = JSON.parse(settings.aula_gallery || '[]')
            if (Array.isArray(gallery)) setAulaGallery(gallery)
          } catch { /* ignore */ }
        }
      } catch {
        // Use defaults
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  // Combine gallery images for display
  const displayImages = aulaGallery.length > 0
    ? aulaGallery
    : aulaImage
    ? [aulaImage]
    : []

  const getIcon = (iconName: string): LucideIcon => {
    return ICON_MAP[iconName] || Wifi
  }

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-gradient-to-b from-white to-emerald-50/30 relative overflow-hidden dot-pattern">
      {/* Background decoration - subtle glowing dots */}
      <div className="blob-decoration w-80 h-80 bg-emerald-400 -top-24 -right-24 animate-morph" />
      <div className="blob-decoration w-64 h-64 bg-teal-300 -bottom-16 -left-16 animate-morph" style={{ animationDelay: '4s' }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">
            Fasilitas
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text">
            Fasilitas Aula
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Fasilitas lengkap untuk mendukung kelancaran dan kenyamanan setiap acara Anda
          </p>
        </motion.div>

        {/* Aula Image Gallery with parallax */}
        {displayImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <motion.div
              style={{ y: galleryY }}
              className={`grid gap-4 ${
                displayImages.length === 1
                  ? 'grid-cols-1 max-w-3xl mx-auto'
                  : displayImages.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : displayImages.length === 3
                  ? 'grid-cols-1 sm:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              }`}
            >
              {displayImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`group/gallery relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:scale-[1.02] ${
                    displayImages.length === 1 ? 'h-64 sm:h-80' : 'h-48 sm:h-56'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Aula BKAD ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/gallery:scale-110"
                  />
                  {/* Modern overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                    <div className="flex items-center gap-2 text-white text-sm font-medium translate-y-4 group-hover/gallery:translate-y-0 transition-transform duration-500">
                      <ZoomIn className="size-4" />
                      <span>Lihat Detail</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Facility Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-full border-gray-100">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Skeleton className="mb-4 h-14 w-14 rounded-xl" />
                    <Skeleton className="mb-2 h-5 w-32" />
                    <Skeleton className="h-12 w-full max-w-xs" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : fasilitas.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {fasilitas.map((facility, index) => {
              const Icon = getIcon(facility.icon)
              const gradientIdx = index % GRADIENTS.length
              return (
                <motion.div key={facility.id} variants={itemVariants}>
                  <Card className="h-full card-hover card-shine border-gray-100 hover:border-emerald-200 transition-all duration-300 group overflow-hidden">
                    <CardContent className="pt-6 relative z-10">
                      <div className="flex flex-col items-center text-center">
                        {facility.imageUrl ? (
                          <div className="mb-4 h-20 w-full overflow-hidden rounded-xl">
                            <img
                              src={facility.imageUrl}
                              alt={facility.nama}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="relative mb-4">
                            {/* Spinning gradient background on hover */}
                            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${SPIN_GRADIENTS[gradientIdx]} opacity-0 group-hover:opacity-40 group-hover:animate-spin-slow blur-md transition-opacity duration-500`} />
                            <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl ${GRADIENTS[gradientIdx]} ${HOVER_GRADIENTS[gradientIdx]} text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                              <Icon className="size-7" />
                            </div>
                          </div>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {facility.nama}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {facility.deskripsi}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          /* Animated empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="relative inline-block mb-6">
              {/* Animated ring around the icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-300 animate-spin-slow" />
              </div>
              {/* Pulsing glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 animate-pulse-glow" />
              </div>
              <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
                <ImageIcon className="size-10 text-emerald-400" />
              </div>
            </div>
            <p className="text-gray-500 font-medium">Belum ada fasilitas yang ditambahkan</p>
            <p className="text-sm text-gray-400 mt-1">Admin dapat menambahkan fasilitas melalui halaman Pengaturan</p>
            {/* Decorative dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-bounce-soft" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-bounce-soft" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-bounce-soft" style={{ animationDelay: '0.4s' }} />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
