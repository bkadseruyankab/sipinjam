---
Task ID: 7
Agent: Main Agent
Task: Fix login issue and add image upload features (logo, favicon, aula, kendaraan)

Work Log:
- Fixed login session persistence: Added localStorage-based user persistence in Zustand store
- Created SessionChecker component that validates auth cookie on page load via /api/auth/me
- Added /api/auth/logout endpoint that clears the epakar-token cookie
- Updated Navbar logout to call logout API and clear session
- Added demo credentials hint in LoginDialog (admin@epakar.id/admin123, user@demo.id/user123)
- Created /api/upload endpoint for file uploads with category support (logo, favicon, aula, kendaraan, fasilitas)
- Updated /api/kendaraan to support POST (create), PUT (update), DELETE operations with imageUrl
- Created ImageUploader reusable component with drag-and-drop, file upload, and URL input
- Created GalleryManager component for managing multiple images (aula gallery, fasilitas images)
- Completely rewrote SettingsPage with tabbed interface (Peraturan, Tarif Aula, Tarif Kendaraan, Gambar, Notifikasi, Persetujuan)
- Added image upload sections: site_logo, site_favicon, hero_image, aula_image, aula_gallery, fasilitas_aula_images
- Created KendaraanImageManager sub-component for managing vehicle images from settings
- Updated Navbar and Footer to use dynamic logo from settings (with fallback to "EP" badge)
- Updated HeroSection to use dynamic hero image from settings (with fallback to /images/hero-aula.png)
- Updated FasilitasSection to show aula gallery and facility images from settings
- Updated PeminjamanKendaraanForm to show vehicle images in selection cards (replaced Select dropdown)
- Created FaviconUpdater component for dynamic favicon from settings
- Fixed /api/settings to return {setting: {key, value: ''}} instead of 404 for missing keys
- Updated next.config.ts with remote image patterns for next/image

Stage Summary:
- Login now works with session persistence across page refreshes
- Logout properly clears both cookie and client state
- Full image upload system: logo, favicon, hero background, aula images, aula gallery, fasilitas images, kendaraan images
- Settings page organized into tabs for better UX
- All uploaded images stored in public/uploads/{category}/ with unique filenames
- Dynamic logo/favicon throughout the app (Navbar, Footer, browser tab)
- Vehicle selection in kendaraan form shows images with radio-card style UI
