import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decodeToken, sanitizeUser } from '@/lib/auth'

// PATCH: Update user profile (name, phone, instansi)
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user from cookie
    const token = request.cookies.get('epakar-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' }, { status: 401 })
    }

    const decoded = decodeToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: decoded.userId } })
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 })
    }

    const body = await request.json()
    const { name, phone, instansi } = body

    // Validate at least one field is provided
    if (!name && phone === undefined && instansi === undefined) {
      return NextResponse.json({ error: 'Minimal satu field harus diisi' }, { status: 400 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 })
      }
      updateData.name = name.trim()
    }
    if (phone !== undefined) {
      updateData.phone = phone.trim() || null
    }
    if (instansi !== undefined) {
      updateData.instansi = instansi.trim() || null
    }

    // Users cannot change their role through this endpoint
    // (role is not in the updateData, so it's inherently protected)

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
    })

    return NextResponse.json({
      message: 'Profil berhasil diperbarui',
      user: sanitizeUser(updatedUser),
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan saat memperbarui profil' }, { status: 500 })
  }
}
