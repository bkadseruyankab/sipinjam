import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // Try to fetch site settings from DB for dynamic manifest
  let siteName = 'E-Pakar'
  let siteDescription = 'Sistem Peminjaman Elektronik Aula dan Kendaraan Roda 4 dan 6 - BKAD Kabupaten Seruyan'
  let siteLogo = ''

  try {
    const settings = await db.settings.findMany({
      where: {
        key: {
          in: ['site_name', 'site_description', 'site_logo'],
        },
      },
    })

    for (const setting of settings) {
      if (setting.key === 'site_name' && setting.value) {
        siteName = setting.value
      }
      if (setting.key === 'site_description' && setting.value) {
        siteDescription = setting.value
      }
      if (setting.key === 'site_logo' && setting.value) {
        siteLogo = setting.value
      }
    }
  } catch {
    // Fall back to defaults if DB is not available
  }

  // Build icons array - use site logo if available, otherwise use default icons
  const icons: MetadataRoute.Manifest['icons'] = [
    {
      src: '/icons/icon-192.svg',
      sizes: '192x192',
      type: 'image/svg+xml',
      purpose: 'any',
    },
    {
      src: '/icons/icon-512.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'any',
    },
    {
      src: '/icons/icon-192.svg',
      sizes: '192x192',
      type: 'image/svg+xml',
      purpose: 'maskable',
    },
    {
      src: '/icons/icon-512.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'maskable',
    },
  ]

  // If there's a custom site logo, add it as an additional icon option
  if (siteLogo) {
    icons.unshift({
      src: siteLogo.startsWith('/') ? siteLogo : `/${siteLogo}`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    })
  }

  return {
    name: `${siteName} - Sistem Peminjaman Aula & Kendaraan`,
    short_name: siteName,
    description: siteDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#059669',
    orientation: 'portrait-primary',
    icons,
    categories: ['business', 'government'],
    lang: 'id',
    dir: 'ltr',
  }
}
