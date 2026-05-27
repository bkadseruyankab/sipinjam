'use client'

import { Building2, Car, CalendarDays, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube, ExternalLink } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useIdentity } from '@/hooks/useIdentity'
import Image from 'next/image'

export default function Footer() {
  const { setCurrentView } = useAppStore()
  const { identity } = useIdentity()

  const siteName = identity.site_name || 'E-Pakar'
  const siteLogo = identity.site_logo || ''
  const footerDescription = identity.footer_description || 'Sistem Peminjaman Elektronik Aula dan Kendaraan Roda 4 dan 6. Platform resmi untuk pengajuan peminjaman secara online yang efisien, transparan, dan mudah diakses.'
  const layananTitle = identity.footer_layanan_title || 'Layanan'
  const kontakTitle = identity.footer_kontak_title || 'Kontak Kami'
  const siteAddress = identity.site_address || 'Jl. Merdeka No. 1, Kelurahan Sukajadi,\nKecamatan Bandung Wetan,\nKota Bandung, Jawa Barat 40116'
  const sitePhone = identity.site_phone || '(022) 4235050'
  const siteEmail = identity.site_email || 'epakar@bandung.go.id'
  const copyright = identity.site_copyright || '© 2025 E-Pakar. Hak Cipta Dilindungi.'

  const initials = siteName ? siteName.charAt(0).toUpperCase() : 'E'

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#', hoverColor: 'hover:text-blue-400' },
    { icon: Instagram, label: 'Instagram', href: '#', hoverColor: 'hover:text-pink-400' },
    { icon: Twitter, label: 'Twitter', href: '#', hoverColor: 'hover:text-sky-400' },
    { icon: Youtube, label: 'Youtube', href: '#', hoverColor: 'hover:text-red-400' },
  ]

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-gray-300 overflow-hidden">
      {/* Modern wave SVG at top */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none -translate-y-[1px]">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V0H0V40Z"
            className="fill-gray-900"
          />
          <path
            d="M0 50C240 85 480 10 720 50C960 90 1200 10 1440 50V0H0V50Z"
            className="fill-gray-900/60"
          />
          <path
            d="M0 40C360 80 720 0 1080 40C1260 60 1350 50 1440 40V0H0V40Z"
            fill="url(#wave-gradient)"
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#0d9488" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern pointer-events-none opacity-40" />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[10%] w-2 h-2 bg-emerald-400/20 rounded-full animate-float" />
        <div className="absolute top-32 right-[15%] w-1.5 h-1.5 bg-teal-400/25 rounded-full animate-float-delayed" />
        <div className="absolute bottom-40 left-[20%] w-1 h-1 bg-cyan-400/20 rounded-full animate-float-slow" />
        <div className="absolute top-16 right-[40%] w-2.5 h-2.5 bg-emerald-400/15 rounded-full animate-float-slow" />
        <div className="absolute bottom-24 right-[8%] w-1.5 h-1.5 bg-teal-400/20 rounded-full animate-float" />
        <div className="absolute top-44 left-[45%] w-1 h-1 bg-emerald-300/20 rounded-full animate-float-delayed" />
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-8 md:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Column 1: Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {siteLogo ? (
                <Image
                  src={siteLogo}
                  alt={`${siteName} Logo`}
                  width={36}
                  height={36}
                  className="rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30">
                  {initials}
                </div>
              )}
              <span className="text-xl font-bold gradient-text">{siteName}</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              {footerDescription}
            </p>

            {/* Sistem Aktif indicator with pulse ring */}
            <div className="mt-4 flex items-center gap-2.5 text-xs text-gray-500">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 font-semibold tracking-wide">Sistem Aktif</span>
            </div>

            {/* Social Media Icons */}
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((social) => {
                const SocialIcon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className={`group relative flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800/50 border border-gray-700/40 text-gray-400 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 ${social.hoverColor} hover:border-gray-600/60 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-emerald-900/10`}
                  >
                    <SocialIcon className="size-4 transition-transform duration-300 group-hover:scale-110" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Column 2: Layanan Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
              {layananTitle}
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCurrentView('pinjam-aula')}
                  className="group flex items-center gap-2.5 text-sm text-gray-400 hover:text-emerald-400 transition-all duration-300 hover:translate-x-1.5 py-1"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500/70 transition-all duration-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 group-hover:shadow-md group-hover:shadow-emerald-500/10">
                    <Building2 className="size-3.5" />
                  </span>
                  <span>Peminjaman Aula</span>
                  <ExternalLink className="size-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-50 group-hover:translate-x-0" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('pinjam-kendaraan')}
                  className="group flex items-center gap-2.5 text-sm text-gray-400 hover:text-teal-400 transition-all duration-300 hover:translate-x-1.5 py-1"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-500/10 text-teal-500/70 transition-all duration-300 group-hover:bg-teal-500/20 group-hover:text-teal-400 group-hover:shadow-md group-hover:shadow-teal-500/10">
                    <Car className="size-3.5" />
                  </span>
                  <span>Peminjaman Kendaraan</span>
                  <ExternalLink className="size-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-50 group-hover:translate-x-0" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('kalender-aula')}
                  className="group flex items-center gap-2.5 text-sm text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1.5 py-1"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-500/70 transition-all duration-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 group-hover:shadow-md group-hover:shadow-cyan-500/10">
                    <CalendarDays className="size-3.5" />
                  </span>
                  <span>Kalender Jadwal</span>
                  <ExternalLink className="size-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-50 group-hover:translate-x-0" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Kontak */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-teal-500 to-cyan-500" />
              {kontakTitle}
            </h3>
            <ul className="space-y-3">
              <li className="group flex items-start gap-2.5 text-sm text-gray-400 transition-colors duration-300 hover:text-gray-300">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500/10 text-rose-400/70 transition-all duration-300 group-hover:bg-rose-500/20 group-hover:text-rose-400 mt-0.5 shrink-0">
                  <MapPin className="size-3.5" />
                </span>
                <span style={{ whiteSpace: 'pre-line' }} className="transition-colors duration-300 group-hover:text-gray-300">
                  {siteAddress}
                </span>
              </li>
              <li className="group flex items-center gap-2.5 text-sm text-gray-400 transition-colors duration-300 hover:text-gray-300">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-400/70 transition-all duration-300 group-hover:bg-amber-500/20 group-hover:text-amber-400 shrink-0">
                  <Phone className="size-3.5" />
                </span>
                <span className="transition-colors duration-300 group-hover:text-gray-300">{sitePhone}</span>
              </li>
              <li className="group flex items-center gap-2.5 text-sm text-gray-400 transition-colors duration-300 hover:text-gray-300">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-400/70 transition-all duration-300 group-hover:bg-purple-500/20 group-hover:text-purple-400 shrink-0">
                  <Mail className="size-3.5" />
                </span>
                <span className="transition-colors duration-300 group-hover:text-gray-300">{siteEmail}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-center sm:text-left text-xs text-gray-500">
            {copyright}
          </p>
          <p className="text-xs text-gray-600">
            Dibuat dengan <span className="text-emerald-500">&#9829;</span> untuk masyarakat
          </p>
        </div>
      </div>
    </footer>
  )
}
