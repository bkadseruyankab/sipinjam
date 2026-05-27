import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decodeToken } from '@/lib/auth'

// Helper: Get authenticated user from request
async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('epakar-token')?.value
  if (!token) return null
  const decoded = decodeToken(token)
  if (!decoded) return null
  const user = await db.user.findUnique({ where: { id: decoded.userId } })
  return user
}

// Helper: Get authenticated admin user
async function getAdminUser(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user || user.role !== 'admin') return null
  return user
}

// Generate simulated VA number based on bank
function generateVaNumber(method: string): string {
  const randomDigits = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')
  switch (method) {
    case 'va_bca':
      return `8800${randomDigits.slice(0, 8)}`
    case 'va_bri':
      return `1000${randomDigits.slice(0, 8)}`
    case 'va_mandiri':
      return `8900${randomDigits.slice(0, 8)}`
    default:
      return `9999${randomDigits.slice(0, 8)}`
  }
}

// Generate simulated QRIS string
function generateQrisString(amount: string): string {
  return `QRIS-EPK-${Date.now()}-${amount}`
}

// POST: Create payment for a borrowing
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' }, { status: 401 })
    }

    const body = await request.json()
    const { borrowingId, method } = body

    if (!borrowingId || !method) {
      return NextResponse.json({ error: 'borrowingId dan method wajib diisi' }, { status: 400 })
    }

    const validMethods = ['va_bca', 'va_bri', 'va_mandiri', 'qris', 'manual']
    if (!validMethods.includes(method)) {
      return NextResponse.json({ error: 'Metode pembayaran tidak valid' }, { status: 400 })
    }

    // Find the borrowing
    const borrowing = await db.borrowing.findUnique({
      where: { id: borrowingId },
    })

    if (!borrowing) {
      return NextResponse.json({ error: 'Peminjaman tidak ditemukan' }, { status: 404 })
    }

    // Only the owner or admin can create payment
    if (borrowing.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Anda tidak memiliki akses' }, { status: 403 })
    }

    // Check if already paid
    if (borrowing.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Pembayaran sudah dikonfirmasi' }, { status: 400 })
    }

    const totalBiaya = borrowing.totalBiaya
    if (!totalBiaya) {
      return NextResponse.json({ error: 'Total biaya belum ditentukan. Hubungi admin.' }, { status: 400 })
    }

    // Generate payment details based on method
    let paymentVaNumber: string | null = null
    let paymentQrisUrl: string | null = null

    if (method.startsWith('va_')) {
      paymentVaNumber = generateVaNumber(method)
    } else if (method === 'qris') {
      paymentQrisUrl = generateQrisString(totalBiaya)
    }
    // For manual, no VA/QRIS needed

    // Update borrowing with payment info
    const updated = await db.borrowing.update({
      where: { id: borrowingId },
      data: {
        paymentMethod: method,
        paymentVaNumber,
        paymentQrisUrl,
        paymentStatus: 'pending',
        paymentAmount: totalBiaya,
      },
    })

    return NextResponse.json({
      message: 'Pembayaran berhasil dibuat',
      payment: {
        borrowingId: updated.id,
        method: updated.paymentMethod,
        vaNumber: updated.paymentVaNumber,
        qrisUrl: updated.paymentQrisUrl,
        amount: updated.paymentAmount,
        status: updated.paymentStatus,
      },
    })
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan saat membuat pembayaran' }, { status: 500 })
  }
}

// PATCH: Confirm, reject, or mark_paid payment (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat mengkonfirmasi pembayaran.' }, { status: 403 })
    }

    const body = await request.json()
    const { borrowingId, action, paymentProof, notes } = body

    if (!borrowingId || !action) {
      return NextResponse.json({ error: 'borrowingId dan action wajib diisi' }, { status: 400 })
    }

    if (!['confirm', 'reject', 'mark_paid'].includes(action)) {
      return NextResponse.json({ error: 'Action harus "confirm", "reject", atau "mark_paid"' }, { status: 400 })
    }

    const borrowing = await db.borrowing.findUnique({
      where: { id: borrowingId },
    })

    if (!borrowing) {
      return NextResponse.json({ error: 'Peminjaman tidak ditemukan' }, { status: 404 })
    }

    // mark_paid: admin marks unpaid item as paid (manual/cash payment)
    if (action === 'mark_paid') {
      if (borrowing.paymentStatus === 'paid') {
        return NextResponse.json({ error: 'Pembayaran sudah dikonfirmasi sebelumnya' }, { status: 400 })
      }

      const updateData: Record<string, unknown> = {
        paymentStatus: 'paid',
        paidAt: new Date(),
        paymentNotes: notes || 'Ditandai lunas oleh admin (manual/tunai)',
        paymentMethod: borrowing.paymentMethod || 'manual',
        paymentAmount: borrowing.paymentAmount || borrowing.totalBiaya,
      }
      if (paymentProof) {
        updateData.paymentProof = paymentProof
      }

      const updated = await db.borrowing.update({
        where: { id: borrowingId },
        data: updateData,
      })

      return NextResponse.json({
        message: 'Pembayaran berhasil ditandai lunas',
        payment: {
          borrowingId: updated.id,
          status: updated.paymentStatus,
          paidAt: updated.paidAt,
          notes: updated.paymentNotes,
        },
      })
    }

    // confirm/reject: only works on pending status
    if (borrowing.paymentStatus !== 'pending') {
      return NextResponse.json({ error: `Status pembayaran saat ini: ${borrowing.paymentStatus}. Hanya status "pending" yang dapat dikonfirmasi.` }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {
      paymentNotes: notes || null,
    }

    if (action === 'confirm') {
      updateData.paymentStatus = 'paid'
      updateData.paidAt = new Date()
      if (paymentProof) {
        updateData.paymentProof = paymentProof
      }
    } else {
      updateData.paymentStatus = 'failed'
    }

    const updated = await db.borrowing.update({
      where: { id: borrowingId },
      data: updateData,
    })

    return NextResponse.json({
      message: action === 'confirm' ? 'Pembayaran berhasil dikonfirmasi' : 'Pembayaran ditolak',
      payment: {
        borrowingId: updated.id,
        status: updated.paymentStatus,
        paidAt: updated.paidAt,
        notes: updated.paymentNotes,
      },
    })
  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan saat mengkonfirmasi pembayaran' }, { status: 500 })
  }
}
