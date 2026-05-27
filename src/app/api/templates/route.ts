import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decodeToken } from '@/lib/auth'

// Helper: Get authenticated admin user from request
async function getAdminUser(request: NextRequest) {
  const token = request.cookies.get('epakar-token')?.value
  if (!token) return null

  const decoded = decodeToken(token)
  if (!decoded) return null

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  })

  if (!user || user.role !== 'admin') return null
  return user
}

// GET /api/templates - List all templates (optional ?type=xxx, ?active=true)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const activeOnly = searchParams.get('active') === 'true'

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (activeOnly) where.isActive = true

    const templates = await db.documentTemplate.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data template' },
      { status: 500 }
    )
  }
}

// POST /api/templates - Create a new template (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat menambah template.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, type, content, description, isDefault, isActive } = body

    if (!name || !type || !content) {
      return NextResponse.json(
        { error: 'Nama, tipe, dan konten template wajib diisi' },
        { status: 400 }
      )
    }

    const validTypes = ['surat_permohonan', 'surat_persetujuan', 'surat_keterangan', 'undangan', 'custom']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Tipe tidak valid. Pilihan: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // If isDefault is true, unset other defaults of same type
    if (isDefault) {
      await db.documentTemplate.updateMany({
        where: { type, isDefault: true },
        data: { isDefault: false },
      })
    }

    const template = await db.documentTemplate.create({
      data: {
        name,
        type,
        content,
        description: description || null,
        isDefault: isDefault || false,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menambah template' },
      { status: 500 }
    )
  }
}

// PATCH /api/templates - Update template (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengubah template.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, name, type, content, description, isDefault, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID template wajib diisi' },
        { status: 400 }
      )
    }

    const existing = await db.documentTemplate.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Template tidak ditemukan' },
        { status: 404 }
      )
    }

    // If setting isDefault, unset other defaults of same type
    const targetType = type || existing.type
    if (isDefault) {
      await db.documentTemplate.updateMany({
        where: { type: targetType, isDefault: true },
        data: { isDefault: false },
      })
    }

    const template = await db.documentTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(content !== undefined && { content }),
        ...(description !== undefined && { description: description || null }),
        ...(isDefault !== undefined && { isDefault }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Update template error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengubah template' },
      { status: 500 }
    )
  }
}

// DELETE /api/templates - Delete template (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat menghapus template.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID template wajib diisi' },
        { status: 400 }
      )
    }

    const existing = await db.documentTemplate.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Template tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.documentTemplate.delete({ where: { id } })

    return NextResponse.json({ message: 'Template berhasil dihapus' })
  } catch (error) {
    console.error('Delete template error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus template' },
      { status: 500 }
    )
  }
}
