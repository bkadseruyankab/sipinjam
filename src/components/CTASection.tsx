'use client'

import { motion } from 'framer-motion'
import { Building2, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export default function CTASection() {
  const { setCurrentView } = useAppStore()

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-600 animate-gradient-flow" />

      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 dot-pattern opacity-40" />

      {/* Morphing Blob Backgrounds */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 bg-emerald-400/20 animate-morph blur-sm" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 bg-teal-400/20 animate-morph blur-sm" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/4 right-1/4 h-64 w-64 bg-cyan-400/15 animate-morph blur-sm" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-1/4 left-1/3 h-48 w-48 bg-emerald-300/10 animate-morph blur-sm" style={{ animationDelay: '6s' }} />
      </div>

      {/* Floating Organic Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-8 right-16 h-14 w-14 bg-white/8 animate-morph animate-float-slow" />
        <div className="absolute bottom-12 left-12 h-10 w-10 bg-white/6 animate-morph" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 right-1/3 h-8 w-8 bg-white/5 animate-morph animate-float-delayed" />
        <div className="absolute top-1/3 left-1/4 h-16 w-16 bg-white/4 animate-morph animate-float-slow" style={{ animationDelay: '5s' }} />
      </div>

      {/* Glassmorphism Center Card */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="glass-dark rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16 text-center max-w-3xl mx-auto"
        >
          {/* Decorative glow behind heading */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-400/20 blur-3xl rounded-full pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 relative">
              Butuh Aula atau Kendaraan?
            </h2>
            <p className="text-emerald-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
              Ajukan peminjaman sekarang dan nikmati proses yang cepat, mudah, dan transparan
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {/* Primary Button with Pulse Ring */}
            <div className="relative">
              {/* Pulsing ring behind the button */}
              <div className="absolute inset-0 rounded-lg bg-white/30 animate-pulse-ring pointer-events-none" />
              <Button
                size="lg"
                onClick={() => setCurrentView('pinjam-aula')}
                className="btn-modern relative bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-base px-8 h-12 shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:shadow-emerald-900/30 hover:scale-105 transition-all duration-300 rounded-lg"
              >
                <Building2 className="mr-2 size-5" />
                Pinjam Aula
              </Button>
            </div>

            {/* Secondary Button */}
            <Button
              size="lg"
              onClick={() => setCurrentView('pinjam-kendaraan')}
              className="btn-modern relative bg-white/10 text-white border border-white/25 hover:bg-white/20 backdrop-blur-sm font-semibold text-base px-8 h-12 hover:scale-105 transition-all duration-300 rounded-lg hover:border-white/40"
            >
              <Car className="mr-2 size-5" />
              Pinjam Kendaraan
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
