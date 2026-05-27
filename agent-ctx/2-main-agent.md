# Task ID: 2 - Rewrite PeminjamanKendaraanForm as Multi-Step Form

## Agent: Main Agent

## Summary
Successfully rewrote the PeminjamanKendaraanForm component from a single-page form to a 4-step multi-step wizard with Persetujuan Tarif Retribusi step.

## Files Modified
1. **`src/components/PeminjamanKendaraanForm.tsx`** — Complete rewrite as 4-step multi-step form
2. **`src/app/api/borrowing/route.ts`** — Changed setujuTarif to work for both aula and kendaraan types
3. **`src/components/SettingsPage.tsx`** — Added tarif_kendaraan_sopir field in admin settings
4. **`worklog.md`** — Appended work record

## Database Changes
- Added `tarif_kendaraan_sopir` setting (value: 200000) to Settings table

## Step Structure
- **Step 1 (Data Peminjam)**: Nama, Instansi, Email, NIP, Nomor Kontak — pre-filled from user data
- **Step 2 (Detail Peminjaman)**: Kendaraan, Kegiatan, Keperluan, Tanggal, Tujuan, Jumlah Penumpang, Sopir
- **Step 3 (Dokumen Pendukung)**: URL or file upload for Surat Permohonan
- **Step 4 (Persetujuan Tarif Retribusi)**: Perda banner, tariff table with highlighted selection, itemized cost breakdown, consent checkbox

## Lint Status
✅ Zero errors
