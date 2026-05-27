import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, sendWhatsApp, getEmailTemplate, getWhatsappTemplate } from '@/lib/email';

/**
 * POST /api/borrowing/cancel
 * User-initiated cancellation request.
 * Sets status to "cancel_requested" and saves cancellation details.
 * Only allowed for borrowings in "pending" or "approved" status.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, cancelReason, userId } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'ID peminjaman wajib diisi' },
        { status: 400 }
      );
    }

    if (!cancelReason || cancelReason.trim() === '') {
      return NextResponse.json(
        { error: 'Alasan pembatalan wajib diisi' },
        { status: 400 }
      );
    }

    // Check if borrowing exists
    const existing = await db.borrowing.findUnique({
      where: { id },
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
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify the user owns this borrowing (if userId provided)
    if (userId && existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses untuk membatalkan peminjaman ini' },
        { status: 403 }
      );
    }

    // Only allow cancellation for pending or approved borrowings
    if (existing.status !== 'pending' && existing.status !== 'approved') {
      return NextResponse.json(
        { error: `Peminjaman dengan status "${existing.status}" tidak dapat dibatalkan. Hanya peminjaman berstatus "pending" atau "approved" yang dapat dibatalkan.` },
        { status: 400 }
      );
    }

    // Check if cancellation already requested
    if (existing.status === 'cancel_requested') {
      return NextResponse.json(
        { error: 'Permintaan pembatalan sudah diajukan sebelumnya' },
        { status: 400 }
      );
    }

    // Update the borrowing with cancellation request
    const borrowing = await db.borrowing.update({
      where: { id },
      data: {
        status: 'cancel_requested',
        cancelReason: cancelReason.trim(),
        cancelRequestedAt: new Date(),
        cancelRequestedBy: 'user',
      },
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
    });

    // Send notification to admin about cancellation request (fire-and-forget)
    try {
      const typeLabel = borrowing.type === 'aula' ? 'Aula' : 'Kendaraan';
      const templateVariables = {
        nama: borrowing.user.name,
        kegiatan: borrowing.kegiatan,
        tipe: typeLabel,
        tanggal: `${borrowing.tanggalPinjam} s/d ${borrowing.tanggalKembali}`,
        catatan: cancelReason.trim(),
        nomor_perjanjian: borrowing.nomorPerjanjian || '-',
      };

      // Get admin users to notify
      const admins = await db.user.findMany({
        where: { role: 'admin' },
        select: { email: true, phone: true },
      });

      for (const admin of admins) {
        // Send WhatsApp to admin
        if (admin.phone) {
          const waMessage = await getWhatsappTemplate('cancel_requested', templateVariables);
          sendWhatsApp(admin.phone, waMessage, borrowing.id).catch(() => {});
        }
        // Send email to admin
        const { subject, html } = await getEmailTemplate('cancel_requested', templateVariables);
        sendEmail({
          to: admin.email,
          subject: `[E-Pakar] ${subject}`,
          html,
          borrowingId: borrowing.id,
        }).catch(() => {});
      }
    } catch (notifError) {
      console.error('Cancel notification error (non-blocking):', notifError);
    }

    return NextResponse.json(
      {
        message: 'Permintaan pembatalan berhasil diajukan. Menunggu persetujuan admin.',
        borrowing,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cancel borrowing request error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengajukan pembatalan' },
      { status: 500 }
    );
  }
}
