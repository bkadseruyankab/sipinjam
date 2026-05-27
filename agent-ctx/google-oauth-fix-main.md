# Google OAuth Login Flow Fix - Work Summary

## Task ID: google-oauth-fix

## Changes Made

### 1. SettingsPage.tsx — Added Google OAuth configuration tab
- Added `google_client_id`, `google_client_secret`, `nextauth_secret`, `google_oauth_enabled` to `SettingsForm` interface and defaults
- Added 'oauth' tab to the tab navigation (with Lock icon)
- Added full OAuth settings UI: enable toggle, Client ID/Secret inputs, NextAuth Secret with Generate button, setup instructions, Test Connection button
- Added form field loading in fetchSettings useEffect

### 2. Created `/api/auth/oauth-status/route.ts`
- GET endpoint that checks if Google OAuth is configured and enabled
- Reads from DB settings first, falls back to env vars
- Returns `{ configured: boolean, enabled: boolean }`

### 3. Created `/api/auth/google-signin/route.ts`
- Dynamic Google OAuth initiation endpoint
- Reads credentials from DB settings (bypasses NextAuth's static GoogleProvider limitation)
- Constructs Google OAuth URL with CSRF state stored in cookie
- Redirects to Google's authorization endpoint

### 4. Created `/api/auth/google-callback-v2/route.ts`
- Handles Google OAuth callback by exchanging code for tokens
- Decodes ID token to get user email/name
- Finds or creates user in DB
- Sets `epakar-token` cookie (fixing the missing cookie issue)
- Clears state cookie after use

### 5. Fixed OAuthErrorHandler.tsx
- Removed `useSearchParams()` to fix hydration issues
- Now accepts `error` as a prop instead
- Added specific error messages for new OAuth error types

### 6. Fixed LoginDialog.tsx
- Added OAuth status check on mount (fetches from `/api/auth/oauth-status`)
- Only shows Google Sign-in button when OAuth is configured and enabled
- Changed redirect from `/api/auth/signin/google` to `/api/auth/google-signin` (dynamic endpoint)

### 7. Fixed SearchParamsHandler.tsx
- Integrated OAuth error handling directly (no more separate OAuthErrorHandler in HomeContent)
- Uses `useRef` to prevent duplicate error toasts
- Added specific error messages for all OAuth error types
- Cleans up URL after showing error

### 8. Updated HomeContent.tsx
- Removed standalone `OAuthErrorHandler` import and usage
- OAuth error handling now flows through SearchParamsHandler (already in Suspense boundary)

## Key Architecture Decision
Since NextAuth's GoogleProvider reads credentials from `process.env` statically at module load time, we can't dynamically configure it from DB. The solution creates a custom OAuth flow:
1. `/api/auth/google-signin` — reads DB settings, constructs Google OAuth URL dynamically
2. `/api/auth/google-callback-v2` — handles callback, exchanges code for tokens, sets `epakar-token`
3. `/api/auth/oauth-status` — lets frontend know if Google OAuth is available

## Lint Status
All changes pass `bun run lint` with zero errors.
