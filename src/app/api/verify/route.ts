import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/verify?token=xxx - Verify a QR code token and return borrowing details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token verifikasi wajib diisi' },
        { status: 400 }
      );
    }

    // Look up the borrowing by qrToken
    const borrowing = await db.borrowing.findUnique({
      where: { qrToken: token },
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
    });

    if (!borrowing) {
      return NextResponse.json(
        { error: 'Dokumen tidak ditemukan atau token tidak valid', valid: false },
        { status: 404 }
      );
    }

    // Determine document validity
    const isValid = borrowing.status === 'approved' || borrowing.status === 'completed';

    // Map status to Indonesian label
    const statusLabel: Record<string, string> = {
      pending: 'Menunggu Persetujuan',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };

    // Document type label
    const typeLabel = borrowing.type === 'aula' ? 'Peminjaman Aula BKAD' : 'Peminjaman Kendaraan Bermotor';

    return NextResponse.json({
      valid: isValid,
      data: {
        type: borrowing.type,
        typeLabel,
        status: borrowing.status,
        statusLabel: statusLabel[borrowing.status] || borrowing.status,
        kegiatan: borrowing.kegiatan,
        tanggalPinjam: borrowing.tanggalPinjam,
        tanggalKembali: borrowing.tanggalKembali,
        userName: borrowing.user.name,
        userInstansi: borrowing.user.instansi || null,
        nomorPerjanjian: borrowing.nomorPerjanjian || null,
        paymentStatus: borrowing.paymentStatus,
        approvedAt: borrowing.approvedAt
          ? new Date(borrowing.approvedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : null,
        approvedBy: borrowing.approvedBy || null,
        kendaraan: borrowing.kendaraan
          ? {
              nama: borrowing.kendaraan.nama,
              platNomor: borrowing.kendaraan.platNomor,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat verifikasi', valid: false },
      { status: 500 }
    );
  }
}
