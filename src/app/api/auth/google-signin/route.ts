import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPublicBaseUrl } from '@/lib/public-url'

/**
 * GET /api/auth/google-signin
 * Dynamically initiates Google OAuth flow using credentials from DB settings.
 * This bypasses the static NextAuth GoogleProvider limitation by constructing
 * the Google OAuth URL directly.
 */
export async function GET(request: NextRequest) {
  try {
    // Read OAuth credentials from DB
    const keys = ['google_client_id', 'google_client_secret', 'google_oauth_enabled', 'nextauth_secret', 'site_url']
    const settings = await db.settings.findMany({
      where: { key: { in: keys } },
    })
    const map: Record<string, string> = {}
    for (const s of settings) {
      map[s.key] = s.value
    }

    const clientId = map.google_client_id || process.env.GOOGLE_CLIENT_ID || ''
    const enabled = map.google_oauth_enabled === 'true' || (!map.google_oauth_enabled && !!process.env.GOOGLE_CLIENT_ID)

    // Determine the base URL using the shared helper (includes site_url from DB)
    const baseUrl = getPublicBaseUrl(request, map.site_url)

    if (!enabled) {
      return NextResponse.redirect(new URL('/?error=google_oauth_disabled', baseUrl))
    }

    if (!clientId) {
      return NextResponse.redirect(new URL('/?error=google_oauth_not_configured', baseUrl))
    }

    // If site_url is not set and we couldn't determine a public URL from headers,
    // the OAuth redirect_uri would be invalid — inform the user
    const requestOrigin = new URL(request.url).origin
    if (baseUrl === requestOrigin) {
      // baseUrl fell back to request.url origin, which may be internal
      const hostHeader = request.headers.get('host') || ''
      const isInternal =
        !hostHeader ||
        hostHeader.startsWith('localhost') ||
        hostHeader.startsWith('127.') ||
        hostHeader.startsWith('10.') ||
        hostHeader.startsWith('192.168.') ||
        hostHeader.startsWith('0.')

      if (isInternal) {
        console.error('Google OAuth: site_url is not configured and cannot determine public URL from headers. Host:', hostHeader)
        return NextResponse.redirect(new URL('/?error=google_oauth_no_public_url', baseUrl))
      }
    }

    const redirectUri = `${baseUrl}/api/auth/google-callback-v2`

    // Generate a random state for CSRF protection
    const state = Buffer.from(
      `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    ).toString('base64url')

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    googleAuthUrl.searchParams.set('client_id', clientId)
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
    googleAuthUrl.searchParams.set('response_type', 'code')
    googleAuthUrl.searchParams.set('scope', 'openid email profile')
    googleAuthUrl.searchParams.set('state', state)
    googleAuthUrl.searchParams.set('access_type', 'offline')
    googleAuthUrl.searchParams.set('prompt', 'consent')

    console.log('Google OAuth: redirect_uri =', redirectUri)

    // Store state in a short-lived cookie for CSRF verification
    const response = NextResponse.redirect(googleAuthUrl)
    response.cookies.set('google-oauth-state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Google sign-in initiation error:', error)
    // Best-effort: compute baseUrl from headers alone (no DB access in catch)
    const baseUrl = getPublicBaseUrl(request)
    return NextResponse.redirect(new URL('/?error=google_oauth_error', baseUrl))
  }
}
