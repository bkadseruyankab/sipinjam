# Task 4-a: Notification System & Google Sign-in

## Work Completed

### Part 1: Notification API

#### 1.1 Prisma Schema Update
- Added `Notification` model to `prisma/schema.prisma` with fields:
  - id, type, status, recipient, subject, message, borrowingId, error, sentAt, createdAt
- Ran `bun run db:push` to sync database

#### 1.2 API Routes Created
- **`/api/notify/route.ts`** - POST endpoint for sending notifications
  - Accepts: `{ type, to, subject, message, borrowingId }`
  - Supports WhatsApp (Fonnte), Email (logged), or both
  - Reads settings from DB (fonnte_token, fonnte_enabled, email_enabled)
  - Calls Fonnte API at `https://api.fonnte.com/send` with authorization token
  - Logs all notifications to Notification table with status tracking
  - Phone number formatting (0xxx → 62xxx for Indonesia)

- **`/api/notifications/list/route.ts`** - GET endpoint for listing notifications
  - Supports filtering by type and status
  - Pagination support (page, limit)
  - Returns notifications with pagination metadata

- **`/api/auth/google-callback/route.ts`** - Google OAuth callback handler
  - Syncs NextAuth session with custom epakar-token cookie system
  - Creates user in DB if not exists after Google sign-in

#### 1.3 Notification Integration
- **Borrowing creation** (`/api/borrowing/route.ts`): Sends WhatsApp/email notification to admin when new borrowing is submitted
- **Admin status change** (`/api/admin/borrowings/route.ts`): Sends notification to user when borrowing is approved/rejected/completed/cancelled
- Both are fire-and-forget (non-blocking) - notification errors don't affect API responses

#### 1.4 Settings Updated
- Added notification settings to SettingsPage:
  - `fonnte_token` - Fonnte API token (password field)
  - `fonnte_enabled` - Enable/disable WhatsApp (Switch toggle)
  - `email_enabled` - Enable/disable email (Switch toggle)
  - `admin_phone` - Admin WhatsApp number
  - `admin_email` - Admin email address
- Seeded all 5 settings to database
- New "Notifikasi" section card with WhatsApp (green), Email (blue), and Admin Contact sub-sections

#### 1.5 Notifications Page
- Created `NotificationsPage.tsx` component with:
  - Stats cards (Total, Terkirim, Antrian, Gagal)
  - Filter by type (WhatsApp/Email) and status (Sent/Pending/Failed)
  - Scrollable notification table with type/status badges
  - Detail dialog to view full notification content and errors
  - Added `admin-notifications` view to store and page router
  - Added "Notifikasi" link in Navbar (desktop & mobile) and AdminDashboard

### Part 2: Google Sign-in Integration

#### 2.1 NextAuth Configuration
- Created `/api/auth/[...nextauth]/route.ts` with:
  - Google Provider (clientId/secret from env vars)
  - Credentials Provider (existing email/password auth)
  - JWT session strategy
  - Custom signIn callback (auto-creates user for Google sign-ins)
  - Custom jwt/session callbacks (adds id and role to token/session)
  - Custom sign-in page redirect to '/'

#### 2.2 Environment Variables
- Added to `.env`:
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

#### 2.3 LoginDialog Update
- Added "Masuk dengan Google" button with Google logo SVG
- "atau" divider between email/password and Google sign-in
- Google sign-in redirects to NextAuth Google provider
- Loading state during Google authentication

### Files Created
- `src/app/api/notify/route.ts`
- `src/app/api/notifications/list/route.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/google-callback/route.ts`
- `src/components/NotificationsPage.tsx`

### Files Modified
- `prisma/schema.prisma` (added Notification model)
- `src/app/api/borrowing/route.ts` (admin notification on new borrowing)
- `src/app/api/admin/borrowings/route.ts` (user notification on status change)
- `src/components/SettingsPage.tsx` (notification settings section)
- `src/components/LoginDialog.tsx` (Google Sign-in button)
- `src/components/Navbar.tsx` (Notifikasi menu link)
- `src/components/AdminDashboard.tsx` (Notifikasi button)
- `src/lib/store.ts` (admin-notifications view type)
- `src/app/page.tsx` (NotificationsPage rendering)
- `.env` (NextAuth env vars)

### Lint Status
- All lint checks pass with zero errors
