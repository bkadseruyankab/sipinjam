import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decodeToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Helper: Get authenticated user from request
async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('epakar-token')?.value
  if (!token) return null
  const decoded = decodeToken(token)
  if (!decoded) return null
  const user = await db.user.findUnique({ where: { id: decoded.userId } })
  return user
}

// POST: Upload payment proof (bukti transfer)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' }, { status: 401 })
    }

    const formData = await request.formData()
    const borrowingId = formData.get('borrowingId') as string
    const file = formData.get('file') as File | null

    if (!borrowingId) {
      return NextResponse.json({ error: 'borrowingId wajib diisi' }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ error: 'File bukti transfer wajib diunggah' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Format file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
    }

    // Find the borrowing
    const borrowing = await db.borrowing.findUnique({
      where: { id: borrowingId },
    })

    if (!borrowing) {
      return NextResponse.json({ error: 'Peminjaman tidak ditemukan' }, { status: 404 })
    }

    // Only the owner can upload proof
    if (borrowing.userId !== user.id) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses' }, { status: 403 })
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payment')
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `proof-${borrowingId}-${Date.now()}.${ext}`
    const filepath = path.join(uploadDir, filename)

    // Write file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Update borrowing with proof URL
    const proofUrl = `/uploads/payment/${filename}`
    await db.borrowing.update({
      where: { id: borrowingId },
      data: {
        paymentProof: proofUrl,
        paymentStatus: 'pending', // Set to pending if not already
      },
    })

    return NextResponse.json({
      message: 'Bukti transfer berhasil diunggah',
      proofUrl,
    })
  } catch (error) {
    console.error('Upload payment proof error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan saat mengunggah bukti transfer' }, { status: 500 })
  }
}
