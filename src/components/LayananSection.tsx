'use client'

import { motion } from 'framer-motion'
import {
  Building2,
  Car,
  FileText,
  CalendarCheck,
  Zap,
  Mail,
  Sparkles,
  Clock,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'

const serviceCards = [
  {
    icon: FileText,
    title: 'Pengajuan Mudah',
    description: 'Isi formulir peminjaman secara online dengan tampilan yang intuitif dan langkah-langkah yang jelas.',
    bgColor: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-100 text-violet-600',
    ringColor: 'ring-violet-200',
  },
  {
    icon: CalendarCheck,
    title: 'Jadwal Real-time',
    description: 'Pantau ketersediaan jadwal secara langsung untuk memastikan waktu yang Anda inginkan tersedia.',
    bgColor: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100 text-amber-600',
    ringColor: 'ring-amber-200',
  },
  {
    icon: Zap,
    title: 'Proses Cepat',
    description: 'Verifikasi dan persetujuan dilakukan secara digital, mempersingkat waktu tunggu secara signifikan.',
    bgColor: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-100 text-rose-600',
    ringColor: 'ring-rose-200',
  },
  {
    icon: Mail,
    title: 'Notifikasi Email',
    description: 'Terima pemberitahuan otomatis melalui email untuk setiap pembaruan status pengajuan Anda.',
    bgColor: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-100 text-cyan-600',
    ringColor: 'ring-cyan-200',
  },
]

const badges = [
  { icon: Sparkles, label: 'Online', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { icon: Clock, label: 'Real-time', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { icon: Shield, label: 'Terpercaya', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
]

const popInVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: i * 0.12,
    },
  }),
}

export default function LayananSection() {
  const { setCurrentView } = useAppStore()

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden grid-pattern">
      {/* Background decoration - floating gradient blobs */}
      <div className="blob-decoration w-72 h-72 bg-emerald-400 -top-20 -left-20 animate-morph" />
      <div className="blob-decoration w-96 h-96 bg-teal-400 -bottom-32 -right-32 animate-morph" style={{ animationDelay: '3s' }} />
      <div className="blob-decoration w-56 h-56 bg-cyan-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-morph" style={{ animationDelay: '5s' }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          {/* Badges / Chips row */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            {badges.map((badge, idx) => {
              const BadgeIcon = badge.icon
              return (
                <motion.span
                  key={badge.label}
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}
                >
                  <BadgeIcon className="size-3" />
                  {badge.label}
                </motion.span>
              )
            })}
          </div>

          <span className="inline-block text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">
            Layanan
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text">
            Layanan Kami
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Pilih layanan peminjaman yang Anda butuhkan dan nikmati kemudahan prosesnya
          </p>
        </motion.div>

        {/* Main Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
          {/* Aula Service */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full card-3d card-shine glow-border bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-emerald-100 hover:border-emerald-300 transition-all duration-300 overflow-hidden group">
              <CardContent className="p-6 md:p-8 relative z-10">
                <div className="flex items-start gap-4 mb-6">
                  {/* Animated icon with rotating gradient background */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 animate-spin-slow opacity-30 blur-md" />
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200/50 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <Building2 className="size-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Peminjaman Aula</h3>
                    <p className="mt-2 text-gray-600 leading-relaxed">
                      Pinjam Aula BKAD untuk kegiatan pemerintah, organisasi, maupun keperluan umum dan komersil.
                      Fasilitas lengkap dengan sound system, videotron, AC, dan WiFi.
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Kapasitas hingga 500 orang
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    Fasilitas hybrid meeting
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    Jadwal siang dan malam
                  </li>
                </ul>
                <Button
                  onClick={() => setCurrentView('pinjam-aula')}
                  className="btn-modern bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white w-full sm:w-auto shadow-md shadow-emerald-200/50 hover:scale-105 transition-all duration-300"
                >
                  Mulai Sekarang
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Kendaraan Service */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full card-3d card-shine glow-border bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 border-teal-100 hover:border-teal-300 transition-all duration-300 overflow-hidden group">
              <CardContent className="p-6 md:p-8 relative z-10">
                <div className="flex items-start gap-4 mb-6">
                  {/* Animated icon with rotating gradient background */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-400 via-emerald-400 to-cyan-400 animate-spin-slow opacity-30 blur-md" />
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-200/50 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <Car className="size-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Peminjaman Kendaraan</h3>
                    <p className="mt-2 text-gray-600 leading-relaxed">
                      Pinjam kendaraan dinas berupa medium bus atau mini bus untuk keperluan pelajar maupun komersil.
                      Kendaraan terawat dengan sopir berpengalaman.
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    Medium Bus dan Mini Bus
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Sopir berpengalaman
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    Tarif pelajar dan komersil
                  </li>
                </ul>
                <Button
                  onClick={() => setCurrentView('pinjam-kendaraan')}
                  className="btn-modern bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white w-full sm:w-auto shadow-md shadow-teal-200/50 hover:scale-105 transition-all duration-300"
                >
                  Mulai Sekarang
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Feature Cards with staggered pop-in animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceCards.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={popInVariants}
              >
                <Card className="h-full text-center card-hover card-shine border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="pt-6 relative z-10">
                    {/* Animated icon with rotating gradient behind it */}
                    <div className="relative mx-auto mb-4">
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.bgColor} animate-spin-slow opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-500`} />
                      <div className={`relative mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                        <Icon className="size-6" />
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
