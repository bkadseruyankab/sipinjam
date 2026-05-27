# Task 2: Enhance SettingsPage Notification Tab

## Work Log

- Added 18 new fields to `SettingsForm` interface in `SettingsPage.tsx`:
  - SMTP settings: `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `smtp_from`, `smtp_secure`
  - WhatsApp templates: `wa_template_new`, `wa_template_approved`, `wa_template_rejected`
  - Email templates: `email_template_new`, `email_template_approved`, `email_template_rejected`
  - Email subjects: `email_subject_new`, `email_subject_approved`, `email_subject_rejected`

- Added default values for all new fields in `defaultSettings` with Indonesian templates:
  - WA templates include emoji and `{variable}` placeholders
  - Email templates use HTML format with `{variable}` placeholders
  - Email subjects follow pattern: `Peminjaman {status} - {kegiatan}`

- Added `testingWhatsApp` and `testingEmail` state variables for test button loading states

- Added `handleTestWhatsApp` and `handleTestEmail` functions:
  - Test WA: validates admin_phone and fonnte_token, sends test via /api/notify with sample data
  - Test Email: validates admin_email and smtp_host, sends test via /api/notify with sample data
  - Both show success/error toasts

- Rewrote notifications tab with 4 modern sub-section cards:
  1. **WhatsApp (Fonnte)** - Green gradient header, toggle, token input, 3 template textareas, test button
  2. **Email (SMTP)** - Purple gradient header, toggle, SMTP config fields (host/port/user/pass/from/secure), 3 subject inputs, 3 template textareas, test button
  3. **Admin Contact** - Amber gradient header, WA number and email fields
  4. **Template Variables Info** - Sky/blue gradient header, grid of 6 variables with descriptions, helpful info note

- Added new Lucide icon imports: `Send`, `Shield`, `Info`, `Sparkles`, `FileText`, `Phone`, `Server`, `Key`, `Lock`

- Added fetchSettings mapping for all 18 new fields in the useEffect

- Updated `/api/notify/route.ts` to support actual SMTP email sending via nodemailer:
  - Reads SMTP settings from DB (smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from, smtp_secure)
  - If SMTP is configured, creates nodemailer transporter and sends actual email
  - If SMTP is not configured, falls back to logging as "pending" (queued)
  - Handles TLS configuration based on smtp_secure setting
  - Proper error handling and notification logging to DB

- All existing tabs and functionality preserved (perda, tarif-aula, tarif-kendaraan, images, agreement)
- GalleryManager and KendaraanImageManager components preserved
- Lint passes cleanly, dev server compiles successfully

## Stage Summary
- Full SMTP email configuration UI with test functionality
- WhatsApp and email message templates with {variable} placeholder system
- 4 visually distinct notification sub-sections with gradient accents
- Backend SMTP integration using nodemailer
- All text in Indonesian
