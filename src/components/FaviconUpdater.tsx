'use client'

import { useEffect } from 'react'

/**
 * Dynamically updates the favicon based on settings.
 * This runs on the client side after mount.
 */
export default function FaviconUpdater() {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        const res = await fetch('/api/settings?key=site_favicon')
        if (res.ok) {
          const data = await res.json()
          if (data.setting?.value) {
            // Find existing favicon link or create one
            let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
            if (!link) {
              link = document.createElement('link')
              link.rel = 'icon'
              document.head.appendChild(link)
            }
            link.href = data.setting.value
            link.type = 'image/png' // Default, browser will figure it out
          }
        }
      } catch {
        // Ignore errors
      }
    }
    updateFavicon()
  }, [])

  return null
}
