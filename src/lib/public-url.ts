import { NextRequest } from 'next/server'

/**
 * Determine the public base URL for redirect responses.
 *
 * When running behind a reverse proxy (Caddy), `request.url` contains the
 * internal URL (e.g. `http://0.0.0.0:3006/...`) which is unreachable from
 * the browser.  This helper resolves the correct public origin using the
 * same priority list as the `redirect_uri` calculation:
 *
 *   1. `site_url` from DB settings (highest priority)
 *   2. `X-Forwarded-Host` + `X-Forwarded-Proto` headers from the proxy
 *   3. `Host` header if it is a public (non-internal) domain
 *   4. Fall back to `request.url` origin as last resort
 */
export function getPublicBaseUrl(request: NextRequest, siteUrl?: string): string {
  // 1. DB setting takes precedence
  if (siteUrl) {
    return siteUrl.replace(/\/+$/, '')
  }

  // 2 & 3. Try reverse-proxy / Host headers
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const forwardedHost = request.headers.get('x-forwarded-host')
  const hostHeader = request.headers.get('host')
  const effectiveHost = forwardedHost || hostHeader || ''
  const isInternalHost =
    !effectiveHost ||
    effectiveHost.startsWith('localhost') ||
    effectiveHost.startsWith('127.') ||
    effectiveHost.startsWith('10.') ||
    effectiveHost.startsWith('192.168.') ||
    effectiveHost.startsWith('0.0.0.0') ||
    effectiveHost.startsWith('0.')

  if (!isInternalHost) {
    return `${forwardedProto}://${effectiveHost}`
  }

  // 4. Last resort — may still be internal but we have nothing better
  return new URL(request.url).origin
}
