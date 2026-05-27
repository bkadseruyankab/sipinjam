import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateToken } from '@/lib/auth'
import { getPublicBaseUrl } from '@/lib/public-url'

/**
 * GET /api/auth/google-callback-v2
 * Handles the Google OAuth callback by exchanging the authorization code
 * for an access token, fetching user info, creating/updating the user in DB,
 * and setting the epakar-token cookie.
 */
export async function GET(request: NextRequest) {
  // Compute public base URL from headers for early error redirects
  const baseUrl = getPublicBaseUrl(request)

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle OAuth errors from Google
  if (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(new URL('/?error=google', baseUrl))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=google_no_code', baseUrl))
  }

  // Verify CSRF state
  const storedState = request.cookies.get('google-oauth-state')?.value
  if (!storedState || storedState !== state) {
    console.error('Google OAuth state mismatch')
    return NextResponse.redirect(new URL('/?error=google_state_mismatch', baseUrl))
  }

  try {
    // Read OAuth credentials from DB
    const keys = ['google_client_id', 'google_client_secret', 'site_url']
    const settings = await db.settings.findMany({
      where: { key: { in: keys } },
    })
    const map: Record<string, string> = {}
    for (const s of settings) {
      map[s.key] = s.value
    }

    const clientId = map.google_client_id || process.env.GOOGLE_CLIENT_ID || ''
    const clientSecret = map.google_client_secret || process.env.GOOGLE_CLIENT_SECRET || ''

    // Determine the base URL using the shared helper (includes site_url from DB)
    const redirectBaseUrl = getPublicBaseUrl(request, map.site_url)

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/?error=google_oauth_not_configured', redirectBaseUrl))
    }

    const redirectUri = `${redirectBaseUrl}/api/auth/google-callback-v2`

    console.log('Google OAuth callback: redirect_uri =', redirectUri)

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text()
      console.error('Token exchange failed:', errBody)
      return NextResponse.redirect(new URL('/?error=google_token_exchange', redirectBaseUrl))
    }

    const tokenData = await tokenResponse.json()
    const { id_token } = tokenData

    if (!id_token) {
      return NextResponse.redirect(new URL('/?error=google_no_id_token', redirectBaseUrl))
    }

    // Decode the ID token (JWT) to get user info
    // We decode the payload part of the JWT without full verification
    // (In production, you'd verify the signature with Google's public keys)
    const payloadB64 = id_token.split('.')[1]
    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64').toString('utf-8')
    )

    const email = payload.email as string
    const name = (payload.name as string) || 'Pengguna Google'

    if (!email) {
      return NextResponse.redirect(new URL('/?error=google_no_email', redirectBaseUrl))
    }

    // Find or create user in our DB
    let user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name,
          password: 'google_oauth_' + Date.now(), // placeholder password
          role: 'user',
          phone: null,
          instansi: null,
        },
      })
    }

    // Generate our custom token
    const token = generateToken(user.id, user.email)

    // Redirect to home with the cookie set
    const response = NextResponse.redirect(new URL('/', redirectBaseUrl))

    response.cookies.set('epakar-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // Clear the state cookie
    response.cookies.set('google-oauth-state', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Google callback v2 error:', error)
    return NextResponse.redirect(new URL('/?error=google', baseUrl))
  }
}
