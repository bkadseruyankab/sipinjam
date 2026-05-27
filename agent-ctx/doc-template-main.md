# Task: Document Template Feature Implementation

## Summary
Implemented a comprehensive Document Template feature for the E-Pakar borrowing/lending application. The feature allows admins to create, manage, and generate document templates (surat permohonan, surat persetujuan, surat keterangan, undangan) with automatic placeholder replacement.

## Files Created

### API Routes
1. `/home/z/my-project/src/app/api/templates/route.ts` - CRUD operations for templates (GET, POST, PATCH, DELETE)
2. `/home/z/my-project/src/app/api/templates/generate/route.ts` - Generate document from template with placeholder replacement
3. `/home/z/my-project/src/app/api/templates/seed/route.ts` - Seed 5 default Indonesian government letter templates

### Components
4. `/home/z/my-project/src/components/TemplateManager.tsx` - Full template management UI (create, edit, delete, preview, seed, export/import)
5. `/home/z/my-project/src/components/DocumentPreview.tsx` - Document preview with print/download functionality

## Files Modified

6. `/home/z/my-project/src/lib/store.ts` - Added `templateManagerOpen` and `setTemplateManagerOpen` state
7. `/home/z/my-project/src/app/page.tsx` - Added TemplateManager import, Button import, TemplateManagerOverlay component
8. `/home/z/my-project/src/components/SettingsPage.tsx` - Added "Template Dokumen" tab with TemplateDokumenSummary component, updated tab type
9. `/home/z/my-project/src/components/AdminDashboard.tsx` - Added "Generate Dokumen" button for approved/completed borrowings, generate document and preview dialogs

## Key Features
- 5 default Indonesian government letter templates with KOP headers
- 23+ placeholders for automatic data replacement ({{nama}}, {{kegiatan}}, {{tanggalPinjam}}, etc.)
- Template CRUD with default per type, active/inactive toggle
- Document generation from borrowing data
- Preview with print/download
- Export/import templates as JSON
- Filter by type with animated pill tabs
- Integration with existing KOP utilities
