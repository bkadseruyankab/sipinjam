'use client'

import { useState, useEffect } from 'react'

export interface SiteIdentity {
  site_name: string
  site_tagline: string
  site_description: string
  site_address: string
  site_phone: string
  site_email: string
  site_copyright: string
  hero_title: string
  hero_subtitle: string
  hero_badge_text: string
  hero_cta_aula: string
  hero_cta_kendaraan: string
  footer_description: string
  footer_layanan_title: string
  footer_kontak_title: string
  site_logo: string
}

const defaultIdentity: SiteIdentity = {
  site_name: 'E-Pakar',
  site_tagline: 'Sistem Peminjaman Elektronik Aula dan Kendaraan Roda 4 dan 6',
  site_description: 'Sistem peminjaman yang efisien, transparan, dan mudah diakses. Ajukan peminjaman aula dan kendaraan secara online dengan proses yang cepat dan terintegrasi.',
  site_address: 'Jl. Merdeka No. 1, Kelurahan Sukajadi,\nKecamatan Bandung Wetan,\nKota Bandung, Jawa Barat 40116',
  site_phone: '(022) 4235050',
  site_email: 'epakar@bandung.go.id',
  site_copyright: '© 2025 E-Pakar. Hak Cipta Dilindungi.',
  hero_title: 'Aplikasi Elektronik Peminjaman Aula dan Kendaraan Roda 4 dan 6',
  hero_subtitle: 'Sistem peminjaman yang efisien, transparan, dan mudah diakses. Ajukan peminjaman aula dan kendaraan secara online dengan proses yang cepat dan terintegrasi.',
  hero_badge_text: 'Sistem Peminjaman Online',
  hero_cta_aula: 'Pinjam Aula',
  hero_cta_kendaraan: 'Pinjam Kendaraan',
  footer_description: 'Sistem Peminjaman Elektronik Aula dan Kendaraan Roda 4 dan 6. Platform resmi untuk pengajuan peminjaman secara online yang efisien, transparan, dan mudah diakses.',
  footer_layanan_title: 'Layanan',
  footer_kontak_title: 'Kontak Kami',
  site_logo: '',
}

// Cache identity settings in memory to avoid repeated API calls
let cachedIdentity: SiteIdentity | null = null
let fetchPromise: Promise<SiteIdentity> | null = null

async function fetchIdentity(): Promise<SiteIdentity> {
  if (cachedIdentity) return cachedIdentity
  if (fetchPromise) return fetchPromise

  fetchPromise = (async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        const settings = data.settings || {}
        const identity: SiteIdentity = { ...defaultIdentity }
        for (const key of Object.keys(defaultIdentity) as (keyof SiteIdentity)[]) {
          if (settings[key]) {
            (identity as Record<string, string>)[key] = settings[key]
          }
        }
        cachedIdentity = identity
        return identity
      }
    } catch {
      // Fall back to defaults
    }
    cachedIdentity = defaultIdentity
    return defaultIdentity
  })()

  return fetchPromise
}

// Invalidate cache when settings are saved
export function invalidateIdentityCache() {
  cachedIdentity = null
  fetchPromise = null
}

export function useIdentity() {
  const [identity, setIdentity] = useState<SiteIdentity>(defaultIdentity)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIdentity().then((data) => {
      setIdentity(data)
      setLoading(false)
    })
  }, [])

  return { identity, loading }
}
