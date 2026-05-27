'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import { Building2, Car, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { useIdentity } from '@/hooks/useIdentity'

/* ─── useCountUp hook ─── */
function useCountUp(target: number, duration = 2000, startOnView = true) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [count, setCount] = useState(0)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (startOnView && !isInView) return
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    let startTime: number | null = null
    let rafId: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      }
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration, isInView, startOnView])

  return { ref, count }
}

/* ─── Floating Particles ─── */
function FloatingParticles() {
  const particles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.1,
    }))
  ).current

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-emerald-300"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            bottom: '-5%',
          }}
          animate={{
            y: [0, -1200],
            opacity: [p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

/* ─── Stat Item ─── */
function StatItem({
  endValue,
  suffix,
  label,
  colorClass,
  delay,
  isText = false,
}: {
  endValue: number
  suffix: string
  label: string
  colorClass: string
  delay: number
  isText?: boolean
}) {
  const { ref, count } = useCountUp(endValue, 2000)

  if (isText) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay, type: 'spring', stiffness: 120 }}
      >
        <p className={`text-2xl sm:text-3xl font-bold ${colorClass}`}>{suffix}</p>
        <p className="text-sm text-emerald-200/80 mt-1">{label}</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <p className={`text-2xl sm:text-3xl font-bold ${colorClass}`}>
        <span ref={ref}>{count}</span>
        {suffix}
      </p>
      <p className="text-sm text-emerald-200/80 mt-1">{label}</p>
    </motion.div>
  )
}

/* ─── Main Component ─── */
export default function HeroSection() {
  const { setCurrentView } = useAppStore()
  const { identity } = useIdentity()

  const siteName = identity.site_name || 'E-Pakar'
  const heroTitle = identity.hero_title || 'Aplikasi Elektronik Peminjaman Aula dan Kendaraan Roda 4 dan 6'
  const heroSubtitle = identity.hero_subtitle || 'Sistem peminjaman yang efisien, transparan, dan mudah diakses. Ajukan peminjaman aula dan kendaraan secara online dengan proses yang cepat dan terintegrasi.'
  const heroBadgeText = identity.hero_badge_text || 'Sistem Peminjaman Online'
  const heroCtaAula = identity.hero_cta_aula || 'Pinjam Aula'
  const heroCtaKendaraan = identity.hero_cta_kendaraan || 'Pinjam Kendaraan'

  // We still need hero_image from settings - use a local fetch
  const [bgImageUrl, setBgImageUrl] = useState('')

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const res = await fetch('/api/settings?key=hero_image')
        if (res.ok) {
          const data = await res.json()
          if (data.setting?.value) {
            setBgImageUrl(data.setting.value)
          }
        }
      } catch {
        // Use default
      }
    }
    fetchHeroImage()
  }, [])

  const bgImage = bgImageUrl || '/images/hero-aula.png'

  // Parse hero title to highlight key phrases with gradient
  const renderTitle = () => {
    const parts = heroTitle.split(/(Peminjaman Aula|Kendaraan[^ ]*(?:\s+\S+)?)/i)
    if (parts.length > 1) {
      return parts.map((part, i) => {
        if (/Peminjaman Aula/i.test(part)) {
          return <span key={i} className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">{part}</span>
        }
        if (/Kendaraan/i.test(part)) {
          return <span key={i} className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">{part}</span>
        }
        return <span key={i}>{part}</span>
      })
    }
    return <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">{heroTitle}</span>
  }

  // Scroll to next section
  const scrollToContent = useCallback(() => {
    const hero = document.getElementById('hero-section')
    if (hero) {
      const nextEl = hero.nextElementSibling
      if (nextEl) {
        nextEl.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [])

  return (
    <section id="hero-section" className="relative min-h-screen flex items-center overflow-hidden">
      {/* ── Background Image ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />

      {/* ── Modern Gradient Overlay (deep emerald → teal-cyan) ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/95 via-emerald-900/90 to-teal-700/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-teal-800/20" />

      {/* ── Animated Gradient Mesh / Morphing Blobs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary morphing blob */}
        <div
          className="absolute -top-32 -right-32 h-[500px] w-[500px] animate-morph bg-gradient-to-br from-emerald-500/20 to-teal-400/15 blur-3xl"
        />
        {/* Secondary morphing blob */}
        <div
          className="absolute -bottom-40 -left-32 h-[600px] w-[600px] animate-morph bg-gradient-to-tr from-teal-500/15 to-cyan-400/10 blur-3xl"
          style={{ animationDelay: '-4s' }}
        />
        {/* Tertiary accent blob */}
        <div
          className="absolute top-1/3 right-1/4 h-[400px] w-[400px] animate-morph bg-gradient-to-bl from-emerald-400/10 via-teal-300/8 to-cyan-300/5 blur-2xl"
          style={{ animationDelay: '-2s' }}
        />
        {/* Small floating accent blob */}
        <div
          className="absolute bottom-1/4 left-1/3 h-[250px] w-[250px] animate-morph bg-gradient-to-br from-cyan-400/10 to-emerald-300/8 blur-2xl"
          style={{ animationDelay: '-6s' }}
        />
      </div>

      {/* ── Dot Pattern Overlay ── */}
      <div className="absolute inset-0 dot-pattern opacity-60 pointer-events-none" />

      {/* ── Floating Particles ── */}
      <FloatingParticles />

      {/* ── Subtle horizontal light streaks ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute h-[1px] w-[60%] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"
          style={{ top: '25%', left: '-10%' }}
          animate={{ x: ['0%', '120%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear', delay: 2 }}
        />
        <motion.div
          className="absolute h-[1px] w-[40%] bg-gradient-to-r from-transparent via-teal-300/15 to-transparent"
          style={{ top: '60%', left: '-10%' }}
          animate={{ x: ['0%', '130%'] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear', delay: 6 }}
        />
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 w-full">
        <div className="max-w-3xl">
          {/* ── Glassmorphism Content Card ── */}
          <div className="glass-dark rounded-2xl p-6 sm:p-8 md:p-10 card-shine">
            {/* ── Enhanced Badge ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="relative inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-5 py-2 text-sm font-medium text-emerald-100 border border-emerald-400/25 backdrop-blur-md overflow-hidden group">
                {/* Animated border gradient sweep */}
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/0 via-teal-400/30 to-emerald-400/0 animate-gradient-x bg-[length:200%_100%]" />
                <span className="relative flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                  {heroBadgeText}
                </span>
              </span>
            </motion.div>

            {/* ── Title ── */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white"
            >
              {renderTitle()}
            </motion.h1>

            {/* ── Subtitle ── */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 text-lg sm:text-xl text-emerald-100/90 max-w-2xl leading-relaxed"
            >
              {heroSubtitle}
            </motion.p>

            {/* ── CTA Buttons ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                onClick={() => setCurrentView('pinjam-aula')}
                className="btn-modern bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-base px-8 h-12 shadow-lg shadow-emerald-900/20 animate-float-slow hover:scale-105 transition-all duration-300 group"
              >
                {/* Shimmer sweep overlay */}
                <span className="absolute inset-0 overflow-hidden rounded-md">
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </span>
                <Building2 className="mr-2 size-5 relative z-10" />
                <span className="relative z-10">{heroCtaAula}</span>
              </Button>
              <Button
                size="lg"
                onClick={() => setCurrentView('pinjam-kendaraan')}
                className="btn-modern bg-emerald-500/20 text-white border border-emerald-400/40 hover:bg-emerald-500/30 backdrop-blur-sm font-semibold text-base px-8 h-12 animate-float-slow hover:scale-105 transition-all duration-300 group"
                style={{ animationDelay: '1.5s' }}
              >
                {/* Shimmer sweep overlay */}
                <span className="absolute inset-0 overflow-hidden rounded-md">
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-emerald-300/20 to-transparent" />
                </span>
                <Car className="mr-2 size-5 relative z-10" />
                <span className="relative z-10">{heroCtaKendaraan}</span>
              </Button>
            </motion.div>

            {/* ── Stats with Counter Animation ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 pt-8 border-t border-emerald-400/15 flex gap-8 sm:gap-12"
            >
              <StatItem
                endValue={500}
                suffix="+"
                label="Peminjaman/Bulan"
                colorClass="text-emerald-300"
                delay={0.7}
              />
              <StatItem
                endValue={98}
                suffix="%"
                label="Kepuasan Pengguna"
                colorClass="text-teal-300"
                delay={0.85}
              />
              <StatItem
                endValue={0}
                suffix="24 Jam"
                label="Proses Verifikasi"
                colorClass="text-cyan-300"
                delay={1.0}
                isText
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Scroll Down Indicator ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer group"
        onClick={scrollToContent}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-emerald-200/60 text-xs font-medium tracking-widest uppercase group-hover:text-emerald-200/90 transition-colors">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="size-5 text-emerald-300/50 group-hover:text-emerald-300/80 transition-colors" />
        </motion.div>
      </motion.div>
    </section>
  )
}
