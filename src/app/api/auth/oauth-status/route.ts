import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/auth/oauth-status
 * Checks if Google OAuth is configured and enabled.
 * Reads from DB settings first, falls back to env vars.
 */
export async function GET() {
  try {
    const keys = ['google_client_id', 'google_client_secret', 'google_oauth_enabled']
    const settings = await db.settings.findMany({
      where: { key: { in: keys } },
    })
    const map: Record<string, string> = {}
    for (const s of settings) {
      map[s.key] = s.value
    }

    const enabled = map.google_oauth_enabled === 'true'
    const hasClientId = !!(map.google_client_id || process.env.GOOGLE_CLIENT_ID)
    const hasClientSecret = !!(map.google_client_secret || process.env.GOOGLE_CLIENT_SECRET)

    return NextResponse.json({
      configured: enabled && hasClientId && hasClientSecret,
      enabled: enabled,
    })
  } catch {
    // Fallback to env vars
    return NextResponse.json({
      configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    })
  }
}
