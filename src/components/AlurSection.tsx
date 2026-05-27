'use client'

import { motion } from 'framer-motion'
import {
  FileText,
  Upload,
  Clock,
  Bell,
  Car,
  ClipboardList,
  ShieldCheck,
  HandshakeIcon,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const aulaSteps = [
  {
    number: 1,
    icon: FileText,
    title: 'Isi Formulir',
    description: 'Lengkapi data peminjaman aula secara online',
  },
  {
    number: 2,
    icon: Upload,
    title: 'Upload Surat',
    description: 'Unggah surat permohonan resmi yang diperlukan',
  },
  {
    number: 3,
    icon: Clock,
    title: 'Menunggu Verifikasi',
    description: 'Admin akan memverifikasi kelengkapan dokumen',
  },
  {
    number: 4,
    icon: Bell,
    title: 'Notifikasi Status',
    description: 'Terima pemberitahuan status pengajuan via email',
  },
]

const kendaraanSteps = [
  {
    number: 1,
    icon: Car,
    title: 'Pilih Kendaraan',
    description: 'Pilih jenis kendaraan yang akan dipinjam',
  },
  {
    number: 2,
    icon: ClipboardList,
    title: 'Isi Data',
    description: 'Lengkapi data peminjaman dan tujuan',
  },
  {
    number: 3,
    icon: Upload,
    title: 'Upload Surat',
    description: 'Unggah surat permohonan resmi yang diperlukan',
  },
  {
    number: 4,
    icon: ShieldCheck,
    title: 'Verifikasi Admin',
    description: 'Admin memverifikasi kelengkapan persyaratan',
  },
  {
    number: 5,
    icon: HandshakeIcon,
    title: 'Serah Terima',
    description: 'Serah terima kendaraan dengan petugas',
  },
]

const stepColors = [
  'from-emerald-500 to-teal-500',
  'from-teal-500 to-cyan-500',
  'from-cyan-500 to-blue-500',
  'from-violet-500 to-purple-500',
  'from-amber-500 to-orange-500',
]

function StepCard({
  step,
  isLast,
  colorIndex,
  totalSteps,
}: {
  step: (typeof aulaSteps)[0] | (typeof kendaraanSteps)[0]
  isLast: boolean
  colorIndex: number
  totalSteps: number
}) {
  const Icon = step.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: colorIndex * 0.1 }}
      className="flex items-start gap-4 group"
    >
      {/* Step Number and Animated Connector Line */}
      <div className="flex flex-col items-center">
        <motion.div
          whileInView={{ scale: [1, 1.15, 1] }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: colorIndex * 0.1 + 0.2 }}
          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${stepColors[colorIndex % stepColors.length]} text-white font-bold text-sm shadow-lg transition-transform duration-300 group-hover:scale-110 animate-pulse-glow`}
        >
          {isLast ? (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: colorIndex * 0.1 + 0.5, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className="size-5" />
            </motion.div>
          ) : (
            step.number
          )}
        </motion.div>
        {!isLast && (
          <div className="relative w-0.5 h-16 mt-2 overflow-hidden">
            {/* Base line */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-300/30 to-transparent dark:from-emerald-600/20" />
            {/* Animated flowing gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-400/0"
              initial={{ y: '-100%' }}
              whileInView={{ y: '100%' }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 1.5, delay: colorIndex * 0.1 + 0.3, ease: 'easeInOut' }}
            />
            {/* Repeating flow animation */}
            <div
              className="absolute inset-0 animate-gradient-flow"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(16, 185, 129, 0.5) 30%, rgba(6, 182, 212, 0.5) 60%, transparent 100%)',
                backgroundSize: '100% 200%',
              }}
            />
          </div>
        )}
      </div>

      {/* Step Content */}
      <div className="pb-6">
        <div className="flex items-center gap-2 mb-1">
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Icon className="size-4 text-emerald-600 dark:text-emerald-400 transition-colors duration-300 group-hover:text-teal-500" />
          </motion.div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
            {step.title}
          </h4>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
      </div>
    </motion.div>
  )
}

export default function AlurSection() {
  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-emerald-50/30 to-white dark:from-gray-900/20 dark:to-gray-950 overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 grid-pattern" />

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
            Prosedur
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text">
            Alur Peminjaman
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Langkah-langkah mudah untuk mengajukan peminjaman aula dan kendaraan
          </p>
        </motion.div>

        {/* Flow Diagrams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Alur Aula */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="card-hover card-shine h-full border-emerald-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
                    <FileText className="size-4" />
                  </div>
                  Alur Peminjaman Aula
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-2">
                  {aulaSteps.map((step, i) => (
                    <StepCard
                      key={step.title}
                      step={step}
                      isLast={i === aulaSteps.length - 1}
                      colorIndex={i}
                      totalSteps={aulaSteps.length}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Alur Kendaraan */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="card-hover card-shine h-full border-teal-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-teal-700 dark:text-teal-400 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-sm">
                    <Car className="size-4" />
                  </div>
                  Alur Peminjaman Kendaraan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-2">
                  {kendaraanSteps.map((step, i) => (
                    <StepCard
                      key={step.title}
                      step={step}
                      isLast={i === kendaraanSteps.length - 1}
                      colorIndex={i}
                      totalSteps={kendaraanSteps.length}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
