# Task 1: Fix Google OAuth Callback Redirect to Use Correct Public URL

## Summary
Fixed the Google OAuth callback redirect issue where successful/failed logins redirected to the internal URL `https://0.0.0.0:3006/` instead of the correct public URL. Created a shared helper function and applied it consistently across all three affected files.

## Root Cause
All three OAuth route files used `new URL('/', request.url)` for redirects. Behind the Caddy reverse proxy, `request.url` contains the internal server URL (`http://0.0.0.0:3006/...`), making `new URL('/', request.url)` produce an unreachable URL like `http://0.0.0.0:3006/`.

## Changes Made

### 1. New File: `src/lib/public-url.ts`
Created a shared helper function `getPublicBaseUrl(request, siteUrl?)` that determines the correct public base URL using the same priority logic as the existing `redirect_uri` calculation:
1. **`site_url` from DB settings** (highest priority)
2. **`X-Forwarded-Host` + `X-Forwarded-Proto` headers** from Caddy reverse proxy
3. **`Host` header** if it's a public (non-internal) domain
4. **Fall back to `request.url` origin** as last resort

Also added detection for `0.0.0.0` and `0.` prefixed hosts as internal.

### 2. Fixed: `src/app/api/auth/google-callback-v2/route.ts`
- Added `const baseUrl = getPublicBaseUrl(request)` at the top of the handler for early error redirects (before DB read)
- Replaced the manual baseUrl computation (lines 49-67) with `const redirectBaseUrl = getPublicBaseUrl(request, map.site_url)`
- Replaced ALL 8 instances of `new URL('/...', request.url)` with the appropriate `baseUrl` or `redirectBaseUrl`
- Catch block uses the outer `baseUrl` (header-based, no DB dependency)

### 3. Fixed: `src/app/api/auth/google-callback/route.ts`
- Added `const baseUrl = getPublicBaseUrl(request)` at the top of the handler
- Replaced all 3 instances of `new URL('/', request.url)` with `new URL('/', baseUrl)`

### 4. Fixed: `src/app/api/auth/google-signin/route.ts`
- Added `const baseUrl = getPublicBaseUrl(request, map.site_url)` after the DB read
- Replaced all error redirects to use `baseUrl` instead of `request.url`
- Preserved the strict public URL check for the redirect_uri (if no site_url and host is internal, returns `google_oauth_no_public_url` error)
- Catch block uses `getPublicBaseUrl(request)` (no siteUrl, DB may be unavailable)

## Verification
- `bun run lint` passes with no errors
- Dev server compiles successfully with no runtime errors
- Cookie settings and token generation logic remain unchanged
