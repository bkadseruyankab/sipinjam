# Task 1 - Sub Agent Work Record

## Task
Fix report printing, add ttd_foto signature photo upload, include signature in printed documents

## Changes Made

### 1. ReportPage.tsx - Fixed printing
- Replaced `window.print()` with `printHTML` from `@/lib/print-utils`
- Added `printing` state and loading indicator on print button
- `handlePrint` now:
  - Fetches KOP settings from `/api/settings`
  - Builds complete HTML document with KOP header, title, summary stats, type breakdown table, monthly breakdown table, and detail table (if in detail view)
  - Calls `printHTML({ title: 'Laporan Peminjaman', content: htmlContent })`

### 2. SettingsPage.tsx - Added ttd_foto field
- Added `ttd_foto: string` to `SettingsForm` interface
- Added `ttd_foto: ''` to `defaultSettings`
- Added `ttd_foto` loading in useEffect form population
- Added `ImageUploader` component in TTD tab after alamat field
- Updated TTD preview to show signature photo above name line

### 3. agreement/route.ts - Signature photo in agreements
- Added `ttdFoto` variable from `settingsMap.ttd_foto || ''`
- Passed `ttdFoto` to `generateAgreementHTML()`
- Added `ttdFoto` parameter and displayed in PIHAK PERTAMA signature block

### 4. receipt/route.ts - Signature photo in receipt API
- Added `ttdFoto` variable from `settingsMap.ttd_foto || ''`
- Added `foto: ttdFoto` to the ttd object in receipt response

### 5. print-utils.ts - Signature photo in printed receipts
- Added `foto: string` to `ttd` interface
- Added `foto: ''` to default ttd fallback
- PIHAK PERTAMA signature shows photo between jabatan and name underline

### 6. ReceiptViewer.tsx - Signature photo in receipt viewer
- Added `foto: string` to `ttd` interface
- PIHAK PERTAMA signature shows photo between jabatan and separator

## Result
- All changes pass `bun run lint` with zero errors
- No Prisma schema changes needed (ttd_foto stored as key-value in Settings model)
