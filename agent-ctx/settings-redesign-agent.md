# Settings Page Tab Navigation Redesign

## Task Summary
Redesigned the Settings page navigation from a horizontal scrollable tab bar to a categorized sidebar + accordion layout, making all tabs easily findable especially on mobile.

## Changes Made

### 1. Navigation Structure
- **Replaced horizontal scroll tab bar** with categorized navigation
- **Desktop (md+)**: Left sidebar (w-64) with grouped navigation items and a sticky ScrollArea
- **Mobile**: Collapsible Accordion-style groups that auto-open the active category

### 2. Categories
```
📋 Umum
  - Identitas
  - Kop Surat
  - Penandatangan

💰 Tarif & Peraturan
  - Peraturan Daerah
  - Tarif Aula
  - Tarif Kendaraan
  - Pembayaran (NEW)
  - Persetujuan

🏢 Fasilitas & Gambar
  - Fasilitas Aula
  - Gambar

🔒 Keamanan & Login
  - Google OAuth

🔔 Notifikasi
  - Notifikasi

📄 Template
  - Template Cetak
  - Template Dokumen
```

### 3. New "Pembayaran" (Payment) Tab
- Added to the `Tarif & Peraturan` category
- Fields: bank name, bank account, account holder, QRIS merchant, payment instructions, auto-confirm toggle, deadline days
- All payment fields were already in the SettingsForm interface and defaultSettings, just had no tab to display them

### 4. Status Indicators
- **Green dot**: Section fully configured (all required fields filled)
- **Yellow dot**: Partially configured (some fields filled)
- **Gray dot**: Not configured
- Each sidebar item shows its status dot
- Google OAuth shows an "ON" badge when enabled

### 5. Type Updates
- `activeTab` state type updated to include `'payment'`
- Added `TabId` type alias for the union type
- Added payment fields to `fetchSettings` useEffect

### 6. Save Button
- Made sticky at the bottom of the content area
- Uses gradient background for visual polish

### 7. Layout Changes
- Container changed from `max-w-3xl` to `max-w-6xl` to accommodate sidebar
- Desktop: `flex-row` layout with sidebar + content
- Mobile: `flex-col` layout with accordion nav on top + content below

## Files Modified
- `src/components/SettingsPage.tsx` - All navigation, layout, and payment tab changes

## Technical Notes
- Used existing shadcn/ui Accordion component for mobile navigation
- Used existing ScrollArea for desktop sidebar scroll
- All existing tab content is preserved exactly as-is
- The Accordion auto-opens the category containing the active tab
