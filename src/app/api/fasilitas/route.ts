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

// Seed initial facilities data (only if table is empty)
async function seedFasilitas() {
  const count = await db.fasilitas.count()
  if (count > 0) return false

  const seedData = [
    { nama: 'Kapasitas Ruangan', deskripsi: 'Ruangan serbaguna dengan kapasitas hingga 500 orang, cocok untuk berbagai jenis acara.', icon: 'Users', urutan: 1, aktif: true },
    { nama: 'Coffee Break', deskripsi: 'Layanan coffee break tersedia untuk mendukung kelancaran acara dan kenyamanan peserta.', icon: 'Coffee', urutan: 2, aktif: true },
    { nama: 'AC Standing', deskripsi: 'AC standing floor yang memadai untuk menjaga kenyamanan suhu ruangan sepanjang acara.', icon: 'Snowflake', urutan: 3, aktif: true },
    { nama: 'Sound System', deskripsi: 'Sound system profesional dengan kualitas suara jernih untuk presentasi dan pertunjukan.', icon: 'Volume2', urutan: 4, aktif: true },
    { nama: 'Videotron', deskripsi: 'Videotron LED berukuran besar untuk menampilkan visual presentasi dan multimedia.', icon: 'Monitor', urutan: 5, aktif: true },
    { nama: 'WiFi Gratis', deskripsi: 'Akses WiFi berkecepatan tinggi gratis untuk seluruh peserta acara.', icon: 'Wifi', urutan: 6, aktif: true },
    { nama: 'Zoom Meeting', deskripsi: 'Fasilitas hybrid meeting dengan perangkat Zoom untuk partisipan jarak jauh.', icon: 'Video', urutan: 7, aktif: true },
  ]

  await db.$transaction(seedData.map(data => db.fasilitas.create({ data })))
  return true
}

// GET /api/fasilitas - List all fasilitas, ordered by urutan
export async function GET() {
  try {
    // Auto-seed if table is empty
    await seedFasilitas()

    const fasilitas = await db.fasilitas.findMany({
      orderBy: { urutan: 'asc' },
    })

    return NextResponse.json({ fasilitas })
  } catch (error) {
    console.error('Get fasilitas error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data fasilitas' },
      { status: 500 }
    )
  }
}

// POST /api/fasilitas - Create new fasilitas (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat menambah fasilitas.' }, { status: 403 })
    }

    const body = await request.json()
    const { nama, deskripsi, icon, imageUrl, urutan, aktif } = body

    if (!nama || !deskripsi) {
      return NextResponse.json(
        { error: 'Nama dan deskripsi fasilitas wajib diisi' },
        { status: 400 }
      )
    }

    const fasilitas = await db.fasilitas.create({
      data: {
        nama,
        deskripsi,
        icon: icon || 'Wifi',
        imageUrl: imageUrl || null,
        urutan: urutan ?? 0,
        aktif: aktif !== undefined ? aktif : true,
      },
    })

    return NextResponse.json({ fasilitas }, { status: 201 })
  } catch (error) {
    console.error('Create fasilitas error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menambah fasilitas' },
      { status: 500 }
    )
  }
}

// PUT /api/fasilitas - Update fasilitas (admin only)
export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat mengubah fasilitas.' }, { status: 403 })
    }

    const body = await request.json()
    const { id, nama, deskripsi, icon, imageUrl, urutan, aktif } = body

    if (!id) {
      return NextResponse.json({ error: 'ID fasilitas wajib diisi' }, { status: 400 })
    }

    const existing = await db.fasilitas.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Fasilitas tidak ditemukan' }, { status: 404 })
    }

    const fasilitas = await db.fasilitas.update({
      where: { id },
      data: {
        ...(nama !== undefined && { nama }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(icon !== undefined && { icon }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(urutan !== undefined && { urutan }),
        ...(aktif !== undefined && { aktif }),
      },
    })

    return NextResponse.json({ fasilitas })
  } catch (error) {
    console.error('Update fasilitas error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengubah fasilitas' },
      { status: 500 }
    )
  }
}

// DELETE /api/fasilitas?id=xxx - Delete fasilitas (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat menghapus fasilitas.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID fasilitas wajib diisi' }, { status: 400 })
    }

    const existing = await db.fasilitas.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Fasilitas tidak ditemukan' }, { status: 404 })
    }

    await db.fasilitas.delete({ where: { id } })

    return NextResponse.json({ message: 'Fasilitas berhasil dihapus' })
  } catch (error) {
    console.error('Delete fasilitas error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus fasilitas' },
      { status: 500 }
    )
  }
}
