# Task 2-a: Payment + Profile Features — Work Record

## Summary
Successfully implemented all 4 features requested:

### 1. Payment Button for Users in PengajuanSaya
- **File**: `src/components/PengajuanSaya.tsx`
- Added a prominent "Bayar Sekarang" button in the expanded detail row for items with `paymentStatus === 'unpaid' | 'pending' | 'failed'` that have `totalBiaya` and are `approved/completed`
- The button shows payment status badge, cost amount, and a green "Bayar Sekarang" / "Lihat Pembayaran" button
- Pre-existing small "Bayar" / "Lihat" buttons in the table column remain for quick access

### 2. Admin Payment Status Management
- **File**: `src/components/AdminDashboard.tsx`
- Added "Tandai Lunas" button next to unpaid items in the admin table
- Updated payment dialog to support `mark_paid` action type (alongside `confirm` and `reject`)
- When admin clicks "Tandai Lunas", the dialog shows a manual payment info box explaining this is for cash/manual payments
- The submit button text changes to "Tandai Lunas" when mark_paid action is selected

- **File**: `src/app/api/payment/route.ts`
- Added `mark_paid` action to PATCH endpoint
- `mark_paid` allows changing from any non-paid status directly to `paid` without requiring proof
- Sets `paymentMethod` to `'manual'` if not already set, and adds a note "Ditandai lunas oleh admin (manual/tunai)"
- Existing `confirm` and `reject` actions remain unchanged for `pending` status

### 3. Auto-Save Phone and Instansi from Borrowing Form
- **File**: `src/components/PeminjamanAulaForm.tsx`
- Added `phone` and `instansi` fields to the borrowing API POST request body

- **File**: `src/components/PeminjamanKendaraanForm.tsx`
- Added `phone` and `instansi` fields to the borrowing API POST request body

- **File**: `src/app/api/borrowing/route.ts`
- Added `phone` and `instansi` (as `formInstansi`) to destructured body params
- After creating the borrowing and sending notifications, auto-saves `phone` and `instansi` to user profile if they are currently empty/null
- Uses non-blocking try/catch to avoid breaking the borrowing creation if profile update fails

### 4. Edit Profile Feature
- **New file**: `src/components/EditProfileDialog.tsx`
- Dialog with form fields: Nama, No. HP/WhatsApp, Instansi
- Pre-populates with current user data from the store
- On save, calls PATCH `/api/user/profile`
- After save, updates the user in the Zustand store with new data

- **New file**: `src/app/api/user/profile/route.ts`
- PATCH endpoint to update user profile (name, phone, instansi)
- Requires authentication via `epakar-token` cookie
- Users can only update their own profile
- Role cannot be changed through this endpoint

- **File**: `src/lib/store.ts`
- Added `editProfileDialogOpen` and `setEditProfileDialogOpen` to store state

- **File**: `src/components/HomeContent.tsx`
- Imported and rendered `EditProfileDialog` component

- **File**: `src/components/Navbar.tsx`
- Added "Edit Profil" dropdown menu item (both desktop and mobile)
- Uses `setEditProfileDialogOpen(true)` to open the dialog

## All lint checks passed. App compiles and serves correctly (HTTP 200).
