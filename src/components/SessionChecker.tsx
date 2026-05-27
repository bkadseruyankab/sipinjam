'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

/**
 * Checks the auth cookie on page load to restore session.
 * First restores user from localStorage for instant UI, then verifies against the server.
 * This runs inside useEffect to avoid hydration mismatches.
 */
export default function SessionChecker() {
  const setUser = useAppStore((s) => s.setUser)
  const sessionChecked = useAppStore((s) => s.sessionChecked)
  const setSessionChecked = useAppStore((s) => s.setSessionChecked)

  useEffect(() => {
    if (sessionChecked) return

    // First, restore user from localStorage for instant UI
    try {
      const stored = localStorage.getItem('epakar-user')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.id && parsed.email) {
          setUser(parsed)
        }
      }
    } catch {
      // Ignore parse errors
    }

    // Then verify with the server
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
          } else {
            setUser(null)
          }
        } else {
          // Cookie is invalid or expired
          setUser(null)
        }
      } catch {
        // Network error — keep the localStorage user if any (already set above)
      } finally {
        setSessionChecked(true)
      }
    }

    checkSession()
  }, [sessionChecked, setUser, setSessionChecked])

  return null
}
