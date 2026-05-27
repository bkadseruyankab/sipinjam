import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decodeToken } from '@/lib/auth';

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

// GET /api/aula — List all aula with optional bookedDates info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalPinjam = searchParams.get('tanggalPinjam');
    const tanggalKembali = searchParams.get('tanggalKembali');

    const showAll = searchParams.get('all') === 'true';

    const aula = await db.aula.findMany({
      where: showAll ? {} : { status: { not: 'perawatan' } },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // For each aula, find approved/pending borrowings to build bookedDates
    const aulaWithBookings = await Promise.all(
      aula.map(async (a) => {
        const bookings = await db.borrowing.findMany({
          where: {
            aulaId: a.id,
            status: { in: ['pending', 'approved', 'cancel_requested'] },
          },
          select: {
            id: true,
            tanggalPinjam: true,
            tanggalKembali: true,
            status: true,
            kegiatan: true,
          },
          orderBy: {
            tanggalPinjam: 'asc',
          },
        });

        const bookedDates = bookings.map((b) => ({
          id: b.id,
          from: b.tanggalPinjam,
          to: b.tanggalKembali,
          status: b.status,
          kegiatan: b.kegiatan,
        }));

        // If date range is provided, check if this aula is available
        let isAvailable = true;
        if (tanggalPinjam && tanggalKembali) {
          const overlappingBooking = bookings.find(
            (b) =>
              b.status !== 'cancel_requested' &&
              b.tanggalPinjam <= tanggalKembali &&
              b.tanggalKembali >= tanggalPinjam
          );
          isAvailable = !overlappingBooking;
        }

        return {
          ...a,
          bookedDates,
          isAvailable,
        };
      })
    );

    return NextResponse.json(
      {
        aula: aulaWithBookings,
        total: aulaWithBookings.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('List aula error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data aula' },
      { status: 500 }
    );
  }
}

// POST - Create a new aula (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat menambah aula.' }, { status: 403 })
    }

    const body = await request.json();
    const { nama, lokasi, kapasitas, luas, jenisKegiatan, fasilitas, deskripsi, status, imageUrl } = body;

    if (!nama || !kapasitas) {
      return NextResponse.json(
        { error: 'Nama dan kapasitas wajib diisi' },
        { status: 400 }
      );
    }

    const aula = await db.aula.create({
      data: {
        nama,
        lokasi: lokasi || null,
        kapasitas: parseInt(String(kapasitas)),
        luas: luas || null,
        jenisKegiatan: jenisKegiatan || 'semua',
        fasilitas: fasilitas ? JSON.stringify(fasilitas) : null,
        deskripsi: deskripsi || null,
        status: status || 'tersedia',
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(
      { message: 'Aula berhasil ditambahkan', aula },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create aula error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menambahkan aula' },
      { status: 500 }
    );
  }
}

// PUT - Update an aula (admin only)
export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat mengubah aula.' }, { status: 403 })
    }

    const body = await request.json();
    const { id, nama, lokasi, kapasitas, luas, jenisKegiatan, fasilitas, deskripsi, status, imageUrl } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID aula wajib diisi' },
        { status: 400 }
      );
    }

    const existing = await db.aula.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Aula tidak ditemukan' },
        { status: 404 }
      );
    }

    const aula = await db.aula.update({
      where: { id },
      data: {
        ...(nama !== undefined && { nama }),
        ...(lokasi !== undefined && { lokasi }),
        ...(kapasitas !== undefined && { kapasitas: parseInt(String(kapasitas)) }),
        ...(luas !== undefined && { luas }),
        ...(jenisKegiatan !== undefined && { jenisKegiatan }),
        ...(fasilitas !== undefined && { fasilitas: fasilitas ? JSON.stringify(fasilitas) : null }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(status !== undefined && { status }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    return NextResponse.json(
      { message: 'Aula berhasil diperbarui', aula },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update aula error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui aula' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an aula (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat menghapus aula.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID aula wajib diisi' },
        { status: 400 }
      );
    }

    const existing = await db.aula.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Aula tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if there are active borrowings
    const activeBorrowings = await db.borrowing.count({
      where: {
        aulaId: id,
        status: { in: ['pending', 'approved', 'cancel_requested'] },
      },
    });

    if (activeBorrowings > 0) {
      return NextResponse.json(
        { error: 'Aula tidak dapat dihapus karena masih ada peminjaman aktif' },
        { status: 400 }
      );
    }

    await db.aula.delete({ where: { id } });

    return NextResponse.json(
      { message: 'Aula berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete aula error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus aula' },
      { status: 500 }
    );
  }
}
