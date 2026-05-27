'use client'

import { useEffect } from 'react'
import { useIdentity } from '@/hooks/useIdentity'

export default function DynamicTitle() {
  const { identity } = useIdentity()

  useEffect(() => {
    const siteName = identity.site_name || 'E-Pakar'
    const tagline = identity.site_tagline || 'Sistem Peminjaman Aula & Kendaraan'
    document.title = `${siteName} - ${tagline}`
  }, [identity.site_name, identity.site_tagline])

  return null
}
