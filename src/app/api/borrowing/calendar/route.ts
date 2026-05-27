import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // "aula" or "kendaraan"
    const month = searchParams.get('month'); // 1-12
    const year = searchParams.get('year'); // e.g. 2024

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Parameter month dan year wajib diisi' },
        { status: 400 }
      );
    }

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: 'Month harus antara 1-12' },
        { status: 400 }
      );
    }

    // Build date range for the month
    // tanggalPinjam and tanggalKembali are stored as strings (YYYY-MM-DD format)
    // We need to find borrowings where the date range overlaps with the requested month
    const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
    
    // Calculate end of month
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Optional status filter (default: show all non-cancelled)
    const statusParam = searchParams.get('status');

    // Build where clause
    const where: Prisma.BorrowingWhereInput = {
      // Borrowing overlaps with the requested month if:
      // tanggalPinjam <= endDate AND tanggalKembali >= startDate
      AND: [
        { tanggalPinjam: { lte: endDate } },
        { tanggalKembali: { gte: startDate } },
      ],
    };

    // Filter by type
    if (type) {
      where.type = type;
    }

    // Filter by status: default shows all except cancelled
    if (statusParam) {
      where.status = { in: statusParam.split(',') };
    } else {
      where.status = { in: ['pending', 'approved', 'completed', 'cancel_requested'] };
    }

    const borrowings = await db.borrowing.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            instansi: true,
          },
        },
        kendaraan: true,
      },
      orderBy: {
        tanggalPinjam: 'asc',
      },
    });

    // Transform into calendar events
    const events = borrowings.map((b) => ({
      id: b.id,
      title: b.kegiatan,
      start: b.tanggalPinjam,
      end: b.tanggalKembali,
      type: b.type,
      status: b.status,
      user: b.user.name,
      kendaraan: b.kendaraan?.nama || undefined,
      waktuMulai: b.waktuMulam,
      waktuSelesai: b.waktuSelesai,
    }));

    return NextResponse.json(
      {
        events,
        month: monthNum,
        year: yearNum,
        total: events.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Calendar borrowings error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data kalender' },
      { status: 500 }
    );
  }
}
