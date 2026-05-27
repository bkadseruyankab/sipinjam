'use client'

import { useEffect } from 'react'

export default function PWARegistration() {
  useEffect(() => {
    // Only register in production (HTTPS or localhost)
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    // Skip in development to avoid caching dev assets
    const isDev = window.location.protocol === 'http:' && window.location.hostname !== 'localhost'
    if (isDev) return

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        // Check for updates periodically (every 30 minutes)
        const updateInterval = setInterval(() => {
          registration.update()
        }, 30 * 60 * 1000)

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available, notify the user
                console.log('[PWA] New content available, please refresh.')

                // Optionally show a toast or notification
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('E-Pakar Update', {
                    body: 'Versi baru tersedia! Refresh halaman untuk memperbarui.',
                    icon: '/icons/icon-192.svg',
                    badge: '/icons/icon-192.svg',
                  })
                }
              } else {
                // Content is cached for offline use
                console.log('[PWA] Content is cached for offline use.')
              }
            }
          })
        })

        // Listen for controlling service worker change (after skipWaiting)
        let refreshing = false
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true
            window.location.reload()
          }
        })

        // Cleanup on unmount
        return () => clearInterval(updateInterval)
      } catch (error) {
        console.error('[PWA] Service worker registration failed:', error)
      }
    }

    registerSW()
  }, [])

  // This component doesn't render anything visible
  return null
}
