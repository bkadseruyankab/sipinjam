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

// GET /api/kendaraan — List all vehicles with optional bookedDates info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalPinjam = searchParams.get('tanggalPinjam');
    const tanggalKembali = searchParams.get('tanggalKembali');
    const showAll = searchParams.get('showAll') === 'true';

    // Fetch vehicles — if showAll is true (admin), include all statuses; otherwise exclude maintenance
    const kendaraan = await db.kendaraan.findMany({
      where: showAll
        ? {}
        : { status: { not: 'perawatan' } },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // For each vehicle, find approved/pending borrowings to build bookedDates
    const kendaraanWithBookings = await Promise.all(
      kendaraan.map(async (k) => {
        // Find all approved/pending/cancel_requested borrowings for this vehicle
        const bookings = await db.borrowing.findMany({
          where: {
            kendaraanId: k.id,
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

        // Build bookedDates array with date ranges
        const bookedDates = bookings.map((b) => ({
          id: b.id,
          from: b.tanggalPinjam,
          to: b.tanggalKembali,
          status: b.status,
          kegiatan: b.kegiatan,
        }));

        // If date range is provided, check if this vehicle is available for that range
        let isAvailable = true;
        if (tanggalPinjam && tanggalKembali) {
          // A vehicle is unavailable for the given date range if there's an overlap
          // with an approved/pending booking (not cancel_requested)
          const overlappingBooking = bookings.find(
            (b) =>
              b.status !== 'cancel_requested' &&
              b.tanggalPinjam <= tanggalKembali &&
              b.tanggalKembali >= tanggalPinjam
          );
          isAvailable = !overlappingBooking;
        }

        return {
          ...k,
          bookedDates,
          isAvailable,
        };
      })
    );

    return NextResponse.json(
      {
        kendaraan: kendaraanWithBookings,
        total: kendaraanWithBookings.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('List kendaraan error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data kendaraan' },
      { status: 500 }
    );
  }
}

// POST - Create a new kendaraan (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat menambah kendaraan.' }, { status: 403 })
    }

    const body = await request.json();
    const { nama, jenis, platNomor, kapasitas, status, imageUrl } = body;

    if (!nama || !jenis || !platNomor || !kapasitas) {
      return NextResponse.json(
        { error: 'Nama, jenis, plat nomor, dan kapasitas wajib diisi' },
        { status: 400 }
      );
    }

    const kendaraan = await db.kendaraan.create({
      data: {
        nama,
        jenis,
        platNomor,
        kapasitas: parseInt(String(kapasitas)),
        status: status || 'tersedia',
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(
      { message: 'Kendaraan berhasil ditambahkan', kendaraan },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create kendaraan error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menambahkan kendaraan' },
      { status: 500 }
    );
  }
}

// PUT - Update a kendaraan (admin only)
export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat mengubah kendaraan.' }, { status: 403 })
    }

    const body = await request.json();
    const { id, nama, jenis, platNomor, kapasitas, status, imageUrl } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID kendaraan wajib diisi' },
        { status: 400 }
      );
    }

    const existing = await db.kendaraan.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Kendaraan tidak ditemukan' },
        { status: 404 }
      );
    }

    const kendaraan = await db.kendaraan.update({
      where: { id },
      data: {
        ...(nama !== undefined && { nama }),
        ...(jenis !== undefined && { jenis }),
        ...(platNomor !== undefined && { platNomor }),
        ...(kapasitas !== undefined && { kapasitas: parseInt(String(kapasitas)) }),
        ...(status !== undefined && { status }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    return NextResponse.json(
      { message: 'Kendaraan berhasil diperbarui', kendaraan },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update kendaraan error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui kendaraan' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a kendaraan (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat menghapus kendaraan.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID kendaraan wajib diisi' },
        { status: 400 }
      );
    }

    const existing = await db.kendaraan.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Kendaraan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if there are active borrowings
    const activeBorrowings = await db.borrowing.count({
      where: {
        kendaraanId: id,
        status: { in: ['pending', 'approved', 'cancel_requested'] },
      },
    });

    if (activeBorrowings > 0) {
      return NextResponse.json(
        { error: 'Kendaraan tidak dapat dihapus karena masih ada peminjaman aktif' },
        { status: 400 }
      );
    }

    await db.kendaraan.delete({ where: { id } });

    return NextResponse.json(
      { message: 'Kendaraan berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete kendaraan error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus kendaraan' },
      { status: 500 }
    );
  }
}
