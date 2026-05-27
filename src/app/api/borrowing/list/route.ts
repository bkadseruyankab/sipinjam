import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // "aula" or "kendaraan"
    const status = searchParams.get('status'); // "pending", "approved", etc.

    // Build where clause
    const where: Prisma.BorrowingWhereInput = {};

    // Filter by userId (if not 'all')
    if (userId && userId !== 'all') {
      where.userId = userId;
    }

    // Filter by type
    if (type) {
      where.type = type;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    const borrowings = await db.borrowing.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            instansi: true,
            role: true,
          },
        },
        kendaraan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform borrowings to include cancellation fields explicitly
    const transformedBorrowings = borrowings.map((b) => ({
      id: b.id,
      userId: b.userId,
      type: b.type,
      status: b.status,
      kegiatan: b.kegiatan,
      tanggalPinjam: b.tanggalPinjam,
      tanggalKembali: b.tanggalKembali,
      waktuMulam: b.waktuMulam,
      waktuSelesai: b.waktuSelesai,
      suratPermohonan: b.suratPermohonan,
      nip: b.nip,
      jumlahPeserta: b.jumlahPeserta,
      jenisKegiatan: b.jenisKegiatan,
      waktuPenggunaan: b.waktuPenggunaan,
      setujuTarif: b.setujuTarif,
      kendaraanId: b.kendaraanId,
      keperluanKendaraan: b.keperluanKendaraan,
      tujuan: b.tujuan,
      jumlahPenumpang: b.jumlahPenumpang,
      sopir: b.sopir,
      catatanAdmin: b.catatanAdmin,
      approvedBy: b.approvedBy,
      approvedAt: b.approvedAt ? new Date(b.approvedAt).toISOString() : null,
      nomorPerjanjian: b.nomorPerjanjian,
      tarif: b.tarif,
      totalBiaya: b.totalBiaya,
      perjanjianText: b.perjanjianText,
      userAcceptedAt: b.userAcceptedAt ? new Date(b.userAcceptedAt).toISOString() : null,
      // Cancellation fields
      cancelReason: b.cancelReason || null,
      cancelRequestedAt: b.cancelRequestedAt ? new Date(b.cancelRequestedAt).toISOString() : null,
      cancelRequestedBy: b.cancelRequestedBy || null,
      cancelApprovedBy: b.cancelApprovedBy || null,
      cancelApprovedAt: b.cancelApprovedAt ? new Date(b.cancelApprovedAt).toISOString() : null,
      createdAt: new Date(b.createdAt).toISOString(),
      updatedAt: new Date(b.updatedAt).toISOString(),
      user: b.user,
      kendaraan: b.kendaraan,
    }));

    return NextResponse.json(
      {
        borrowings: transformedBorrowings,
        total: transformedBorrowings.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('List borrowings error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data peminjaman' },
      { status: 500 }
    );
  }
}
